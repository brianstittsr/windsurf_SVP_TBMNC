import { initializeFirebase, getFirestore } from '../config';
import { logger } from '../../utils/logger';
import { Timestamp } from 'firebase-admin/firestore';

async function seedData() {
  try {
    logger.info('Starting Firebase data seeding...');
    
    initializeFirebase();
    const db = getFirestore();

    // Clear existing data (optional - comment out in production)
    logger.info('Clearing existing data...');
    const collections = ['users', 'customers', 'analytics'];
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    // Create users
    logger.info('Creating users...');
    const users = [
      {
        id: 'admin-user-1',
        auth0Id: 'auth0|admin123',
        email: 'admin@strategicvalueplus.com',
        name: 'Admin User',
        role: 'admin',
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'manager-user-1',
        auth0Id: 'auth0|manager123',
        email: 'manager@strategicvalueplus.com',
        name: 'Manager User',
        role: 'manager',
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'viewer-user-1',
        auth0Id: 'auth0|viewer123',
        email: 'viewer@strategicvalueplus.com',
        name: 'Viewer User',
        role: 'viewer',
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    for (const user of users) {
      await db.collection('users').doc(user.id).set(user);
    }
    logger.info(`✓ Created ${users.length} users`);

    // Create customers
    logger.info('Creating customers...');
    const customers = [
      {
        id: 'customer-1',
        companyName: 'Acme Battery Components',
        legalName: 'Acme Battery Components LLC',
        taxId: '12-3456789',
        companySize: 'medium',
        annualRevenue: 5000000,
        yearsInBusiness: 8,
        status: 'active',
        currentStage: 2,
        assignedToId: 'manager-user-1',
        assignedToName: 'Manager User',
        contactPerson: 'John Doe',
        contactEmail: 'john@acmebattery.com',
        contactPhone: '+1-555-0101',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'admin-user-1',
        tags: ['battery-components', 'tier-2'],
      },
      {
        id: 'customer-2',
        companyName: 'PowerCell Manufacturing',
        legalName: 'PowerCell Manufacturing Inc',
        taxId: '98-7654321',
        companySize: 'large',
        annualRevenue: 15000000,
        yearsInBusiness: 12,
        status: 'active',
        currentStage: 3,
        assignedToId: 'manager-user-1',
        assignedToName: 'Manager User',
        contactPerson: 'Jane Smith',
        contactEmail: 'jane@powercell.com',
        contactPhone: '+1-555-0102',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'admin-user-1',
        tags: ['manufacturing', 'tier-1'],
      },
      {
        id: 'customer-3',
        companyName: 'Green Energy Solutions',
        legalName: 'Green Energy Solutions Corp',
        taxId: '45-6789012',
        companySize: 'small',
        annualRevenue: 2000000,
        yearsInBusiness: 5,
        status: 'active',
        currentStage: 1,
        assignedToId: 'admin-user-1',
        assignedToName: 'Admin User',
        contactPerson: 'Bob Johnson',
        contactEmail: 'bob@greenenergy.com',
        contactPhone: '+1-555-0103',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'admin-user-1',
        tags: ['renewable', 'startup'],
      },
    ];

    for (const customer of customers) {
      const customerRef = db.collection('customers').doc(customer.id);
      await customerRef.set(customer);

      // Create qualification stages for each customer
      const stages = [
        {
          stageNumber: 1,
          stageName: 'Initial Registration',
          status: customer.currentStage > 1 ? 'completed' : 'in_progress',
          startedAt: Timestamp.now(),
          completedAt: customer.currentStage > 1 ? Timestamp.now() : null,
        },
        {
          stageNumber: 2,
          stageName: 'Documentation Review',
          status: customer.currentStage > 2 ? 'completed' : customer.currentStage === 2 ? 'in_progress' : 'pending',
          startedAt: customer.currentStage >= 2 ? Timestamp.now() : null,
          completedAt: customer.currentStage > 2 ? Timestamp.now() : null,
        },
        {
          stageNumber: 3,
          stageName: 'Stakeholder Assignment',
          status: customer.currentStage > 3 ? 'completed' : customer.currentStage === 3 ? 'in_progress' : 'pending',
          startedAt: customer.currentStage >= 3 ? Timestamp.now() : null,
          completedAt: customer.currentStage > 3 ? Timestamp.now() : null,
        },
      ];

      for (const stage of stages) {
        await customerRef.collection('qualificationStages').add({
          ...stage,
          customerId: customer.id,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      // Create sample documents
      if (customer.currentStage >= 2) {
        await customerRef.collection('documents').add({
          customerId: customer.id,
          documentType: 'business_license',
          fileName: 'business-license.pdf',
          fileSize: 1024000,
          mimeType: 'application/pdf',
          storagePath: `documents/${customer.id}/business-license.pdf`,
          downloadURL: '',
          status: 'approved',
          uploadedBy: 'admin-user-1',
          uploadedByName: 'Admin User',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      // Create sample communication
      await customerRef.collection('communications').add({
        customerId: customer.id,
        type: 'email',
        subject: 'Welcome to TBMNC Qualification Process',
        message: 'Thank you for registering. We will review your application shortly.',
        sentBy: 'admin-user-1',
        sentByName: 'Admin User',
        sentAt: Timestamp.now(),
        priority: 'normal',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
    logger.info(`✓ Created ${customers.length} customers with subcollections`);

    // Create analytics data
    logger.info('Creating analytics data...');
    await db.collection('analytics').doc('dashboard').set({
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.status === 'active').length,
      qualifiedCustomers: 0,
      pendingReviews: 2,
      averageQualificationTime: 45,
      stageDistribution: {
        1: 1,
        2: 1,
        3: 1,
      },
      statusDistribution: {
        active: 3,
        inactive: 0,
        pending: 0,
      },
      lastUpdated: Timestamp.now(),
    });

    await db.collection('analytics').doc('pipeline').set({
      stages: [
        { stageNumber: 1, stageName: 'Initial Registration', customerCount: 1, averageTimeInStage: 5, completionRate: 100 },
        { stageNumber: 2, stageName: 'Documentation Review', customerCount: 1, averageTimeInStage: 10, completionRate: 85 },
        { stageNumber: 3, stageName: 'Stakeholder Assignment', customerCount: 1, averageTimeInStage: 7, completionRate: 90 },
      ],
      lastUpdated: Timestamp.now(),
    });
    logger.info('✓ Created analytics data');

    logger.info('✅ Firebase data seeding completed successfully!');
    logger.info(`- Users: ${users.length}`);
    logger.info(`- Customers: ${customers.length}`);
    logger.info('- Qualification stages, documents, and communications created');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Firebase seeding failed:', error);
    process.exit(1);
  }
}

seedData();
