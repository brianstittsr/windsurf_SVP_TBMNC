import { Request, Response, NextFunction } from 'express';
import analyticsService from '../services/analytics.service';
import { logger } from '../utils/logger';

export class AnalyticsController {
  async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await analyticsService.getDashboardMetrics();

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error('Error in getDashboardMetrics:', error);
      next(error);
    }
  }

  async getPipelineOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const pipeline = await analyticsService.getPipelineOverview();

      res.json({
        success: true,
        data: pipeline,
      });
    } catch (error) {
      logger.error('Error in getPipelineOverview:', error);
      next(error);
    }
  }

  async getCustomerAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const analytics = await analyticsService.getCustomerAnalytics(id);

      if (!analytics) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      logger.error('Error in getCustomerAnalytics:', error);
      next(error);
    }
  }

  async refreshMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await analyticsService.updateDashboardMetrics();

      res.json({
        success: true,
        message: 'Metrics refreshed successfully',
        data: metrics,
      });
    } catch (error) {
      logger.error('Error in refreshMetrics:', error);
      next(error);
    }
  }
}

export default new AnalyticsController();
