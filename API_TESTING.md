# API Testing Guide - TBMNC Tracker

## 🧪 Testing the API

This guide provides examples for testing all API endpoints using `curl`, Postman, or any HTTP client.

---

## 📍 Base URL

**Local Development**: `http://localhost:3000/api/v1`

---

## 🔍 Health Check

### Check API Health
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-01T02:00:00.000Z",
  "version": "1.0.0"
}
```

---

## 📊 API Info

### Get API Information
```bash
curl http://localhost:3000/api/v1
```

**Response:**
```json
{
  "name": "TBMNC Tracker API",
  "version": "1.0.0",
  "status": "operational",
  "database": "Firebase Firestore",
  "endpoints": {
    "customers": "/api/v1/customers",
    "documents": "/api/v1/documents",
    "analytics": "/api/v1/analytics"
  }
}
```

---

## 👥 Customer Endpoints

### 1. Get All Customers
```bash
curl http://localhost:3000/api/v1/customers
```

**With Filters:**
```bash
# Filter by status
curl "http://localhost:3000/api/v1/customers?status=active"

# Filter by stage
curl "http://localhost:3000/api/v1/customers?stage=2"

# Filter by assigned user
curl "http://localhost:3000/api/v1/customers?assignedTo=user-id-123"

# Multiple filters
curl "http://localhost:3000/api/v1/customers?status=active&stage=2"
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "customer-1",
      "companyName": "Acme Battery Components",
      "status": "active",
      "currentStage": 2,
      "contactEmail": "contact@acme.com",
      "createdAt": "2024-12-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Get Customer by ID
```bash
curl http://localhost:3000/api/v1/customers/customer-1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "customer-1",
    "companyName": "Acme Battery Components",
    "legalName": "Acme Battery Components LLC",
    "taxId": "12-3456789",
    "companySize": "medium",
    "annualRevenue": 5000000,
    "yearsInBusiness": 8,
    "status": "active",
    "currentStage": 2,
    "contactPerson": "John Doe",
    "contactEmail": "john@acme.com",
    "contactPhone": "+1-555-0101",
    "createdAt": "2024-12-01T00:00:00.000Z",
    "updatedAt": "2024-12-01T00:00:00.000Z"
  }
}
```

### 3. Create Customer
```bash
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "New Battery Corp",
    "legalName": "New Battery Corporation",
    "taxId": "98-7654321",
    "companySize": "small",
    "annualRevenue": 1000000,
    "yearsInBusiness": 3,
    "status": "pending",
    "currentStage": 1,
    "contactPerson": "Jane Smith",
    "contactEmail": "jane@newbattery.com",
    "contactPhone": "+1-555-0202",
    "tags": ["startup", "battery-tech"]
  }'
```

**Minimal Example:**
```bash
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Quick Test Corp",
    "contactEmail": "test@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": "generated-id-123",
    "companyName": "New Battery Corp",
    "status": "pending",
    "currentStage": 1,
    "createdAt": "2024-12-01T02:00:00.000Z"
  }
}
```

### 4. Update Customer
```bash
curl -X PUT http://localhost:3000/api/v1/customers/customer-1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "currentStage": 3,
    "notes": "Progressing well through qualification"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "id": "customer-1",
    "companyName": "Acme Battery Components",
    "status": "active",
    "currentStage": 3,
    "updatedAt": "2024-12-01T02:05:00.000Z"
  }
}
```

### 5. Delete Customer
```bash
curl -X DELETE http://localhost:3000/api/v1/customers/customer-1
```

**Response:**
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

### 6. Get Customer Qualification Stages
```bash
curl http://localhost:3000/api/v1/customers/customer-1/stages
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "stage-1",
      "customerId": "customer-1",
      "stageNumber": 1,
      "stageName": "Initial Registration",
      "status": "completed",
      "startedAt": "2024-11-01T00:00:00.000Z",
      "completedAt": "2024-11-05T00:00:00.000Z"
    },
    {
      "id": "stage-2",
      "customerId": "customer-1",
      "stageNumber": 2,
      "stageName": "Documentation Review",
      "status": "in_progress",
      "startedAt": "2024-11-05T00:00:00.000Z"
    }
  ]
}
```

### 7. Get Customer Documents
```bash
curl http://localhost:3000/api/v1/customers/customer-1/documents
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "doc-1",
      "customerId": "customer-1",
      "documentType": "business_license",
      "fileName": "business-license.pdf",
      "fileSize": 1024000,
      "status": "approved",
      "uploadedBy": "admin-user-1",
      "createdAt": "2024-11-10T00:00:00.000Z"
    }
  ]
}
```

### 8. Get Customer Progress
```bash
curl http://localhost:3000/api/v1/customers/customer-1/progress
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customerId": "customer-1",
    "companyName": "Acme Battery Components",
    "currentStage": 2,
    "totalStages": 7,
    "completedStages": 1,
    "progress": 14,
    "stages": [...]
  }
}
```

