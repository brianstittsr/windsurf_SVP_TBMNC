import { AppDataSource } from '../data-source';
import { User } from '../../entities/User';
import { Customer } from '../../entities/Customer';
import { QualificationStage } from '../../entities/QualificationStage';
import { Document } from '../../entities/Document';
import { Communication } from '../../entities/Communication';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    const userRepository = AppDataSource.getRepository(User);
    const customerRepository = AppDataSource.getRepository(Customer);
    const stageRepository = AppDataSource.getRepository(QualificationStage);
    const documentRepository = AppDataSource.getRepository(Document);
    const communicationRepository = AppDataSource.getRepository(Communication);

    // Clear existing data
    await communicationRepository.delete({});
    await documentRepository.delete({});
    await stageRepository.delete({});
    await customerRepository.delete({});
    await userRepository.delete({});

    console.log('Cleared existing data');

    // Create users
    const adminUser = userRepository.create({
      auth0Id: 'auth0|admin123',
      email: 'admin@strategicvalueplus.com',
      name: 'Admin User',
      role: 'admin',
      isActive: true,
    });

    const managerUser = userRepository.create({
      auth0Id: 'auth0|manager123',
      email: 'manager@strategicvalueplus.com',
      name: 'Manager User',
      role: 'manager',
      isActive: true,
    });

    const viewerUser = userRepository.create({
      auth0Id: 'auth0|viewer123',
      email: 'viewer@strategicvalueplus.com',
      name: 'Viewer User',
      role: 'viewer',
      isActive: true,
    });

    await userRepository.save([adminUser, managerUser, viewerUser]);
    console.log('Created users');

    // Create customers
    const customer1 = customerRepository.create({
      companyName: 'Acme Battery Components',
      legalName: 'Acme Battery Components LLC',
      taxId: '12-3456789',
      companySize: 'medium',
      annualRevenue: 5000000,
      yearsInBusiness: 8,
      status: 'active',
      currentStage: 2,
      assignedTo: managerUser,
    });

    const customer2 = customerRepository.create({
      companyName: 'PowerCell Manufacturing',
      legalName: 'PowerCell Manufacturing Inc',
      taxId: '98-7654321',
      companySize: 'large',
      annualRevenue: 15000000,
      yearsInBusiness: 12,
      status: 'active',
      currentStage: 3,
      assignedTo: managerUser,
    });

    const customer3 = customerRepository.create({
      companyName: 'Green Energy Solutions',
      legalName: 'Green Energy Solutions Corp',
      taxId: '45-6789012',
      companySize: 'small',
      annualRevenue: 2000000,
      yearsInBusiness: 5,
      status: 'active',
      currentStage: 1,
      assignedTo: adminUser,
    });

    await customerRepository.save([customer1, customer2, customer3]);
    console.log('Created customers');

    // Create qualification stages for customer1
    const stages1 = [
      stageRepository.create({
        customer: customer1,
        stageNumber: 1,
        stageName: 'Initial Registration',
        status: 'completed',
        startedAt: new Date('2024-01-15'),
        completedAt: new Date('2024-01-20'),
        notes: 'Registration completed successfully',
      }),
      stageRepository.create({
        customer: customer1,
        stageNumber: 2,
        stageName: 'Documentation Review',
        status: 'in_progress',
        startedAt: new Date('2024-01-21'),
        notes: 'Reviewing submitted documents',
      }),
    ];

    await stageRepository.save(stages1);

    // Create qualification stages for customer2
    const stages2 = [
      stageRepository.create({
        customer: customer2,
        stageNumber: 1,
        stageName: 'Initial Registration',
        status: 'completed',
        startedAt: new Date('2024-01-10'),
        completedAt: new Date('2024-01-12'),
      }),
      stageRepository.create({
        customer: customer2,
        stageNumber: 2,
        stageName: 'Documentation Review',
        status: 'completed',
        startedAt: new Date('2024-01-13'),
        completedAt: new Date('2024-01-25'),
      }),
      stageRepository.create({
        customer: customer2,
        stageNumber: 3,
        stageName: 'Stakeholder Assignment',
        status: 'in_progress',
        startedAt: new Date('2024-01-26'),
        notes: 'Assigning stakeholders',
      }),
    ];

    await stageRepository.save(stages2);

    console.log('Created qualification stages');

    // Create documents
    const documents = [
      documentRepository.create({
        customer: customer1,
        documentType: 'business_license',
        fileName: 'business-license.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        s3Key: 'documents/customer1/business-license.pdf',
        status: 'approved',
        uploadedBy: adminUser,
      }),
      documentRepository.create({
        customer: customer1,
        documentType: 'financial_statement',
        fileName: 'financial-2023.pdf',
        fileSize: 2048000,
        mimeType: 'application/pdf',
        s3Key: 'documents/customer1/financial-2023.pdf',
        status: 'pending',
        uploadedBy: managerUser,
      }),
      documentRepository.create({
        customer: customer2,
        documentType: 'iso_certification',
        fileName: 'iso-9001-cert.pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        s3Key: 'documents/customer2/iso-9001-cert.pdf',
        status: 'approved',
        uploadedBy: adminUser,
      }),
    ];

    await documentRepository.save(documents);
    console.log('Created documents');

    // Create communications
    const communications = [
      communicationRepository.create({
        customer: customer1,
        type: 'email',
        subject: 'Welcome to TBMNC Qualification Process',
        message: 'Thank you for registering. We will review your application shortly.',
        sentBy: adminUser,
        sentAt: new Date('2024-01-15'),
      }),
      communicationRepository.create({
        customer: customer1,
        type: 'notification',
        subject: 'Document Review Started',
        message: 'Your documents are now under review.',
        sentBy: managerUser,
        sentAt: new Date('2024-01-21'),
      }),
      communicationRepository.create({
        customer: customer2,
        type: 'email',
        subject: 'Stage 2 Completed',
        message: 'Congratulations! You have completed the documentation review stage.',
        sentBy: adminUser,
        sentAt: new Date('2024-01-25'),
        readAt: new Date('2024-01-25'),
      }),
    ];

    await communicationRepository.save(communications);
    console.log('Created communications');

    console.log('✅ Seed data created successfully!');
    console.log(`- Users: ${await userRepository.count()}`);
    console.log(`- Customers: ${await customerRepository.count()}`);
    console.log(`- Qualification Stages: ${await stageRepository.count()}`);
    console.log(`- Documents: ${await documentRepository.count()}`);
    console.log(`- Communications: ${await communicationRepository.count()}`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
