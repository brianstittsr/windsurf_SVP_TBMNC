# Firebase Schema V2.0 - Enhanced TBMNC Tracker

## 📊 Overview

Enhanced schema supporting three user roles (Suppliers, Affiliates, Admins) with comprehensive tracking, automation, and workflow management.

---

## 🗂️ Collections Structure

```
firestore/
├── users/                    # All system users
├── suppliers/                # Supplier companies (enhanced)
│   ├── {supplierId}/
│   │   ├── stages/          # Qualification stages
│   │   ├── documents/       # Uploaded documents
│   │   ├── communications/  # Communication history
│   │   └── notes/           # Admin/affiliate notes
├── affiliates/              # Service provider partners (NEW)
├── deliverables/            # Time-tracked deliverables (NEW)
├── assignments/             # Affiliate-supplier assignments (NEW)
├── alerts/                  # System alerts and notifications (NEW)
├── analytics/               # System analytics
└── _meta/                   # System metadata
```

---

## 👤 users Collection

Enhanced to support multiple roles.

```typescript
interface User {
  id: string;
  email: string;
  role: 'admin' | 'affiliate' | 'supplier' | 'viewer';
  
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    timezone?: string;
  };
  
  // Role-specific references
  supplierId?: string;      // If role === 'supplier'
  affiliateId?: string;     // If role === 'affiliate'
  
  // Permissions
  permissions: string[];
  
  // Preferences
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    alertTypes: string[];
    dashboardLayout?: any;
  };
  
  // Activity
  lastLogin: Timestamp;
  lastActivity: Timestamp;
  
  // Status
  status: 'active' | 'inactive' | 'pending';
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
}
```

**Indexes:**
- `role` + `status`
- `email` (unique)
- `supplierId`
- `affiliateId`

---

## 🏢 suppliers Collection (Enhanced)

Comprehensive supplier profiles with TBMNC-specific data.

