import { Router } from 'express';
import customerRoutes from './customer.routes';
import documentRoutes from './document.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

// API routes
router.use('/customers', customerRoutes);
router.use('/documents', documentRoutes);
router.use('/analytics', analyticsRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'TBMNC Tracker API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      customers: '/api/v1/customers',
      documents: '/api/v1/documents',
      analytics: '/api/v1/analytics',
    },
  });
});

export default router;
