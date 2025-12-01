/**
 * Enhanced Type Definitions for TBMNC Tracker V2.0
 * Supporting multi-role system with Suppliers, Affiliates, and Admins
 */

import { Timestamp } from 'firebase-admin/firestore';

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = 'admin' | 'affiliate' | 'supplier' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    timezone?: string;
  };
  
  supplierId?: string;
  affiliateId?: string;
  
  permissions: string[];
  
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    alertTypes: string[];
    dashboardLayout?: any;
  };
  
  lastLogin: Timestamp;
  lastActivity: Timestamp;
  status: UserStatus;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
}

// ============================================================================
// SUPPLIER TYPES (Enhanced)
// ============================================================================

export type CompanySize = 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
export type SupplierStatus = 'pending' | 'active' | 'qualified' | 'rejected' | 'on-hold';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type TierLevel = 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4' | 'none';
export type AutomationLevel = 'manual' | 'semi-automated' | 'fully-automated';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Facility {
  name: string;
  type: string;
  address: Address;
  size: number;
  capabilities: string[];
}

export interface Equipment {
  name: string;
  type: string;
  manufacturer: string;
  quantity: number;
  capabilities: string[];
}

export interface TeamMember {
  name: string;
  title: string;
  email: string;
  phone: string;
  role: string;
}

export interface CertificationDetail {
  certified: boolean;
  certificationNumber?: string;
  issuingBody?: string;
  issueDate?: Timestamp;
  expiryDate?: Timestamp;
  scope?: string;
}

export interface Supplier {
  id: string;
  
  // Basic Information
  companyName: string;
  legalName: string;
  dba?: string;
  taxId: string;
  yearEstablished: number;
  
  companySize: CompanySize;
  employeeCount: number;
  annualRevenue: string;
  
  headquarters: Address;
  facilities: Facility[];
  
  // Enhanced Business Profile
  businessProfile: {
    coreActivities: string[];
    primaryProducts: string[];
    primaryServices: string[];
    industrySectors: string[];
    manufacturingCapabilities: string[];
    technologyPlatforms: string[];
    targetMarkets: string[];
    geographicReach: string[];
    customerBase: string;
  };
  
  batteryExperience: {
    hasExperience: boolean;
    yearsInIndustry: number;
    batteryTypes: string[];
    batteryComponents: string[];
    currentBatteryCustomers: string[];
    relevantProducts: string[];
    batteryRevenue: string;
  };
  
  automotiveExperience: {
    hasExperience: boolean;
    yearsInIndustry: number;
    currentOEMs: string[];
    tierLevel: TierLevel;
    automotiveRevenue: string;
    oemCertifications: string[];
  };
  
  technicalCapabilities: {
    productionCapacity: {
      volume: string;
      unit: string;
      scalability: string;
    };
    equipmentList: Equipment[];
    automationLevel: AutomationLevel;
    qualityControlSystems: string[];
    testingCapabilities: string[];
    inspectionEquipment: string[];
    rdCapabilities: {
      hasRD: boolean;
      rdBudget: string;
      rdStaff: number;
      focusAreas: string[];
    };
    patents: number;
    trademarks: number;
    proprietaryTechnology: string[];
    technologyPartnerships: string[];
  };
  
  certifications: {
    iso9001: CertificationDetail;
    iatf16949: CertificationDetail;
    iso14001: CertificationDetail;
    iso45001: CertificationDetail;
    other: CertificationDetail[];
    qualityManagementSystem: string;
    continuousImprovementPrograms: string[];
  };
  
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
  
  sustainability: {
    carbonFootprint: string;
    carbonReductionGoals: string;
    sustainabilityInitiatives: string[];
    environmentalCompliance: boolean;
    wasteManagement: string;
    energyEfficiency: string;
    renewableEnergy: boolean;
    socialResponsibilityPrograms: string[];
    diversityInitiatives: string[];
    communityEngagement: string[];
  };
  
  supplyChain: {
    structure: string;
    keySuppliers: Array<{ name: string; products: string[] }>;
    supplierDiversity: string;
    managementSystem: string;
    riskManagement: string;
    logisticsCapabilities: string[];
    geographicReach: string[];
  };
  
  tbmncAlignment: {
    motivation: string;
    understandingOfToyotaValues: string;
    longTermCommitment: string;
    specificCapabilitiesForTBMNC: string[];
    proposedProducts: string[];
    proposedServices: string[];
    investmentReadiness: string;
    proposedInvestments: string;
    capabilityDevelopmentTimeline: string;
    resourceAllocation: string;
  };
  
  // Tracking & Management
  status: SupplierStatus;
  currentStage: number;
  progressPercentage: number;
  
  daysInCurrentStage: number;
  totalDaysInProcess: number;
  estimatedCompletionDate: Timestamp;
  
  riskLevel: RiskLevel;
  riskFactors: string[];
  
