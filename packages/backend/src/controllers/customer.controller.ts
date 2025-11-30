import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/data-source';
import { Customer } from '../entities/Customer';
import { QualificationStage } from '../entities/QualificationStage';
import { Document } from '../entities/Document';
import { AppError } from '../middleware/error-handler';

export class CustomerController {
  private customerRepository = AppDataSource.getRepository(Customer);
  private stageRepository = AppDataSource.getRepository(QualificationStage);
  private documentRepository = AppDataSource.getRepository(Document);

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerData = req.body;
      const customer = this.customerRepository.create(customerData);
      const savedCustomer = await this.customerRepository.save(customer);

      // Create initial qualification stages
      for (let i = 1; i <= 5; i++) {
        const stage = this.stageRepository.create({
          customerId: savedCustomer.id,
          stageNumber: i,
          status: i === 1 ? 'in_progress' : 'not_started',
        });
        await this.stageRepository.save(stage);
      }

      res.status(201).json({
        success: true,
        data: savedCustomer,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const customer = await this.customerRepository.findOne({
        where: { id },
        relations: ['qualificationStages', 'documents', 'users'],
      });

      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      res.json({
        success: true,
        data: customer,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const customer = await this.customerRepository.findOne({ where: { id } });
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      Object.assign(customer, updateData);
      const updatedCustomer = await this.customerRepository.save(customer);

      res.json({
        success: true,
        data: updatedCustomer,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const queryBuilder = this.customerRepository.createQueryBuilder('customer');

      if (status) {
        queryBuilder.where('customer.status = :status', { status });
      }

      const [customers, total] = await queryBuilder
        .skip(skip)
        .take(Number(limit))
        .getManyAndCount();

      res.json({
        success: true,
        data: customers,
        meta: {
          timestamp: new Date().toISOString(),
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getStages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const stages = await this.stageRepository.find({
        where: { customerId: id },
        order: { stageNumber: 'ASC' },
      });

      res.json({
        success: true,
        data: stages,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const customer = await this.customerRepository.findOne({
        where: { id },
        relations: ['qualificationStages'],
      });

      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      const completedStages = customer.qualificationStages.filter(
        (s) => s.status === 'completed'
      ).length;
      const totalStages = customer.qualificationStages.length;
      const progressPercentage = (completedStages / totalStages) * 100;

      res.json({
        success: true,
        data: {
          customerId: id,
          currentStage: customer.currentStage,
          completedStages,
          totalStages,
          progressPercentage,
          stages: customer.qualificationStages,
        },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const documents = await this.documentRepository.find({
        where: { customerId: id },
        order: { createdAt: 'DESC' },
      });

      res.json({
        success: true,
        data: documents,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
}