```typescript
interface Supplier {
  id: string;
  
  // Basic Information
  companyName: string;
  legalName: string;
  dba?: string;
  taxId: string;
  yearEstablished: number;
  
  // Company Size & Structure
  companySize: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
  employeeCount: number;
  annualRevenue: string; // Range
  
  // Locations
  headquarters: Address;
  facilities: Facility[];
  
  // === ENHANCED BUSINESS PROFILE ===
  
  businessProfile: {
    // Core Activities
    coreActivities: string[];
    primaryProducts: string[];
    primaryServices: string[];
    industrySectors: string[];
    manufacturingCapabilities: string[];
    technologyPlatforms: string[];
    
    // Target Markets
    targetMarkets: string[];
    geographicReach: string[];
    customerBase: string;
  };
  
  // Battery Industry Experience
  batteryExperience: {
    hasExperience: boolean;
    yearsInIndustry: number;
    batteryTypes: string[]; // Li-ion, solid-state, etc.
    batteryComponents: string[]; // Cells, modules, packs, etc.
    currentBatteryCustomers: string[];
    relevantProducts: string[];
    batteryRevenue: string; // Percentage or amount
  };
  
  // Automotive Industry Experience
  automotiveExperience: {
    hasExperience: boolean;
    yearsInIndustry: number;
    currentOEMs: string[];
    tierLevel: 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4' | 'none';
    automotiveRevenue: string;
    oemCertifications: string[];
  };
  
  // Technical Capabilities
  technicalCapabilities: {
    // Manufacturing
    productionCapacity: {
      volume: string;
      unit: string;
      scalability: string;
    };
    equipmentList: Equipment[];
    automationLevel: 'manual' | 'semi-automated' | 'fully-automated';
    
    // Quality Control
    qualityControlSystems: string[];
    testingCapabilities: string[];
    inspectionEquipment: string[];
    
    // R&D
    rdCapabilities: {
      hasRD: boolean;
      rdBudget: string;
      rdStaff: number;
      focusAreas: string[];
    };
    
    // Innovation
    patents: number;
    trademarks: number;
    proprietaryTechnology: string[];
    technologyPartnerships: string[];
  };
  
  // Quality & Certifications
  certifications: {
    // Quality
    iso9001: CertificationDetail;
    iatf16949: CertificationDetail;
    
    // Environmental
    iso14001: CertificationDetail;
    
    // Safety
    iso45001: CertificationDetail;
    
    // Other
    other: CertificationDetail[];
    
    // Quality Management
    qualityManagementSystem: string;
    continuousImprovementPrograms: string[];
  };
  
  // Financial Information
  financialInfo: {
    revenueRange: string;
    profitability: string;
    creditRating: string;
    bankingRelationships: string[];
    investmentCapacity: string;
    insuranceCoverage: {
      general: boolean;
      professional: boolean;
      product: boolean;
      cyber: boolean;
    };
  };
  
  // Compliance & Sustainability
  sustainability: {
    // Environmental
    carbonFootprint: string;
    carbonReductionGoals: string;
    sustainabilityInitiatives: string[];
    environmentalCompliance: boolean;
    
    // Waste & Energy
    wasteManagement: string;
    energyEfficiency: string;
    renewableEnergy: boolean;
    
    // Social Responsibility
    socialResponsibilityPrograms: string[];
    diversityInitiatives: string[];
    communityEngagement: string[];
  };
  
  // Supply Chain
  supplyChain: {
    structure: string;
    keySuppliers: Supplier[];
    supplierDiversity: string;
    managementSystem: string;
    riskManagement: string;
    logisticsCapabilities: string[];
    geographicReach: string[];
  };
  
  // TBMNC Alignment
  tbmncAlignment: {
    // Motivation
    motivation: string;
    understandingOfToyotaValues: string;
    longTermCommitment: string;
    
    // Specific Capabilities
    specificCapabilitiesForTBMNC: string[];
    proposedProducts: string[];
    proposedServices: string[];
    
    // Investment
    investmentReadiness: string;
    proposedInvestments: string;
    capabilityDevelopmentTimeline: string;
    resourceAllocation: string;
  };
  
  // === TRACKING & MANAGEMENT ===
  
  // Current Status
  status: 'pending' | 'active' | 'qualified' | 'rejected' | 'on-hold';
  currentStage: number;
  progressPercentage: number;
  
  // Time Tracking
  daysInCurrentStage: number;
  totalDaysInProcess: number;
  estimatedCompletionDate: Timestamp;
  
  // Risk Assessment
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  
  // Assignments
  assignedAffiliates: string[]; // affiliate IDs
  primaryContact: string; // affiliate ID
  
  // Team
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  team: TeamMember[];
  
  // Onboarding
  onboardingCompleted: boolean;
  onboardingStep: number; // Current step in wizard (1-10)
  onboardingStartedAt: Timestamp;
  onboardingCompletedAt?: Timestamp;
  
  // Tags & Categories
  tags: string[];
  categories: string[];
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastModifiedBy: string;
}

interface CertificationDetail {
  certified: boolean;
  certificationNumber?: string;
  issuingBody?: string;
  issueDate?: Timestamp;
  expiryDate?: Timestamp;
  scope?: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Facility {
  name: string;
  type: string;
  address: Address;
  size: number; // sq ft
  capabilities: string[];
}

interface Equipment {
  name: string;
  type: string;
  manufacturer: string;
  quantity: number;
  capabilities: string[];
}

interface TeamMember {
  name: string;
  title: string;
  email: string;
  phone: string;
  role: string;
}
```

**Indexes:**
- `status` + `currentStage`
- `riskLevel` + `status`
- `assignedAffiliates` (array)
- `onboardingCompleted` + `status`
- `createdAt` (desc)

---

## 🤝 affiliates Collection (NEW)

Service providers helping suppliers.

