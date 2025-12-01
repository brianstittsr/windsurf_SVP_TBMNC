/**
 * Seed Data Script
 * Populates Firestore with test data for development
 */

import { getFirestore } from '../firebase/config';
import { logger } from '../utils/logger';

const db = getFirestore();

// Sample data
const sampleUsers = [
  {
    id: 'admin-001',
    email: 'admin@tbmnc.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    status: 'active',
    permissions: ['users:read', 'users:write', 'suppliers:read', 'suppliers:write', 'affiliates:read', 'affiliates:write'],
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      alertTypes: ['critical', 'high'],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: new Date(),
    lastActivity: new Date(),
  },
  {
    id: 'affiliate-001',
    email: 'consultant@strategicvalue.com',
    firstName: 'John',
    lastName: 'Consultant',
    role: 'affiliate',
    status: 'active',
    affiliateId: 'aff-001',
    permissions: ['suppliers:read', 'assignments:read', 'deliverables:read', 'deliverables:write'],
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      alertTypes: ['critical', 'high', 'medium'],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: new Date(),
    lastActivity: new Date(),
  },
];

const sampleSuppliers = [
  {
    id: 'sup-001',
    companyName: 'Advanced Manufacturing Solutions',
    legalName: 'Advanced Manufacturing Solutions LLC',
    taxId: '12-3456789',
    companySize: 'medium',
    status: 'active',
    currentStage: 3,
    progressPercentage: 45,
    daysInCurrentStage: 15,
    totalDaysInProcess: 60,
    riskLevel: 'low',
    riskFactors: [],
    assignedAffiliates: ['aff-001'],
    onboardingCompleted: false,
    onboardingStep: 5,
    primaryContact: {
      name: 'Jane Smith',
      title: 'Operations Director',
      email: 'jane.smith@ams.com',
      phone: '+1-555-0100',
    },
    headquarters: {
      address: '123 Industrial Pkwy',
      city: 'Charlotte',
      state: 'NC',
      zipCode: '28202',
      country: 'USA',
    },
    batteryExperience: {
      hasExperience: true,
      yearsInIndustry: 5,
      types: ['Lithium-ion', 'Solid-state'],
      majorProjects: ['EV Battery Pack Assembly'],
    },
    automotiveExperience: {
      hasExperience: true,
      yearsInIndustry: 10,
      tierLevel: 'tier-2',
      oems: ['Ford', 'GM'],
    },
    certifications: {
      iso9001: { certified: true, expiryDate: new Date('2025-12-31') },
      iatf16949: { certified: false },
      iso14001: { certified: true, expiryDate: new Date('2025-06-30') },
      iso45001: { certified: false },
      qualityManagementSystem: 'ISO 9001',
    },
    technicalCapabilities: {
      automationLevel: 'semi-automated',
      rdCapabilities: { hasRD: true, teamSize: 8 },
      qualityControlSystems: ['SPC', 'Six Sigma'],
      testingCapabilities: ['Electrical Testing', 'Environmental Testing'],
    },
    tbmncAlignment: {
      motivation: 'Expand into EV battery manufacturing',
      proposedProducts: ['Battery cell holders', 'Thermal management components'],
      investmentReadiness: 'ready',
      timeline: '6-12 months',
    },
    tags: ['battery', 'automotive', 'tier-2'],
    categories: ['Manufacturing', 'Components'],
    team: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin-001',
    lastModifiedBy: 'admin-001',
  },
];

