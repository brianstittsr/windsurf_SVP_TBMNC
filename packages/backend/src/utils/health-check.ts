import { getFirestore } from '../firebase/config';
import { logger } from './logger';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    firebase: {
      status: 'ok' | 'error';
      message?: string;
    };
    memory: {
      status: 'ok' | 'warning' | 'critical';
      used: number;
      total: number;
      percentage: number;
    };
    environment: {
      nodeEnv: string;
      firebaseEmulator: boolean;
    };
  };
}

export async function performHealthCheck(): Promise<HealthStatus> {
  const startTime = Date.now();
  
  // Check Firebase connection
  let firebaseStatus: { status: 'ok' | 'error'; message?: string } = {
    status: 'ok',
  };
  
  try {
    const db = getFirestore();
    // Try to read a document to verify connection
    await db.collection('_meta').doc('health').get();
  } catch (error) {
    firebaseStatus = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
    logger.error('Firebase health check failed:', error);
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const totalMemory = memUsage.heapTotal;
  const usedMemory = memUsage.heapUsed;
  const memoryPercentage = (usedMemory / totalMemory) * 100;
  
  let memoryStatus: 'ok' | 'warning' | 'critical' = 'ok';
  if (memoryPercentage > 90) {
    memoryStatus = 'critical';
  } else if (memoryPercentage > 75) {
    memoryStatus = 'warning';
  }

  // Determine overall status
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (firebaseStatus.status === 'error' || memoryStatus === 'critical') {
    overallStatus = 'unhealthy';
  } else if (memoryStatus === 'warning') {
    overallStatus = 'degraded';
  }

  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    uptime: process.uptime(),
    checks: {
      firebase: firebaseStatus,
      memory: {
        status: memoryStatus,
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round(memoryPercentage),
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        firebaseEmulator: process.env.FIREBASE_EMULATOR === 'true',
      },
    },
  };

  const duration = Date.now() - startTime;
  logger.info(`Health check completed in ${duration}ms - Status: ${overallStatus}`);

  return healthStatus;
}
