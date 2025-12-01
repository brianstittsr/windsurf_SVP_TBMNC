import { Router } from 'express';

const router = Router();

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'TBMNC Tracker API',
    version: '1.0.0',
    status: 'operational',
    message: 'Firebase migration in progress - Full API endpoints coming soon',
    endpoints: {
      customers: '/api/v1/customers',
      documents: '/api/v1/documents',
      analytics: '/api/v1/analytics',
    },
  });
});

// Placeholder customer routes
router.get('/customers', (req, res) => {
  res.json({
    message: 'Customer endpoints will be available after Firebase setup',
    customers: [],
  });
});

// Placeholder document routes
router.get('/documents', (req, res) => {
  res.json({
    message: 'Document endpoints will be available after Firebase setup',
    documents: [],
  });
});

// Placeholder analytics routes
router.get('/analytics', (req, res) => {
  res.json({
    message: 'Analytics endpoints will be available after Firebase setup',
    metrics: {},
  });
});

export default router;