  assignedAffiliates: string[];
  primaryContact: string;
  
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  team: TeamMember[];
  
  onboardingCompleted: boolean;
  onboardingStep: number;
  onboardingStartedAt: Timestamp;
  onboardingCompletedAt?: Timestamp;
  
  tags: string[];
  categories: string[];
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastModifiedBy: string;
}

// ============================================================================
// AFFILIATE TYPES
// ============================================================================

export type AffiliateType = 'company' | 'individual';
export type AffiliateStatus = 'pending-approval' | 'active' | 'inactive' | 'suspended';
export type Availability = 'available' | 'limited' | 'unavailable';
export type PricingStructure = 'hourly' | 'project' | 'retainer' | 'value-based';

export interface RetainerOption {
  name: string;
  monthlyFee: number;
  hoursIncluded: number;
  services: string[];
}

export interface SuccessStory {
  title: string;
  client: string;
  challenge: string;
  solution: string;
  results: string;
  metrics: { [key: string]: string };
}

export interface Reference {
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface Affiliate {
  id: string;
  
  name: string;
  type: AffiliateType;
  legalName?: string;
  taxId?: string;
  
  contactInfo: {
    primaryContact: string;
    email: string;
    phone: string;
    website?: string;
    address: Address;
  };
  
  serviceOfferings: {
    categories: string[];
    specificServices: string[];
    pricing: {
      structure: PricingStructure;
      hourlyRate?: number;
      projectRates?: { [key: string]: number };
      retainerOptions?: RetainerOption[];
    };
    deliveryMethods: string[];
    languages: string[];
  };
  
  expertise: {
    certifications: string[];
    licenses: string[];
    yearsInBusiness: number;
    industryExperience: {
      automotive: number;
      battery: number;
      manufacturing: number;
      other: { [key: string]: number };
    };
    toyotaExperience: boolean;
    toyotaProjects: number;
    oemExperience: string[];
    successStories: SuccessStory[];
    caseStudies: string[];
    clientReferences: Reference[];
  };
  
  capacity: {
    currentLoad: number;
    maxCapacity: number;
    availability: Availability;
    availableStartDate: Timestamp;
    geographicPreferences: string[];
    projectSizePreferences: string[];
    industryPreferences: string[];
  };
  
  assignments: {
    current: string[];
    past: string[];
    totalCompleted: number;
    totalActive: number;
  };
  
  performance: {
    averageRating: number;
    totalRatings: number;
    onTimeDeliveryRate: number;
    clientSatisfactionScore: number;
    repeatClientRate: number;
    ratings: {
      quality: number;
      communication: number;
      timeliness: number;
      expertise: number;
      value: number;
    };
  };
  
  financial: {
    paymentTerms: string;
    insuranceCoverage: {
      general: boolean;
      professional: boolean;
      errors: boolean;
    };
    bondingCapacity?: number;
  };
  
  status: AffiliateStatus;
  approvalStatus: {
    approved: boolean;
    approvedBy?: string;
    approvedAt?: Timestamp;
    rejectionReason?: string;
  };
  
  registrationDate: Timestamp;
  registrationCompleted: boolean;
  registrationStep: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActivity: Timestamp;
}

// ============================================================================
// DELIVERABLE TYPES
// ============================================================================

export type DeliverableStatus = 'not-started' | 'in-progress' | 'blocked' | 'under-review' | 'completed' | 'overdue' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Timestamp;
  completed: boolean;
  completedDate?: Timestamp;
}

export interface Link {
  url: string;
  title: string;
  type: string;
}

export interface Note {
  id: string;
  content: string;
  author: string;
  createdAt: Timestamp;
  private: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: Timestamp;
  mentions: string[];
}

export interface Deliverable {
  id: string;
  
  supplierId: string;
  affiliateId: string;
  assignmentId: string;
  
  category: string;
  title: string;
  description: string;
  requirements: string;
  acceptanceCriteria: string[];
  
  timing: {
    startDate: Timestamp;
    dueDate: Timestamp;
    completedDate?: Timestamp;
    estimatedDuration: number;
    actualDuration?: number;
    timeSpent: number;
    timeRemaining: number;
  };
  
  status: DeliverableStatus;
  priority: Priority;
  
  progress: {
    percentage: number;
    lastUpdate: Timestamp;
    milestones: Milestone[];
    completedMilestones: number;
    totalMilestones: number;
  };
  
  dependencies: string[];
  blockedBy: string[];
  blocks: string[];
  
  documents: string[];
  links: Link[];
  
  notes: Note[];
  comments: Comment[];
  
  review: {
    required: boolean;
    reviewer?: string;
    reviewedAt?: Timestamp;
    approved?: boolean;
    feedback?: string;
  };
  
  alerts: string[];
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastModifiedBy: string;
}

// ============================================================================
// ASSIGNMENT TYPES
// ============================================================================

export type AssignmentStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'on-hold';

