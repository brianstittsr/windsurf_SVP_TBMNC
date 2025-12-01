import { Request, Response, NextFunction } from 'express';
import customerService from '../services/customer.service';
import { logger } from '../utils/logger';

export class CustomerController {
  async getAllCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, stage, assignedTo } = req.query;

      const filters: any = {};
      if (status) filters.status = status as string;
      if (stage) filters.stage = parseInt(stage as string);
      if (assignedTo) filters.assignedTo = assignedTo as string;

      const customers = await customerService.getAllCustomers(filters);

      res.json({
        success: true,
        count: customers.length,
        data: customers,
      });
    } catch (error) {
      logger.error('Error in getAllCustomers:', error);
      next(error);
    }
  }

  async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await customerService.getCustomerById(id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }

      res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      logger.error('Error in getCustomerById:', error);
      next(error);
    }
  }

  async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customerData = {
        ...req.body,
        status: req.body.status || 'pending',
        currentStage: req.body.currentStage || 1,
        createdBy: req.body.userId || 'system', // TODO: Get from auth
      };

      const customer = await customerService.createCustomer(customerData);

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: customer,
      });
    } catch (error) {
      logger.error('Error in createCustomer:', error);
      next(error);
    }
  }

  async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await customerService.updateCustomer(id, req.body);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }

      res.json({
        success: true,
        message: 'Customer updated successfully',
        data: customer,
      });
    } catch (error) {
      logger.error('Error in updateCustomer:', error);
      next(error);
    }
  }

  async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await customerService.deleteCustomer(id);

      res.json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteCustomer:', error);
      next(error);
    }
  }

  async getCustomerStages(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stages = await customerService.getCustomerStages(id);

      res.json({
        success: true,
        count: stages.length,
        data: stages,
      });
    } catch (error) {
      logger.error('Error in getCustomerStages:', error);
      next(error);
    }
  }

  async getCustomerDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const documents = await customerService.getCustomerDocuments(id);

      res.json({
        success: true,
        count: documents.length,
        data: documents,
      });
    } catch (error) {
      logger.error('Error in getCustomerDocuments:', error);
      next(error);
    }
  }

  async getCustomerProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await customerService.getCustomerById(id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }

      const stages = await customerService.getCustomerStages(id);
      const totalStages = 7; // As per schema
      const completedStages = stages.filter((s: any) => s.status === 'completed').length;

      res.json({
        success: true,
        data: {
          customerId: id,
          companyName: customer.companyName,
          currentStage: customer.currentStage,
          totalStages,
          completedStages,
          progress: Math.round((completedStages / totalStages) * 100),
          stages,
        },
      });
    } catch (error) {
      logger.error('Error in getCustomerProgress:', error);
      next(error);
    }
  }
}

export default new CustomerController();
