import { initializeFirebase, getFirestore } from '../config';
import { logger } from '../../utils/logger';

async function initFirebase() {
  try {
    logger.info('Initializing Firebase...');
    
    // Initialize Firebase Admin
    initializeFirebase();
    const db = getFirestore();

    // Create initial collections structure
    logger.info('Creating initial collection structure...');

    // Create a test document to ensure collections exist
    await db.collection('_meta').doc('initialized').set({
      initialized: true,
      timestamp: new Date(),
      version: '1.0.0',
    });

    logger.info('✅ Firebase initialized successfully!');
    logger.info('Collections ready: users, customers, analytics');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Firebase initialization failed:', error);
    process.exit(1);
  }
}

initFirebase();
