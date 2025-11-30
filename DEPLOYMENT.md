# TBMNC Tracker - Deployment Guide

## Overview

This guide covers deploying the TBMNC Tracker application to AWS using ECS, RDS, and CloudFront.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- Docker installed locally
- Node.js 20+ installed
- Domain name (optional, for custom domain)

## Architecture

```
┌─────────────────┐
│   CloudFront    │ (CDN for frontend)
└────────┬────────┘
         │
┌────────▼────────┐
│   S3 Bucket     │ (Static frontend assets)
└─────────────────┘

┌─────────────────┐
│  Application    │
│  Load Balancer  │
└────────┬────────┘
         │
┌────────▼────────┐
│   ECS Fargate   │ (Backend containers)
└────────┬────────┘
         │
    ┌────▼─────┬──────────┐
    │          │          │
┌───▼───┐  ┌──▼───┐  ┌──▼────┐
│  RDS  │  │Redis │  │   S3  │
│Postgres│ │ElastiCache│ │(Docs)│
└───────┘  └──────┘  └───────┘
```

## Environment Setup

### 1. Create AWS Resources

#### RDS PostgreSQL Database

```bash
aws rds create-db-instance \
  --db-instance-identifier tbmnc-tracker-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username tbmnc_admin \
  --master-user-password <SECURE_PASSWORD> \
  --allocated-storage 100 \
  --storage-type gp3 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name tbmnc-db-subnet \
  --backup-retention-period 7 \
  --multi-az \
  --storage-encrypted
```

#### ElastiCache Redis

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id tbmnc-tracker-redis \
  --cache-node-type cache.t3.medium \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --cache-subnet-group-name tbmnc-cache-subnet \
  --security-group-ids sg-xxxxx
```

#### S3 Buckets

```bash
# Frontend assets
aws s3 mb s3://tbmnc-tracker-frontend-prod

# Document storage
aws s3 mb s3://tbmnc-tracker-documents-prod

# Enable versioning for documents
aws s3api put-bucket-versioning \
  --bucket tbmnc-tracker-documents-prod \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket tbmnc-tracker-documents-prod \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### 2. Configure Secrets Manager

```bash
# Database credentials
aws secretsmanager create-secret \
  --name tbmnc-tracker/prod/database \
  --secret-string '{
    "username": "tbmnc_admin",
    "password": "<SECURE_PASSWORD>",
    "host": "tbmnc-tracker-prod.xxxxx.us-east-1.rds.amazonaws.com",
    "port": 5432,
    "database": "tbmnc_prod"
  }'

# Auth0 credentials
aws secretsmanager create-secret \
  --name tbmnc-tracker/prod/auth0 \
  --secret-string '{
    "domain": "your-domain.auth0.com",
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "audience": "https://api.tbmnc-tracker.com"
  }'

# AWS credentials for S3
aws secretsmanager create-secret \
  --name tbmnc-tracker/prod/aws \
  --secret-string '{
    "accessKeyId": "AKIAXXXXX",
    "secretAccessKey": "xxxxx",
    "region": "us-east-1",
    "documentsBucket": "tbmnc-tracker-documents-prod"
  }'
```

### 3. Build and Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Create ECR repository
aws ecr create-repository --repository-name tbmnc-tracker-backend

# Build and push backend image
cd packages/backend
docker build -t tbmnc-tracker-backend .
docker tag tbmnc-tracker-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/tbmnc-tracker-backend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/tbmnc-tracker-backend:latest
```

### 4. Deploy Backend to ECS

Create ECS task definition (`task-definition.json`):

```json
{
  "family": "tbmnc-tracker-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/tbmnc-tracker-task-role",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/tbmnc-tracker-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:tbmnc-tracker/prod/database"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/tbmnc-tracker-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Deploy:

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create ECS service
aws ecs create-service \
  --cluster tbmnc-tracker-cluster \
  --service-name tbmnc-tracker-backend \
  --task-definition tbmnc-tracker-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-xxxxx,subnet-yyyyy],
    securityGroups=[sg-xxxxx],
    assignPublicIp=ENABLED
  }" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=3000"
