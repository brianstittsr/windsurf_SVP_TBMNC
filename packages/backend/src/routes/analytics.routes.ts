import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();
const analyticsController = new AnalyticsController();

// Analytics endpoints
router.get('/dashboard', analyticsController.getDashboard);
router.get('/pipeline', analyticsController.getPipeline);
router.get('/customer/:id', analyticsController.getCustomerAnalytics);

export default router;