```typescript
interface Affiliate {
  id: string;
  
  // Basic Information
  name: string;
  type: 'company' | 'individual';
  legalName?: string;
  taxId?: string;
  
  // Contact
  contactInfo: {
    primaryContact: string;
    email: string;
    phone: string;
    website?: string;
    address: Address;
  };
  
  // Service Offerings
  serviceOfferings: {
    categories: string[]; // From strategic-value-plus-affiliate-services.md
    specificServices: string[];
    
    // Pricing
    pricing: {
      structure: 'hourly' | 'project' | 'retainer' | 'value-based';
      hourlyRate?: number;
      projectRates?: { [key: string]: number };
      retainerOptions?: RetainerOption[];
    };
    
    // Delivery
    deliveryMethods: string[]; // On-site, remote, hybrid
    languages: string[];
  };
  
  // Expertise & Credentials
  expertise: {
    // Certifications
    certifications: string[];
    licenses: string[];
    
    // Experience
    yearsInBusiness: number;
    industryExperience: {
      automotive: number;
      battery: number;
      manufacturing: number;
      other: { [key: string]: number };
    };
    
    // Toyota/OEM Experience
    toyotaExperience: boolean;
    toyotaProjects: number;
    oemExperience: string[];
    
    // Success Stories
    successStories: SuccessStory[];
    caseStudies: string[]; // Document IDs
    clientReferences: Reference[];
  };
  
  // Capacity & Availability
  capacity: {
    currentLoad: number; // Number of active assignments
    maxCapacity: number;
    availability: 'available' | 'limited' | 'unavailable';
    availableStartDate: Timestamp;
    
    // Preferences
    geographicPreferences: string[];
    projectSizePreferences: string[];
    industryPreferences: string[];
  };
  
  // Assignments
  assignments: {
    current: string[]; // supplier IDs
    past: string[];
    totalCompleted: number;
    totalActive: number;
  };
  
  // Performance Metrics
  performance: {
    averageRating: number;
    totalRatings: number;
    onTimeDeliveryRate: number; // Percentage
    clientSatisfactionScore: number;
    repeatClientRate: number;
    
    // Detailed Ratings
    ratings: {
      quality: number;
      communication: number;
      timeliness: number;
      expertise: number;
      value: number;
    };
  };
  
  // Financial
  financial: {
    paymentTerms: string;
    insuranceCoverage: {
      general: boolean;
      professional: boolean;
      errors: boolean;
    };
    bondingCapacity?: number;
  };
  
  // Status
  status: 'pending-approval' | 'active' | 'inactive' | 'suspended';
  approvalStatus: {
    approved: boolean;
    approvedBy?: string;
    approvedAt?: Timestamp;
    rejectionReason?: string;
  };
  
  // Registration
  registrationDate: Timestamp;
  registrationCompleted: boolean;
  registrationStep: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActivity: Timestamp;
}

interface RetainerOption {
  name: string;
  monthlyFee: number;
  hoursIncluded: number;
  services: string[];
}

interface SuccessStory {
  title: string;
  client: string; // Anonymized if needed
  challenge: string;
  solution: string;
  results: string;
  metrics: { [key: string]: string };
}

interface Reference {
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  relationship: string;
}
```

**Indexes:**
- `status` + `availability`
- `serviceOfferings.categories` (array)
- `capacity.availability`
- `performance.averageRating` (desc)
- `assignments.totalActive`

---

## 📋 deliverables Collection (NEW)

Time-tracked deliverables with dependencies.

```typescript
interface Deliverable {
  id: string;
  
  // Relationships
  supplierId: string;
  affiliateId: string;
  assignmentId: string;
  
  // Basic Info
  category: string; // e.g., "Quality Certification", "Financial Planning"
  title: string;
  description: string;
  requirements: string;
  acceptanceCriteria: string[];
  
  // Timing
  timing: {
    startDate: Timestamp;
    dueDate: Timestamp;
    completedDate?: Timestamp;
    estimatedDuration: number; // days
    actualDuration?: number;
    
    // Time tracking
    timeSpent: number; // hours
    timeRemaining: number; // hours
  };
  
  // Status
  status: 'not-started' | 'in-progress' | 'blocked' | 'under-review' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Progress
  progress: {
    percentage: number;
    lastUpdate: Timestamp;
    milestones: Milestone[];
    completedMilestones: number;
    totalMilestones: number;
  };
  
  // Dependencies
  dependencies: string[]; // Other deliverable IDs
  blockedBy: string[]; // Deliverable IDs blocking this one
  blocks: string[]; // Deliverable IDs this one blocks
  
  // Artifacts
  documents: string[]; // Document IDs
  links: Link[];
  
  // Notes & Communication
  notes: Note[];
  comments: Comment[];
  
  // Review
  review: {
    required: boolean;
    reviewer?: string; // User ID
    reviewedAt?: Timestamp;
    approved?: boolean;
    feedback?: string;
  };
  
  // Alerts Generated
  alerts: string[]; // Alert IDs
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastModifiedBy: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Timestamp;
  completed: boolean;
  completedDate?: Timestamp;
}

interface Link {
  url: string;
  title: string;
  type: string;
}

interface Note {
  id: string;
  content: string;
  author: string;
  createdAt: Timestamp;
  private: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: Timestamp;
  mentions: string[]; // User IDs
}
```

