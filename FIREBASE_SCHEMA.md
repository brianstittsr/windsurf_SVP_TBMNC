# Firebase Data Schema - TBMNC Tracker

## Overview

This document describes the Firestore database schema for the TBMNC Customer Tracking System.

## Collections

### 1. Users Collection (`users`)

Stores user profile information and roles.

```typescript
interface User {
  id: string;                    // Document ID (matches Auth UID)
  auth0Id: string;               // Auth0 user ID
  email: string;                 // User email
  name: string;                  // Full name
  role: 'admin' | 'manager' | 'viewer';  // User role
  isActive: boolean;             // Account status
  lastLogin: Timestamp | null;   // Last login time
  createdAt: Timestamp;          // Account creation
  updatedAt: Timestamp;          // Last update
  photoURL?: string;             // Profile photo URL
  phoneNumber?: string;          // Contact number
}
```

**Indexes:**
- `email` (unique)
- `role` + `isActive`
- `createdAt` (descending)

---

### 2. Customers Collection (`customers`)

Main collection for customer/supplier information.

```typescript
interface Customer {
  id: string;                    // Document ID (auto-generated)
  companyName: string;           // Company display name
  legalName?: string;            // Legal business name
  taxId?: string;                // Tax identification number
  companySize?: 'small' | 'medium' | 'large';
  annualRevenue?: number;        // Annual revenue in USD
  yearsInBusiness?: number;      // Years operating
  status: 'active' | 'inactive' | 'pending' | 'qualified' | 'disqualified';
  currentStage: number;          // Current qualification stage (1-7)
  assignedToId?: string;         // User ID of assigned manager
  assignedToName?: string;       // Denormalized for quick access
  
  // Contact information
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;             // User ID
  tags?: string[];               // Custom tags
  notes?: string;                // General notes
}
```

**Indexes:**
- `status` + `createdAt` (desc)
- `currentStage` + `updatedAt` (desc)
- `assignedToId` + `status`
- `companyName` (for search)

**Subcollections:**
- `qualificationStages`
- `documents`
- `communications`

---

### 3. Qualification Stages Subcollection (`customers/{customerId}/qualificationStages`)

Tracks progress through qualification stages.