```

### 5. Deploy Frontend to S3/CloudFront

```bash
# Build frontend
cd packages/frontend
npm run build

# Sync to S3
aws s3 sync dist/ s3://tbmnc-tracker-frontend-prod --delete

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name tbmnc-tracker-frontend-prod.s3.amazonaws.com \
  --default-root-object index.html

# Invalidate CloudFront cache after deployment
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

### 6. Run Database Migrations

```bash
# Connect to ECS task or run as one-off task
aws ecs run-task \
  --cluster tbmnc-tracker-cluster \
  --task-definition tbmnc-tracker-backend \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-xxxxx],
    securityGroups=[sg-xxxxx],
    assignPublicIp=ENABLED
  }" \
  --overrides '{
    "containerOverrides": [{
      "name": "backend",
      "command": ["npm", "run", "db:migrate"]
    }]
  }'
```

## Monitoring and Logging

### CloudWatch Logs

All application logs are sent to CloudWatch Logs:

- Backend: `/ecs/tbmnc-tracker-backend`
- Access logs: `/aws/elasticloadbalancing/app/tbmnc-tracker`

### CloudWatch Alarms

Set up alarms for:

```bash
# High CPU usage
aws cloudwatch put-metric-alarm \
  --alarm-name tbmnc-backend-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold

# High error rate
aws cloudwatch put-metric-alarm \
  --alarm-name tbmnc-backend-high-errors \
  --alarm-description "Alert when error rate exceeds 5%" \
  --metric-name 5XXError \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold
```

## Backup and Disaster Recovery

### Database Backups

- Automated daily backups (7-day retention)
- Manual snapshots before major deployments

```bash
# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier tbmnc-tracker-prod \
  --db-snapshot-identifier tbmnc-tracker-prod-$(date +%Y%m%d)
```

### Document Backups

- S3 versioning enabled
- Cross-region replication configured
- Lifecycle policies for archival

## Rollback Procedure

### Backend Rollback

```bash
# Update service to previous task definition
aws ecs update-service \
  --cluster tbmnc-tracker-cluster \
  --service tbmnc-tracker-backend \
  --task-definition tbmnc-tracker-backend:PREVIOUS_VERSION
```

### Frontend Rollback

```bash
# Restore previous S3 version
aws s3 sync s3://tbmnc-tracker-frontend-prod-backup/ s3://tbmnc-tracker-frontend-prod/ --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

## Security Checklist

- [ ] All secrets stored in AWS Secrets Manager
- [ ] Database encryption at rest enabled
- [ ] S3 bucket encryption enabled
- [ ] VPC security groups properly configured
- [ ] IAM roles follow least privilege principle
- [ ] CloudFront HTTPS only
- [ ] WAF rules configured
- [ ] Backup and recovery tested
- [ ] Monitoring and alerting configured
- [ ] Access logs enabled

## Cost Optimization

- Use Reserved Instances for predictable workloads
- Enable S3 Intelligent-Tiering
- Configure CloudFront caching policies
- Use Spot Instances for non-critical tasks
- Monitor and optimize RDS instance size

## Support and Troubleshooting

### Common Issues

**Issue: Database connection timeout**
- Check security group rules
- Verify RDS instance is running
- Check connection string in Secrets Manager

**Issue: High latency**
- Check CloudFront cache hit ratio
- Review database query performance
- Scale ECS tasks if needed

**Issue: 5XX errors**
- Check CloudWatch logs
- Verify all environment variables are set
- Check database connectivity

## Maintenance Windows

Schedule maintenance during low-traffic periods:

```bash
# Update RDS maintenance window
aws rds modify-db-instance \
  --db-instance-identifier tbmnc-tracker-prod \
  --preferred-maintenance-window sun:03:00-sun:04:00
```

## Contact

For deployment issues, contact:
- DevOps Team: devops@strategicvalueplus.com
- On-call: +1-XXX-XXX-XXXX
