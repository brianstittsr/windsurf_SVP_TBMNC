/**
 * Deliverable Controller
 * Handles HTTP requests for deliverable operations
 */

import { Request, Response } from 'express';
import { deliverableService } from '../services/deliverable.service';
import { logger } from '../utils/logger';

export class DeliverableController {
  async getAllDeliverables(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        supplierId: req.query.supplierId as string,
        assignmentId: req.query.assignmentId as string,
        status: req.query.status as any,
        category: req.query.category as string,
      };

      const deliverables = await deliverableService.getAllDeliverables(filters);

      res.status(200).json({
        success: true,
        data: deliverables,
        count: deliverables.length,
      });
    } catch (error) {
      logger.error('Error in getAllDeliverables:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve deliverables',
      });
    }
  }

  async getDeliverableById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deliverable = await deliverableService.getDeliverableById(id);

      if (!deliverable) {
        res.status(404).json({
          success: false,
          error: 'Deliverable not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: deliverable,
      });
    } catch (error) {
      logger.error('Error in getDeliverableById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve deliverable',
      });
    }
  }

  async createDeliverable(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || 'system';
      const deliverableData = {
        ...req.body,
        createdBy: userId,
      };

      const deliverable = await deliverableService.createDeliverable(deliverableData);

      res.status(201).json({
        success: true,
        data: deliverable,
        message: 'Deliverable created successfully',
      });
    } catch (error) {
      logger.error('Error in createDeliverable:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create deliverable',
      });
    }
  }

  async updateDeliverable(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || 'system';

      const deliverable = await deliverableService.updateDeliverable(id, req.body, userId);

      res.status(200).json({
        success: true,
        data: deliverable,
        message: 'Deliverable updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateDeliverable:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update deliverable',
      });
    }
  }

  async deleteDeliverable(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await deliverableService.deleteDeliverable(id);

      res.status(200).json({
        success: true,
        message: 'Deliverable deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteDeliverable:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete deliverable',
      });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = (req as any).user?.id || 'system';

      const deliverable = await deliverableService.updateStatus(id, status, userId);

      res.status(200).json({
        success: true,
        data: deliverable,
        message: 'Deliverable status updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateStatus:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update deliverable status',
      });
    }
  }

  async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { percentage } = req.body;
      const userId = (req as any).user?.id || 'system';

      const deliverable = await deliverableService.updateProgress(id, percentage, userId);

      res.status(200).json({
        success: true,
        data: deliverable,
        message: 'Deliverable progress updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateProgress:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update deliverable progress',
      });
    }
  }

  async completeMilestone(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { milestone } = req.body;

      await deliverableService.completeMilestone(id, milestone);

      res.status(200).json({
        success: true,
        message: 'Milestone completed successfully',
      });
    } catch (error) {
      logger.error('Error in completeMilestone:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete milestone',
      });
    }
  }

  async addNote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { note } = req.body;

      await deliverableService.addNote(id, note);

      res.status(200).json({
        success: true,
        message: 'Note added successfully',
      });
    } catch (error) {
      logger.error('Error in addNote:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add note',
      });
    }
  }

  async getOverdueDeliverables(req: Request, res: Response): Promise<void> {
    try {
      const deliverables = await deliverableService.checkOverdueDeliverables();

      res.status(200).json({
        success: true,
        data: deliverables,
        count: deliverables.length,
      });
    } catch (error) {
      logger.error('Error in getOverdueDeliverables:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve overdue deliverables',
      });
    }
  }
}

export const deliverableController = new DeliverableController();
