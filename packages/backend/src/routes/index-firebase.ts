import { Router } from 'express';
import customerController from '../controllers/customer.controller-firebase';
import analyticsController from '../controllers/analytics.controller-firebase';

const router = Router();

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'TBMNC Tracker API',
    version: '1.0.0',
    status: 'operational',
    database: 'Firebase Firestore',
    endpoints: {
      customers: '/api/v1/customers',
      documents: '/api/v1/documents',
      analytics: '/api/v1/analytics',
    },
  });
});

// Customer routes
router.get('/customers', customerController.getAllCustomers.bind(customerController));
router.get('/customers/:id', customerController.getCustomerById.bind(customerController));
router.post('/customers', customerController.createCustomer.bind(customerController));
router.put('/customers/:id', customerController.updateCustomer.bind(customerController));
router.delete('/customers/:id', customerController.deleteCustomer.bind(customerController));
router.get('/customers/:id/stages', customerController.getCustomerStages.bind(customerController));
router.get('/customers/:id/documents', customerController.getCustomerDocuments.bind(customerController));
router.get('/customers/:id/progress', customerController.getCustomerProgress.bind(customerController));

// Analytics routes
router.get('/analytics/dashboard', analyticsController.getDashboardMetrics.bind(analyticsController));
router.get('/analytics/pipeline', analyticsController.getPipelineOverview.bind(analyticsController));
router.get('/analytics/customers/:id', analyticsController.getCustomerAnalytics.bind(analyticsController));
router.post('/analytics/refresh', analyticsController.refreshMetrics.bind(analyticsController));

// Document routes (placeholder for now)
router.get('/documents', (req, res) => {
  res.json({
    success: true,
    message: 'Document endpoints coming soon',
    data: [],
  });
});

export default router;
