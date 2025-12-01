/**
 * Affiliate Controller
 * Handles HTTP requests for affiliate operations
 */

import { Request, Response } from 'express';
import { affiliateService } from '../services/affiliate.service';
import { logger } from '../utils/logger';

export class AffiliateController {
  async getAllAffiliates(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as any,
        serviceCategory: req.query.serviceCategory as string,
        availability: req.query.availability as any,
      };

      const affiliates = await affiliateService.getAllAffiliates(filters);

      res.status(200).json({
        success: true,
        data: affiliates,
        count: affiliates.length,
      });
    } catch (error) {
      logger.error('Error in getAllAffiliates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve affiliates',
      });
    }
  }

  async getAffiliateById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const affiliate = await affiliateService.getAffiliateById(id);

      if (!affiliate) {
        res.status(404).json({
          success: false,
          error: 'Affiliate not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: affiliate,
      });
    } catch (error) {
      logger.error('Error in getAffiliateById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve affiliate',
      });
    }
  }

  async createAffiliate(req: Request, res: Response): Promise<void> {
    try {
      const affiliate = await affiliateService.createAffiliate(req.body);

      res.status(201).json({
        success: true,
        data: affiliate,
        message: 'Affiliate created successfully',
      });
    } catch (error) {
      logger.error('Error in createAffiliate:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create affiliate',
      });
    }
  }

  async updateAffiliate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const affiliate = await affiliateService.updateAffiliate(id, req.body);

      res.status(200).json({
        success: true,
        data: affiliate,
        message: 'Affiliate updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateAffiliate:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update affiliate',
      });
    }
  }

  async deleteAffiliate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await affiliateService.deleteAffiliate(id);

      res.status(200).json({
        success: true,
        message: 'Affiliate deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteAffiliate:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete affiliate',
      });
    }
  }

  async approveAffiliate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || 'system';

      const affiliate = await affiliateService.approveAffiliate(id, userId);

      res.status(200).json({
        success: true,
        data: affiliate,
        message: 'Affiliate approved successfully',
      });
    } catch (error) {
      logger.error('Error in approveAffiliate:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to approve affiliate',
      });
    }
  }

  async rejectAffiliate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const affiliate = await affiliateService.rejectAffiliate(id, reason);

      res.status(200).json({
        success: true,
        data: affiliate,
        message: 'Affiliate rejected',
      });
    } catch (error) {
      logger.error('Error in rejectAffiliate:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reject affiliate',
      });
    }
  }

  async updateCapacity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { currentLoad } = req.body;

      await affiliateService.updateCapacity(id, currentLoad);

      res.status(200).json({
        success: true,
        message: 'Capacity updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateCapacity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update capacity',
      });
    }
  }
}

export const affiliateController = new AffiliateController();