```typescript
interface QualificationStage {
  id: string;                    // Document ID (auto-generated)
  customerId: string;            // Parent customer ID (denormalized)
  stageNumber: number;           // Stage number (1-7)
  stageName: string;             // Stage name
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  startedAt?: Timestamp;         // When stage started
  completedAt?: Timestamp;       // When stage completed
  notes?: string;                // Stage-specific notes
  blockers?: string[];           // List of blocking issues
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Stage Names:**
1. Initial Registration
2. Documentation Review
3. Stakeholder Assignment
4. Capability Assessment
5. Quality Audit
6. Contract Negotiation
7. Final Approval

**Indexes:**
- `customerId` + `stageNumber`
- `status` + `updatedAt` (desc)

---

### 4. Documents Subcollection (`customers/{customerId}/documents`)

Stores document metadata (files stored in Firebase Storage).

```typescript
interface Document {
  id: string;                    // Document ID (auto-generated)
  customerId: string;            // Parent customer ID (denormalized)
  documentType: 'business_license' | 'financial_statement' | 'iso_certification' | 
                'quality_manual' | 'capability_statement' | 'contract' | 'other';
  fileName: string;              // Original file name
  fileSize: number;              // Size in bytes
  mimeType: string;              // MIME type
  storagePath: string;           // Firebase Storage path
  downloadURL: string;           // Public download URL
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expiresAt?: Timestamp;         // Expiration date (for certifications)
  uploadedBy: string;            // User ID
  uploadedByName: string;        // Denormalized
  reviewedBy?: string;           // User ID of reviewer
  reviewedAt?: Timestamp;        // Review timestamp
  reviewNotes?: string;          // Review comments
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes:**
- `customerId` + `status` + `createdAt` (desc)
- `documentType` + `status`
- `expiresAt` (for expiration alerts)

---

### 5. Communications Subcollection (`customers/{customerId}/communications`)

Tracks all communications with customers.

```typescript
interface Communication {
  id: string;                    // Document ID (auto-generated)
  customerId: string;            // Parent customer ID (denormalized)
  type: 'email' | 'phone' | 'meeting' | 'notification' | 'note';
  subject: string;               // Communication subject
  message: string;               // Message content
  sentBy: string;                // User ID
  sentByName: string;            // Denormalized
  sentAt: Timestamp;             // When sent
  readAt?: Timestamp;            // When read (for notifications)
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: {
    fileName: string;
    storagePath: string;
    downloadURL: string;
  }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes:**
- `customerId` + `sentAt` (desc)
- `type` + `sentAt` (desc)
- `sentBy` + `sentAt` (desc)

---

### 6. Analytics Collection (`analytics`)

Aggregated analytics data (updated by Cloud Functions).

```typescript
interface DashboardMetrics {
  id: 'dashboard';               // Fixed document ID
  totalCustomers: number;
  activeCustomers: number;
  qualifiedCustomers: number;
  pendingReviews: number;
  averageQualificationTime: number;  // Days
  stageDistribution: {
    [stageNumber: number]: number;
  };
  statusDistribution: {
    [status: string]: number;
  };
  lastUpdated: Timestamp;
}

interface PipelineOverview {
  id: 'pipeline';                // Fixed document ID
  stages: {
    stageNumber: number;
    stageName: string;
    customerCount: number;
    averageTimeInStage: number;  // Days
    completionRate: number;      // Percentage
  }[];
  lastUpdated: Timestamp;
}
```

---

## Data Relationships

```
users (collection)
  └─ {userId} (document)

customers (collection)
  └─ {customerId} (document)
      ├─ qualificationStages (subcollection)
      │   └─ {stageId} (document)
      ├─ documents (subcollection)
      │   └─ {documentId} (document)
      └─ communications (subcollection)
          └─ {commId} (document)

analytics (collection)
  ├─ dashboard (document)
  └─ pipeline (document)
```

---

## Firebase Storage Structure

```
/documents
  /{customerId}
    /{documentId}.{ext}

/profiles
  /{userId}
    /avatar.{ext}
```

---

## Security Rules Summary

- **Users**: Read by all authenticated users, write by owner or admin
- **Customers**: Read by all authenticated, write by managers/admins
- **Subcollections**: Follow parent permissions
- **Analytics**: Read-only for users, write by server only
- **Storage**: Read by authenticated, write by managers with file validation

---

## Indexes Required

All indexes are defined in `firestore.indexes.json` and include:

1. Composite indexes for filtered queries
2. Collection group indexes for subcollection queries
3. Ordering indexes for pagination

---

## Migration from PostgreSQL

Key differences from the previous PostgreSQL schema:

1. **No foreign keys**: Firestore uses denormalization and references
2. **Subcollections**: Related data stored as subcollections instead of separate tables
3. **Timestamps**: Using Firebase Timestamp type instead of PostgreSQL TIMESTAMP
4. **No joins**: Data is denormalized for query performance
5. **Document IDs**: Auto-generated or custom strings instead of UUIDs

---

## Best Practices

1. **Denormalize frequently accessed data** (e.g., assignedToName)
2. **Use subcollections** for one-to-many relationships
3. **Batch writes** for related updates
4. **Use transactions** for atomic operations
5. **Implement pagination** using startAfter/limit
6. **Cache analytics** data to reduce reads
7. **Use Cloud Functions** for complex aggregations

---

## Example Queries

### Get active customers by stage
```typescript
db.collection('customers')
  .where('status', '==', 'active')
  .where('currentStage', '==', 2)
  .orderBy('updatedAt', 'desc')
  .limit(20)
```

### Get customer's qualification stages
```typescript
db.collection('customers')
  .doc(customerId)
  .collection('qualificationStages')
  .orderBy('stageNumber', 'asc')
```

### Get pending documents across all customers
```typescript
db.collectionGroup('documents')
  .where('status', '==', 'pending')
  .orderBy('createdAt', 'desc')
```

---

## Cloud Functions Triggers

Recommended Cloud Functions:

1. **onCustomerCreate**: Initialize qualification stages
2. **onStageComplete**: Update customer currentStage
3. **onDocumentUpload**: Send notification
4. **updateAnalytics**: Scheduled function to update analytics
5. **sendExpirationAlerts**: Check document expiration dates
