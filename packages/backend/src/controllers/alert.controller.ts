/**
 * Alert Controller
 * Handles HTTP requests for alert operations
 */

import { Request, Response } from 'express';
import { alertService } from '../services/alert.service';
import { logger } from '../utils/logger';

export class AlertController {
  async getAllAlerts(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        type: req.query.type as any,
        severity: req.query.severity as any,
        resolved: req.query.resolved === 'true',
        recipientId: req.query.recipientId as string,
      };

      const alerts = await alertService.getAllAlerts(filters);

      res.status(200).json({
        success: true,
        data: alerts,
        count: alerts.length,
      });
    } catch (error) {
      logger.error('Error in getAllAlerts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve alerts',
      });
    }
  }

  async getAlertById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const alert = await alertService.getAlertById(id);

      if (!alert) {
        res.status(404).json({
          success: false,
          error: 'Alert not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: alert,
      });
    } catch (error) {
      logger.error('Error in getAlertById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve alert',
      });
    }
  }

  async createAlert(req: Request, res: Response): Promise<void> {
    try {
      const alert = await alertService.createAlert(req.body);

      res.status(201).json({
        success: true,
        data: alert,
        message: 'Alert created successfully',
      });
    } catch (error) {
      logger.error('Error in createAlert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create alert',
      });
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || 'system';

      const alert = await alertService.markAsRead(id, userId);

      res.status(200).json({
        success: true,
        data: alert,
        message: 'Alert marked as read',
      });
    } catch (error) {
      logger.error('Error in markAsRead:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark alert as read',
      });
    }
  }

  async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const userId = (req as any).user?.id || 'system';

      const alert = await alertService.resolveAlert(id, userId, notes);

      res.status(200).json({
        success: true,
        data: alert,
        message: 'Alert resolved successfully',
      });
    } catch (error) {
      logger.error('Error in resolveAlert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to resolve alert',
      });
    }
  }

  async takeAction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { action, notes } = req.body;
      const userId = (req as any).user?.id || 'system';

      const alert = await alertService.takeAction(id, action, userId, notes);

      res.status(200).json({
        success: true,
        data: alert,
        message: 'Action taken on alert',
      });
    } catch (error) {
      logger.error('Error in takeAction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to take action on alert',
      });
    }
  }

  async escalateAlert(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { escalateTo } = req.body;

      const alert = await alertService.escalateAlert(id, escalateTo);

      res.status(200).json({
        success: true,
        data: alert,
        message: 'Alert escalated successfully',
      });
    } catch (error) {
      logger.error('Error in escalateAlert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to escalate alert',
      });
    }
  }

  async getUnreadAlerts(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || req.query.userId as string;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
        return;
      }

      const alerts = await alertService.getUnreadAlerts(userId);

      res.status(200).json({
        success: true,
        data: alerts,
        count: alerts.length,
      });
    } catch (error) {
      logger.error('Error in getUnreadAlerts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve unread alerts',
      });
    }
  }

  async getCriticalAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await alertService.getCriticalAlerts();

      res.status(200).json({
        success: true,
        data: alerts,
        count: alerts.length,
      });
    } catch (error) {
      logger.error('Error in getCriticalAlerts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve critical alerts',
      });
    }
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        recipientId: req.query.recipientId as string,
      };

      const stats = await alertService.getAlertStats(filters);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error in getStats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve alert statistics',
      });
    }
  }
}

export const alertController = new AlertController();
