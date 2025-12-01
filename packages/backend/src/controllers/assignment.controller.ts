/**
 * Assignment Controller
 * Handles HTTP requests for assignment operations
 */

import { Request, Response } from 'express';
import { assignmentService } from '../services/assignment.service';
import { logger } from '../utils/logger';

export class AssignmentController {
  async getAllAssignments(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        supplierId: req.query.supplierId as string,
        affiliateId: req.query.affiliateId as string,
        status: req.query.status as any,
      };

      const assignments = await assignmentService.getAllAssignments(filters);

      res.status(200).json({
        success: true,
        data: assignments,
        count: assignments.length,
      });
    } catch (error) {
      logger.error('Error in getAllAssignments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve assignments',
      });
    }
  }

  async getAssignmentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const assignment = await assignmentService.getAssignmentById(id);

      if (!assignment) {
        res.status(404).json({
          success: false,
          error: 'Assignment not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: assignment,
      });
    } catch (error) {
      logger.error('Error in getAssignmentById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve assignment',
      });
    }
  }

  async createAssignment(req: Request, res: Response): Promise<void> {
    try {
      const assignment = await assignmentService.createAssignment(req.body);

      res.status(201).json({
        success: true,
        data: assignment,
        message: 'Assignment created successfully',
      });
    } catch (error) {
      logger.error('Error in createAssignment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create assignment',
      });
    }
  }

  async updateAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const assignment = await assignmentService.updateAssignment(id, req.body);

      res.status(200).json({
        success: true,
        data: assignment,
        message: 'Assignment updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateAssignment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update assignment',
      });
    }
  }

  async deleteAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await assignmentService.deleteAssignment(id);

      res.status(200).json({
        success: true,
        message: 'Assignment deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteAssignment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete assignment',
      });
    }
  }

  async approveAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || 'system';

      const assignment = await assignmentService.approveAssignment(id, userId);

      res.status(200).json({
        success: true,
        data: assignment,
        message: 'Assignment approved successfully',
      });
    } catch (error) {
      logger.error('Error in approveAssignment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to approve assignment',
      });
    }
  }

  async completeAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const assignment = await assignmentService.completeAssignment(id);

      res.status(200).json({
        success: true,
        data: assignment,
        message: 'Assignment completed successfully',
      });
    } catch (error) {
      logger.error('Error in completeAssignment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete assignment',
      });
    }
  }

  async cancelAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const assignment = await assignmentService.cancelAssignment(id, reason);

      res.status(200).json({
        success: true,
        data: assignment,
        message: 'Assignment cancelled successfully',
      });
    } catch (error) {
      logger.error('Error in cancelAssignment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel assignment',
      });
    }
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        supplierId: req.query.supplierId as string,
        affiliateId: req.query.affiliateId as string,
      };

      const stats = await assignmentService.getAssignmentStats(filters);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error in getStats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve assignment statistics',
      });
    }
  }
}

export const assignmentController = new AssignmentController();