export interface Assignment {
  id: string;
  
  supplierId: string;
  affiliateId: string;
  
  serviceCategory: string;
  services: string[];
  scope: string;
  objectives: string[];
  
  startDate: Timestamp;
  endDate?: Timestamp;
  estimatedDuration: number;
  
  status: AssignmentStatus;
  
  deliverables: string[];
  completedDeliverables: number;
  totalDeliverables: number;
  
  financial: {
    budgetAllocated: number;
    budgetSpent: number;
    billingType: string;
    invoices: string[];
  };
  
  performance: {
    onTrack: boolean;
    progressPercentage: number;
    issuesCount: number;
    riskLevel: RiskLevel;
  };
  
  assignedBy: string;
  assignedAt: Timestamp;
  approvedBy?: string;
  approvedAt?: Timestamp;
  
  lastContact: Timestamp;
  nextMeeting?: Timestamp;
  meetingNotes: string[];
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// ALERT TYPES
// ============================================================================

export type AlertType = 
  | 'overdue'
  | 'approaching-deadline'
  | 'at-risk'
  | 'stalled'
  | 'milestone-achieved'
  | 'stage-advanced'
  | 'document-rejected'
  | 'missing-documentation'
  | 'affiliate-overloaded'
  | 'unassigned-supplier'
  | 'custom';

export type AlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type RelatedEntityType = 'supplier' | 'affiliate' | 'deliverable' | 'assignment' | 'document';

export interface Alert {
  id: string;
  
  type: AlertType;
  severity: AlertSeverity;
  
  relatedTo: {
    type: RelatedEntityType;
    id: string;
    name: string;
  };
  
  title: string;
  message: string;
  details: any;
  
  recipients: string[];
  recipientRoles: string[];
  
  read: boolean;
  readBy: string[];
  readAt: { [userId: string]: Timestamp };
  
  actionRequired: boolean;
  actionType?: string;
  actionUrl?: string;
  actionTaken?: {
    action: string;
    takenBy: string;
    takenAt: Timestamp;
    notes: string;
  };
  
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Timestamp;
  resolutionNotes?: string;
  
  escalated: boolean;
  escalatedTo?: string;
  escalatedAt?: Timestamp;
  
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  
  triggeredBy: 'system' | 'user';
  automationRule?: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface TimelineEvent {
  date: Timestamp;
  event: string;
  type: string;
  details: any;
}

export interface DashboardAnalytics {
  totalSuppliers: number;
  suppliersByStage: { [stage: string]: number };
  suppliersByStatus: { [status: string]: number };
  suppliersByRisk: { [risk: string]: number };
  
  totalAffiliates: number;
  activeAffiliates: number;
  affiliateUtilization: number;
  
  totalDeliverables: number;
  overdueDeliverables: number;
  completedDeliverables: number;
  
  totalAlerts: number;
  unresolvedAlerts: number;
  criticalAlerts: number;
  
  averageTimeToQualification: number;
  successRate: number;
  
  trends: {
    newSuppliersThisMonth: number;
    completedThisMonth: number;
    averageProgressRate: number;
  };
}

export interface SupplierAnalytics {
  supplierId: string;
  progressPercentage: number;
  daysInProcess: number;
  completedDeliverables: number;
  totalDeliverables: number;
  assignedAffiliates: number;
  riskScore: number;
  timeline: TimelineEvent[];
}

export interface AffiliateAnalytics {
  affiliateId: string;
  activeAssignments: number;
  completedAssignments: number;
  totalDeliverables: number;
  completedDeliverables: number;
  onTimeRate: number;
  averageRating: number;
  utilization: number;
  revenue: number;
}

export interface Analytics {
  id: string;
  type: 'dashboard' | 'supplier' | 'affiliate' | 'system';
  
  dashboard?: DashboardAnalytics;
  supplier?: SupplierAnalytics;
  affiliate?: AffiliateAnalytics;
  
  calculatedAt: Timestamp;
  validUntil: Timestamp;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateSupplierRequest {
  companyName: string;
  legalName: string;
  contactEmail: string;
  contactPerson: string;
  contactPhone: string;
  // Additional fields from onboarding wizard
}

export interface CreateAffiliateRequest {
  name: string;
  type: AffiliateType;
  contactEmail: string;
  serviceCategories: string[];
  // Additional fields from registration wizard
}

export interface CreateDeliverableRequest {
  supplierId: string;
  affiliateId: string;
  assignmentId: string;
  category: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
}

export interface CreateAssignmentRequest {
  supplierId: string;
  affiliateId: string;
  serviceCategory: string;
  services: string[];
  scope: string;
}

export interface CreateAlertRequest {
  type: AlertType;
  severity: AlertSeverity;
  relatedTo: {
    type: RelatedEntityType;
    id: string;
    name: string;
  };
  title: string;
  message: string;
  recipients: string[];
}
