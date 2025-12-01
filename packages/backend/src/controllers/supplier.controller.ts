/**
 * Supplier Controller
 * Handles HTTP requests for supplier operations
 */

import { Request, Response } from 'express';
import { supplierService } from '../services/supplier.service';
import { logger } from '../utils/logger';

export class SupplierController {
  /**
   * Get all suppliers
   */
  async getAllSuppliers(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as any,
        stage: req.query.stage ? parseInt(req.query.stage as string) : undefined,
        riskLevel: req.query.riskLevel as any,
        assignedAffiliate: req.query.assignedAffiliate as string,
      };

      const suppliers = await supplierService.getAllSuppliers(filters);

      res.status(200).json({
        success: true,
        data: suppliers,
        count: suppliers.length,
      });
    } catch (error) {
      logger.error('Error in getAllSuppliers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve suppliers',
      });
    }
  }

  /**
   * Get supplier by ID
   */
  async getSupplierById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supplier = await supplierService.getSupplierById(id);

      if (!supplier) {
        res.status(404).json({
          success: false,
          error: 'Supplier not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      logger.error('Error in getSupplierById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve supplier',
      });
    }
  }

  /**
   * Create new supplier
   */
  async createSupplier(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || 'system';
      const supplierData = {
        ...req.body,
        createdBy: userId,
      };

      const supplier = await supplierService.createSupplier(supplierData);

      res.status(201).json({
        success: true,
        data: supplier,
        message: 'Supplier created successfully',
      });
    } catch (error) {
      logger.error('Error in createSupplier:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create supplier',
      });
    }
  }

  /**
   * Update supplier
   */
  async updateSupplier(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || 'system';

      const supplier = await supplierService.updateSupplier(id, req.body, userId);

      res.status(200).json({
        success: true,
        data: supplier,
        message: 'Supplier updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateSupplier:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update supplier',
      });
    }
  }

  /**
   * Delete supplier
   */
  async deleteSupplier(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await supplierService.deleteSupplier(id);

      res.status(200).json({
        success: true,
        message: 'Supplier deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteSupplier:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete supplier',
      });
    }
  }

  /**
   * Update supplier status
   */
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = (req as any).user?.id || 'system';

      const supplier = await supplierService.updateStatus(id, status, userId);

      res.status(200).json({
        success: true,
        data: supplier,
        message: 'Supplier status updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateStatus:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update supplier status',
      });
    }
  }

  /**
   * Update supplier stage
   */
  async updateStage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { stage } = req.body;
      const userId = (req as any).user?.id || 'system';

      const supplier = await supplierService.updateStage(id, stage, userId);

      res.status(200).json({
        success: true,
        data: supplier,
        message: 'Supplier stage updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateStage:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update supplier stage',
      });
    }
  }

  /**
   * Update supplier progress
   */
  async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { percentage } = req.body;
      const userId = (req as any).user?.id || 'system';

      const supplier = await supplierService.updateProgress(id, percentage, userId);

      res.status(200).json({
        success: true,
        data: supplier,
        message: 'Supplier progress updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateProgress:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update supplier progress',
      });
    }
  }

  /**
   * Assign affiliate to supplier
   */
  async assignAffiliate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { affiliateId } = req.body;
      const userId = (req as any).user?.id || 'system';

      const supplier = await supplierService.assignAffiliate(id, affiliateId, userId);

      res.status(200).json({
        success: true,
        data: supplier,
        message: 'Affiliate assigned successfully',
      });
    } catch (error) {
      logger.error('Error in assignAffiliate:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign affiliate',
      });
    }
  }

  /**
   * Remove affiliate from supplier
   */
  async removeAffiliate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { affiliateId } = req.body;
      const userId = (req as any).user?.id || 'system';

      const supplier = await supplierService.removeAffiliate(id, affiliateId, userId);

      res.status(200).json({
        success: true,
        data: supplier,
        message: 'Affiliate removed successfully',
      });
    } catch (error) {
      logger.error('Error in removeAffiliate:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove affiliate',
      });
    }
  }

  /**
   * Complete supplier onboarding
   */
  async completeOnboarding(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || 'system';

      const supplier = await supplierService.completeOnboarding(id, userId);

      res.status(200).json({
        success: true,
        data: supplier,
        message: 'Onboarding completed successfully',
      });
    } catch (error) {
      logger.error('Error in completeOnboarding:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete onboarding',
      });
    }
  }

  /**
   * Get supplier statistics
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as any,
      };

      const stats = await supplierService.getSupplierStats(filters);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error in getStats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve supplier statistics',
      });
    }
  }
}

export const supplierController = new SupplierController();