---

## 📈 Analytics Endpoints

### 1. Get Dashboard Metrics
```bash
curl http://localhost:3000/api/v1/analytics/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 15,
    "activeCustomers": 12,
    "qualifiedCustomers": 3,
    "pendingReviews": 5,
    "averageQualificationTime": 45,
    "stageDistribution": {
      "1": 3,
      "2": 5,
      "3": 4,
      "4": 2,
      "5": 1
    },
    "statusDistribution": {
      "active": 12,
      "pending": 2,
      "qualified": 1
    },
    "lastUpdated": "2024-12-01T02:00:00.000Z"
  }
}
```

### 2. Get Pipeline Overview
```bash
curl http://localhost:3000/api/v1/analytics/pipeline
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stages": [
      {
        "stageNumber": 1,
        "stageName": "Initial Registration",
        "customerCount": 3,
        "averageTimeInStage": 5,
        "completionRate": 100
      },
      {
        "stageNumber": 2,
        "stageName": "Documentation Review",
        "customerCount": 5,
        "averageTimeInStage": 10,
        "completionRate": 85
      }
    ],
    "lastUpdated": "2024-12-01T02:00:00.000Z"
  }
}
```

### 3. Get Customer Analytics
```bash
curl http://localhost:3000/api/v1/analytics/customers/customer-1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customerId": "customer-1",
    "companyName": "Acme Battery Components",
    "currentStage": 2,
    "status": "active",
    "totalStages": 3,
    "completedStages": 1,
    "totalDocuments": 5,
    "totalCommunications": 12,
    "createdAt": "2024-11-01T00:00:00.000Z",
    "updatedAt": "2024-12-01T00:00:00.000Z"
  }
}
```

### 4. Refresh Analytics Metrics
```bash
curl -X POST http://localhost:3000/api/v1/analytics/refresh
```

**Response:**
```json
{
  "success": true,
  "message": "Metrics refreshed successfully",
  "data": {
    "totalCustomers": 15,
    "activeCustomers": 12,
    "lastUpdated": "2024-12-01T02:10:00.000Z"
  }
}
```

---

## 📄 Document Endpoints

### Get All Documents (Placeholder)
```bash
curl http://localhost:3000/api/v1/documents
```

**Response:**
```json
{
  "success": true,
  "message": "Document endpoints coming soon",
  "data": []
}
```

---

## 🧪 Testing Workflows

### Complete Customer Lifecycle Test

```bash
# 1. Create a new customer
CUSTOMER_ID=$(curl -s -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Test Corp","contactEmail":"test@corp.com"}' \
  | jq -r '.data.id')

echo "Created customer: $CUSTOMER_ID"

# 2. Get customer details
curl http://localhost:3000/api/v1/customers/$CUSTOMER_ID

# 3. Update customer
curl -X PUT http://localhost:3000/api/v1/customers/$CUSTOMER_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"active","currentStage":2}'

# 4. Get customer progress
curl http://localhost:3000/api/v1/customers/$CUSTOMER_ID/progress

# 5. Get customer analytics
curl http://localhost:3000/api/v1/analytics/customers/$CUSTOMER_ID

# 6. Delete customer (cleanup)
curl -X DELETE http://localhost:3000/api/v1/customers/$CUSTOMER_ID
```

---

## 🔧 PowerShell Examples (Windows)

### Create Customer
```powershell
$body = @{
    companyName = "Test Corporation"
    contactEmail = "test@example.com"
    status = "pending"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/customers" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### Get All Customers
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/customers"
```

### Update Customer
```powershell
$customerId = "customer-1"
$body = @{
    status = "active"
    currentStage = 3
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/customers/$customerId" `
    -Method Put `
    -ContentType "application/json" `
    -Body $body
```

---

## 🐛 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "companyName",
      "message": "Company name is required"
    }
  ]
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Customer not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details..."
}
```

---

## 📊 Response Format

All API responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Optional success message",
  "data": { /* response data */ },
  "count": 10  // For list endpoints
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [/* validation errors */]
}
```

---

## 🔐 Authentication (Coming Soon)

When authentication is implemented, include the token in requests:

```bash
curl http://localhost:3000/api/v1/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📝 Tips

1. **Use `jq` for JSON formatting**: `curl ... | jq`
2. **Save responses**: `curl ... > response.json`
3. **Verbose output**: `curl -v ...`
4. **Follow redirects**: `curl -L ...`
5. **Timing**: `curl -w "@curl-format.txt" ...`

---

## 🚀 Next Steps

1. Import Postman collection (coming soon)
2. Run automated tests
3. Set up CI/CD testing
4. Add authentication tests
5. Performance testing

---

**Happy Testing! 🧪**
