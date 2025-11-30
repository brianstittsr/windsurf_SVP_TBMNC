# TBMNC Customer Tracking System

A modern web application for managing Toyota Battery Manufacturing North Carolina (TBMNC) supplier qualification process.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/strategicvalue/tbmnc-tracker.git
cd tbmnc-tracker

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development environment (Docker + Database)
npm run dev:docker

# Setup database
npm run db:create
npm run db:migrate
npm run db:seed

# Start development servers
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Database Admin:** http://localhost:8080

## 📦 Project Structure

```
tbmnc-tracker/
├── packages/
│   ├── backend/          # Node.js + Express API
│   └── frontend/         # React + TypeScript app
├── docker-compose.yml    # Development services
├── package.json          # Root package configuration
└── README.md            # This file
```

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start all services
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only
npm run dev:docker       # Start Docker services

# Database
npm run db:create        # Create database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed test data
npm run db:reset         # Reset database

# Testing
npm run test             # Run all tests
npm run test:e2e         # End-to-end tests
npm run lint             # Lint code
npm run format           # Format code

# Build & Deploy
npm run build            # Build all packages
npm run deploy:staging   # Deploy to staging
npm run deploy:production # Deploy to production
```

## 🏗️ Technology Stack

- **Frontend:** React 18, TypeScript, TailwindCSS, React Query
- **Backend:** Node.js 20, Express, TypeScript, TypeORM
- **Database:** PostgreSQL 15, Redis 7
- **Cloud:** AWS (ECS, S3, CloudFront)
- **Auth:** Auth0 with RBAC
- **Monitoring:** DataDog, Sentry

## 📚 Documentation

- [Product Brief](../product-brief-tbmnc-tracker.md)
- [Technical Specifications](../tech-spec-tbmnc-tracker.md)
- [User Stories](../user-stories-tbmnc-tracker.md)
- [Implementation Workflow](../workflow-implementation.md)

## 🔐 Security

- All sensitive data encrypted at rest (AES-256)
- TLS 1.3 for data in transit
- Auth0 authentication with RBAC
- Regular security audits
- SOC 2 Type II compliance

## 📊 Success Metrics

- Registration completion rate: >90%
- Document submission rate: >95%
- Time to qualification: <60 days
- System uptime: 99.9%
- API response time: <500ms

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## 📝 License

Proprietary - Strategic Value Plus

## 📧 Contact

- **Technical Lead:** [Your email]
- **Project Manager:** [Your email]
- **Support:** support@strategicvalue.com