const sampleAffiliates = [
  {
    id: 'aff-001',
    name: 'Strategic Value Plus',
    legalName: 'Strategic Value Plus LLC',
    taxId: '98-7654321',
    status: 'active',
    primaryContact: {
      name: 'John Consultant',
      title: 'Senior Consultant',
      email: 'consultant@strategicvalue.com',
      phone: '+1-555-0200',
    },
    address: {
      street: '456 Business Blvd',
      city: 'Raleigh',
      state: 'NC',
      zipCode: '27601',
      country: 'USA',
    },
    serviceOfferings: {
      categories: ['Quality Management', 'ISO/IATF Certification', 'Manufacturing Excellence'],
      specificServices: [
        'ISO 9001 Implementation',
        'IATF 16949 Certification Support',
        'Process Improvement',
        'Lean Manufacturing',
      ],
      pricing: {
        structure: 'hourly',
        hourlyRate: 150,
        minimumEngagement: '40 hours',
      },
    },
    expertise: {
      certifications: ['ISO 9001 Lead Auditor', 'Six Sigma Black Belt', 'PMP'],
      industryExperience: {
        automotive: 15,
        battery: 5,
        manufacturing: 20,
      },
      toyotaExperience: true,
      toyotaProjects: 3,
    },
    capacity: {
      currentLoad: 2,
      maxCapacity: 5,
      availability: 'available',
      geographicPreferences: ['North Carolina', 'South Carolina', 'Virginia'],
    },
    performance: {
      totalAssignments: 12,
      completedAssignments: 10,
      averageRating: 4.8,
      onTimeDeliveryRate: 0.95,
      clientSatisfactionScore: 4.7,
    },
    approvalStatus: {
      approved: true,
      approvedBy: 'admin-001',
      approvedAt: new Date('2024-01-15'),
    },
    assignments: ['sup-001'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date(),
  },
];

const sampleDeliverables = [
  {
    id: 'del-001',
    title: 'ISO 9001 Gap Analysis Report',
    description: 'Comprehensive gap analysis against ISO 9001:2015 requirements',
    category: 'Quality Management',
    supplierId: 'sup-001',
    assignmentId: 'asn-001',
    status: 'in-progress',
    priority: 'high',
    timing: {
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      estimatedDuration: 40,
      timeSpent: 20,
    },
    progress: {
      percentage: 50,
      milestones: [
        { name: 'Initial Assessment', completed: true, completedDate: new Date() },
        { name: 'Gap Identification', completed: true, completedDate: new Date() },
        { name: 'Report Draft', completed: false },
        { name: 'Final Report', completed: false },
      ],
      lastUpdate: new Date(),
    },
    dependencies: [],
    blockedBy: [],
    notes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'affiliate-001',
    lastModifiedBy: 'affiliate-001',
  },
];

const sampleAssignments = [
  {
    id: 'asn-001',
    supplierId: 'sup-001',
    affiliateId: 'aff-001',
    scope: 'ISO 9001 and IATF 16949 certification support',
    status: 'active',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    deliverables: ['del-001'],
    completedDeliverables: 0,
    totalDeliverables: 1,
    financial: {
      budgetAllocated: 15000,
      budgetSpent: 3000,
      billingType: 'hourly',
      invoices: [],
    },
    performance: {
      onTrack: true,
      progressPercentage: 50,
      issuesCount: 0,
      riskLevel: 'low',
    },
    assignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    meetingNotes: ['Initial kickoff meeting completed', 'Gap analysis in progress'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
];

const sampleAlerts = [
  {
    id: 'alt-001',
    type: 'approaching-deadline',
    severity: 'medium',
    title: 'Deliverable Due Soon',
    message: 'ISO 9001 Gap Analysis Report is due in 14 days',
    relatedTo: {
      type: 'deliverable',
      id: 'del-001',
      name: 'ISO 9001 Gap Analysis Report',
    },
    recipients: ['admin-001', 'affiliate-001'],
    recipientRoles: ['admin', 'affiliate'],
    actionRequired: true,
    actionType: 'review',
    read: false,
    readBy: [],
    readAt: {},
    resolved: false,
    escalated: false,
    createdAt: new Date(),
    triggeredBy: 'system',
  },
];

/**
 * Seed the database
 */
async function seedDatabase() {
  try {
    logger.info('Starting database seed...');

    // Seed Users
    logger.info('Seeding users...');
    for (const user of sampleUsers) {
      await db.collection('users').doc(user.id).set(user);
    }
    logger.info(`Seeded ${sampleUsers.length} users`);

    // Seed Suppliers
    logger.info('Seeding suppliers...');
    for (const supplier of sampleSuppliers) {
      await db.collection('suppliers').doc(supplier.id).set(supplier);
    }
    logger.info(`Seeded ${sampleSuppliers.length} suppliers`);

    // Seed Affiliates
    logger.info('Seeding affiliates...');
    for (const affiliate of sampleAffiliates) {
      await db.collection('affiliates').doc(affiliate.id).set(affiliate);
    }
    logger.info(`Seeded ${sampleAffiliates.length} affiliates`);

    // Seed Deliverables
    logger.info('Seeding deliverables...');
    for (const deliverable of sampleDeliverables) {
      await db.collection('deliverables').doc(deliverable.id).set(deliverable);
    }
    logger.info(`Seeded ${sampleDeliverables.length} deliverables`);

    // Seed Assignments
    logger.info('Seeding assignments...');
    for (const assignment of sampleAssignments) {
      await db.collection('assignments').doc(assignment.id).set(assignment);
    }
    logger.info(`Seeded ${sampleAssignments.length} assignments`);

    // Seed Alerts
    logger.info('Seeding alerts...');
    for (const alert of sampleAlerts) {
      await db.collection('alerts').doc(alert.id).set(alert);
    }
    logger.info(`Seeded ${sampleAlerts.length} alerts`);

    logger.info('Database seed completed successfully!');
    logger.info('---');
    logger.info('Test Credentials:');
    logger.info('Admin: admin@tbmnc.com');
    logger.info('Affiliate: consultant@strategicvalue.com');
    logger.info('---');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed script failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