**Indexes:**
- `supplierId` + `status`
- `affiliateId` + `status`
- `status` + `priority`
- `timing.dueDate` + `status`
- `assignmentId`

---

## 🔗 assignments Collection (NEW)

Affiliate-supplier assignments.

```typescript
interface Assignment {
  id: string;
  
  // Relationships
  supplierId: string;
  affiliateId: string;
  
  // Assignment Details
  serviceCategory: string;
  services: string[];
  scope: string;
  objectives: string[];
  
  // Timing
  startDate: Timestamp;
  endDate?: Timestamp;
  estimatedDuration: number; // days
  
  // Status
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'on-hold';
  
  // Deliverables
  deliverables: string[]; // Deliverable IDs
  completedDeliverables: number;
  totalDeliverables: number;
  
  // Financial
  financial: {
    budgetAllocated: number;
    budgetSpent: number;
    billingType: string;
    invoices: string[]; // Invoice IDs
  };
  
  // Performance
  performance: {
    onTrack: boolean;
    progressPercentage: number;
    issuesCount: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  
  // Assignment Management
  assignedBy: string; // Admin user ID
  assignedAt: Timestamp;
  approvedBy?: string;
  approvedAt?: Timestamp;
  
  // Communication
  lastContact: Timestamp;
  nextMeeting?: Timestamp;
  meetingNotes: string[]; // Document IDs
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes:**
- `supplierId` + `status`
- `affiliateId` + `status`
- `status` + `performance.riskLevel`
- `assignedBy`

---

## 🔔 alerts Collection (NEW)

System alerts and notifications.

```typescript
interface Alert {
  id: string;
  
  // Alert Type
  type: 'overdue' | 'approaching-deadline' | 'at-risk' | 'stalled' | 
        'milestone-achieved' | 'stage-advanced' | 'document-rejected' |
        'missing-documentation' | 'affiliate-overloaded' | 'unassigned-supplier' |
        'custom';
  
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  
  // Related Entities
  relatedTo: {
    type: 'supplier' | 'affiliate' | 'deliverable' | 'assignment' | 'document';
    id: string;
    name: string;
  };
  
  // Alert Content
  title: string;
  message: string;
  details: any; // Type-specific details
  
  // Recipients
  recipients: string[]; // User IDs
  recipientRoles: string[]; // Roles that should see this
  
  // Status
  read: boolean;
  readBy: string[]; // User IDs
  readAt: { [userId: string]: Timestamp };
  
  // Action
  actionRequired: boolean;
  actionType?: string;
  actionUrl?: string;
  actionTaken?: {
    action: string;
    takenBy: string;
    takenAt: Timestamp;
    notes: string;
  };
  
  // Resolution
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Timestamp;
  resolutionNotes?: string;
  
  // Escalation
  escalated: boolean;
  escalatedTo?: string;
  escalatedAt?: Timestamp;
  
  // Metadata
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  
  // Automation
  triggeredBy: 'system' | 'user';
  automationRule?: string;
}
```

**Indexes:**
- `recipients` (array) + `read`
- `relatedTo.type` + `relatedTo.id`
- `severity` + `resolved`
- `type` + `createdAt` (desc)
- `actionRequired` + `resolved`

---

## 📊 analytics Collection

Enhanced with new metrics.

```typescript
interface Analytics {
  id: string;
  type: 'dashboard' | 'supplier' | 'affiliate' | 'system';
  
  // Dashboard Metrics
  dashboard?: {
    totalSuppliers: number;
    suppliersByStage: { [stage: string]: number };
    suppliersByStatus: { [status: string]: number };
    suppliersByRisk: { [risk: string]: number };
    
    totalAffiliates: number;
    activeAffiliates: number;
    affiliateUtilization: number; // Percentage
    
    totalDeliverables: number;
    overdueDeliverables: number;
    completedDeliverables: number;
    
    totalAlerts: number;
    unresolvedAlerts: number;
    criticalAlerts: number;
    
    averageTimeToQualification: number; // days
    successRate: number; // Percentage
    
    // Trends
    trends: {
      newSuppliersThisMonth: number;
      completedThisMonth: number;
      averageProgressRate: number;
    };
  };
  
