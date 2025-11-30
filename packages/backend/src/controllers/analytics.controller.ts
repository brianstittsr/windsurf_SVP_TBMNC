import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/data-source';
import { Customer } from '../entities/Customer';
import { QualificationStage } from '../entities/QualificationStage';

export class AnalyticsController {
  private customerRepository = AppDataSource.getRepository(Customer);
  private stageRepository = AppDataSource.getRepository(QualificationStage);

  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalCustomers = await this.customerRepository.count();
      const activeCustomers = await this.customerRepository.count({
        where: { status: 'active' },
      });
      const qualifiedCustomers = await this.customerRepository.count({
        where: { status: 'qualified' },
      });

      // Calculate average time per stage
      const stages = await this.stageRepository.find({
        where: { status: 'completed' },
      });

      const avgTimePerStage = stages.reduce((acc, stage) => {
        if (stage.startedAt && stage.completedAt) {
          const duration = stage.completedAt.getTime() - stage.startedAt.getTime();
          return acc + duration;
        }
        return acc;
      }, 0) / (stages.length || 1);

      res.json({
        success: true,
        data: {
          totalCustomers,
          activeCustomers,
          qualifiedCustomers,
          avgTimePerStage: Math.round(avgTimePerStage / (1000 * 60 * 60 * 24)), // days
          conversionRate: totalCustomers > 0 ? (qualifiedCustomers / totalCustomers) * 100 : 0,
        },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getPipeline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pipeline = await this.customerRepository
        .createQueryBuilder('customer')
        .select('customer.currentStage', 'stage')
        .addSelect('COUNT(*)', 'count')
        .groupBy('customer.currentStage')
        .getRawMany();

      res.json({
        success: true,
        data: pipeline,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getCustomerAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const customer = await this.customerRepository.findOne({
        where: { id },
        relations: ['qualificationStages', 'documents'],
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: { message: 'Customer not found' },
        });
      }

      const completedStages = customer.qualificationStages.filter(
        (s) => s.status === 'completed'
      ).length;
      const documentCount = customer.documents.length;
      const approvedDocuments = customer.documents.filter((d) => d.status === 'approved').length;

      res.json({
        success: true,
        data: {
          customerId: id,
          companyName: customer.companyName,
          currentStage: customer.currentStage,
          completedStages,
          totalStages: customer.qualificationStages.length,
          documentCount,
          approvedDocuments,
          documentCompletionRate: documentCount > 0 ? (approvedDocuments / documentCount) * 100 : 0,
        },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
}