  // Supplier-Specific
  supplier?: {
    supplierId: string;
    progressPercentage: number;
    daysInProcess: number;
    completedDeliverables: number;
    totalDeliverables: number;
    assignedAffiliates: number;
    riskScore: number;
    timeline: TimelineEvent[];
  };
  
  // Affiliate-Specific
  affiliate?: {
    affiliateId: string;
    activeAssignments: number;
    completedAssignments: number;
    totalDeliverables: number;
    completedDeliverables: number;
    onTimeRate: number;
    averageRating: number;
    utilization: number;
    revenue: number;
  };
  
  // Timestamps
  calculatedAt: Timestamp;
  validUntil: Timestamp;
}

interface TimelineEvent {
  date: Timestamp;
  event: string;
  type: string;
  details: any;
}
```

**Indexes:**
- `type` + `calculatedAt` (desc)
- `supplier.supplierId`
- `affiliate.affiliateId`

---

## 🔐 Security Rules

Enhanced security rules for new collections.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isAffiliate() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'affiliate';
    }
    
    function isSupplier() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'supplier';
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin();
      allow update: if isAdmin() || request.auth.uid == userId;
      allow delete: if isAdmin();
    }
    
    // Suppliers collection
    match /suppliers/{supplierId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin() || isSupplier();
      allow update: if isAdmin() || 
                       (isSupplier() && getUserData().supplierId == supplierId) ||
                       (isAffiliate() && supplierId in getUserData().assignments.current);
      allow delete: if isAdmin();
      
      // Subcollections
      match /{subcollection}/{docId} {
        allow read: if isAuthenticated();
        allow write: if isAdmin() || 
                        (isSupplier() && getUserData().supplierId == supplierId) ||
                        (isAffiliate() && supplierId in getUserData().assignments.current);
      }
    }
    
    // Affiliates collection
    match /affiliates/{affiliateId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin() || isAffiliate();
      allow update: if isAdmin() || 
                       (isAffiliate() && getUserData().affiliateId == affiliateId);
      allow delete: if isAdmin();
    }
    
    // Deliverables collection
    match /deliverables/{deliverableId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin() || isAffiliate();
      allow update: if isAdmin() || 
                       (isAffiliate() && resource.data.affiliateId == getUserData().affiliateId) ||
                       (isSupplier() && resource.data.supplierId == getUserData().supplierId);
      allow delete: if isAdmin();
    }
    
    // Assignments collection
    match /assignments/{assignmentId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
    
    // Alerts collection
    match /alerts/{alertId} {
      allow read: if isAuthenticated() && 
                     request.auth.uid in resource.data.recipients;
      allow create: if isAdmin() || isAffiliate();
      allow update: if isAuthenticated() && 
                       request.auth.uid in resource.data.recipients;
      allow delete: if isAdmin();
    }
    
    // Analytics collection
    match /analytics/{docId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

---

## 📈 Indexes

Required composite indexes for efficient queries.

```json
{
  "indexes": [
    {
      "collectionGroup": "suppliers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "currentStage", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "suppliers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "riskLevel", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "affiliates",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "capacity.availability", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "deliverables",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "supplierId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "deliverables",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "timing.dueDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "alerts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "recipients", "arrayConfig": "CONTAINS" },
        { "fieldPath": "read", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "alerts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "severity", "order": "ASCENDING" },
        { "fieldPath": "resolved", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## 🔄 Migration from V1 to V2

### Migration Steps

1. **Add new fields to existing suppliers**
   - Run migration script to add enhanced profile fields
   - Set default values for new fields
   
2. **Create new collections**
   - affiliates
   - deliverables
   - assignments
   - alerts
   
3. **Update users collection**
   - Add role field
   - Add preferences
   
4. **Deploy new security rules**

5. **Deploy new indexes**

### Migration Script

```typescript
// See packages/backend/src/firebase/scripts/migrate-v1-to-v2.ts
```

---

**This enhanced schema supports the complete supplier readiness platform!**
