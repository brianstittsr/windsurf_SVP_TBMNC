/**
 * AI Timeline Prediction Service
 * PMI Schedule Management - predictive analytics for project completion
 */

import { aiProviderService } from './ai-provider.service';
import { isFeatureEnabled } from './ai.config';
import { Supplier, Deliverable } from '../../types/enhanced.types';
import { logger } from '../../utils/logger';

export interface ScheduleRisk {
  risk: string;
  impact: string; // e.g., "+2 weeks"
  probability: number; // 0-1
  mitigation: string;
}

export interface TimelinePrediction {
  supplierId: string;
  supplierName: string;
  currentStage: number;
  
  predictedCompletionDate: Date;
  confidence: number; // 0-1
  
  probabilityDistribution: {
    optimistic: Date; // 10th percentile
    mostLikely: Date; // 50th percentile
    pessimistic: Date; // 90th percentile
  };
  
  scheduleRisks: ScheduleRisk[];
  criticalPath: string[];
  recommendations: string[];
  
  pmiInsights: {
    schedulePerformanceIndex: number; // SPI
    scheduleVariance: number; // days
    estimateAtCompletion: Date;
    estimateToComplete: number; // days remaining
    forecastAccuracy: string;
  };
  
  analysisDate: Date;
}

export class TimelinePredictionService {
  /**
   * Predict project completion timeline
   */
  async predictTimeline(
    supplier: Supplier,
    deliverables: Deliverable[],
    historicalData?: any[]
  ): Promise<TimelinePrediction> {
    if (!isFeatureEnabled('timelinePredictions')) {
      throw new Error('AI timeline predictions are disabled');
    }

    logger.info(`Predicting timeline for supplier: ${supplier.id}`);

    try {
      // Build context
      const supplierContext = this.buildSupplierContext(supplier);
      const deliverablesContext = this.buildDeliverablesContext(deliverables);
      const historicalContext = this.buildHistoricalContext(historicalData);

      // Generate AI prediction
      const aiResponse = await aiProviderService.generateStructuredResponse<{
        predictedDaysToCompletion: number;
        confidence: number;
        optimisticDays: number;
        pessimisticDays: number;
        scheduleRisks: ScheduleRisk[];
        criticalPath: string[];
        recommendations: string[];
        pmiMetrics: any;
      }>(
        this.buildPredictionPrompt(supplierContext, deliverablesContext, historicalContext),
        this.getPredictionSchema(),
        {
          systemPrompt: this.getSystemPrompt(),
          temperature: 0.3, // Lower temperature for more consistent predictions
        }
      );

      const now = new Date();
      const prediction: TimelinePrediction = {
        supplierId: supplier.id,
        supplierName: supplier.companyName,
        currentStage: supplier.currentStage,
        
        predictedCompletionDate: this.addDays(now, aiResponse.predictedDaysToCompletion),
        confidence: aiResponse.confidence,
        
        probabilityDistribution: {
          optimistic: this.addDays(now, aiResponse.optimisticDays),
          mostLikely: this.addDays(now, aiResponse.predictedDaysToCompletion),
          pessimistic: this.addDays(now, aiResponse.pessimisticDays),
        },
        
        scheduleRisks: aiResponse.scheduleRisks,
        criticalPath: aiResponse.criticalPath,
        recommendations: aiResponse.recommendations,
        
        pmiInsights: {
          schedulePerformanceIndex: aiResponse.pmiMetrics.spi,
          scheduleVariance: aiResponse.pmiMetrics.scheduleVariance,
          estimateAtCompletion: this.addDays(now, aiResponse.pmiMetrics.estimateAtCompletion),
          estimateToComplete: aiResponse.pmiMetrics.estimateToComplete,
          forecastAccuracy: aiResponse.pmiMetrics.forecastAccuracy,
        },
        
        analysisDate: now,
      };

      logger.info(`Timeline prediction for ${supplier.id}: ${aiResponse.predictedDaysToCompletion} days`);

      return prediction;
    } catch (error) {
      logger.error('Timeline prediction failed:', error);
      throw error;
    }
  }

  /**
   * Build supplier context for AI
   */
  private buildSupplierContext(supplier: Supplier): string {
    const context = {
      company: supplier.companyName,
      currentStage: supplier.currentStage,
      progressPercentage: supplier.progressPercentage,
      daysInProcess: supplier.totalDaysInProcess,
      daysInCurrentStage: supplier.daysInCurrentStage,
      
      complexity: {
        companySize: supplier.companySize,
        batteryExperience: supplier.batteryExperience.hasExperience,
        automotiveExperience: supplier.automotiveExperience.hasExperience,
        certifications: {
          iso9001: supplier.certifications.iso9001.certified,
          iatf16949: supplier.certifications.iatf16949.certified,
        },
      },
      
      resources: {
        assignedAffiliates: supplier.assignedAffiliates.length,
        teamSize: supplier.team.length,
      },
      
      status: {
        riskLevel: supplier.riskLevel,
        onboardingCompleted: supplier.onboardingCompleted,
      },
    };

    return JSON.stringify(context, null, 2);
  }

  /**
   * Build deliverables context for AI
   */
  private buildDeliverablesContext(deliverables: Deliverable[]): string {
    const context = {
      total: deliverables.length,
      completed: deliverables.filter((d) => d.status === 'completed').length,
      inProgress: deliverables.filter((d) => d.status === 'in-progress').length,
      notStarted: deliverables.filter((d) => d.status === 'not-started').length,
      overdue: deliverables.filter((d) => d.status === 'overdue').length,
      blocked: deliverables.filter((d) => d.status === 'blocked').length,
      
      averageProgress: this.calculateAverageProgress(deliverables),
      
      deliverables: deliverables.map((d) => ({
        category: d.category,
        status: d.status,
        priority: d.priority,
        progress: d.progress.percentage,
        estimatedDuration: d.timing.estimatedDuration,
        timeSpent: d.timing.timeSpent,
        dependencies: d.dependencies.length,
        blockedBy: d.blockedBy.length,
      })),
    };

    return JSON.stringify(context, null, 2);
  }

  /**
   * Build historical context for AI
   */
  private buildHistoricalContext(historicalData?: any[]): string {
    if (!historicalData || historicalData.length === 0) {
      return 'No historical data available';
    }

    const context = {
      similarProjects: historicalData.length,
      averageCompletionTime: this.calculateAverageCompletionTime(historicalData),
      successRate: this.calculateSuccessRate(historicalData),
      commonDelays: this.identifyCommonDelays(historicalData),
    };

    return JSON.stringify(context, null, 2);
  }

  /**
   * Build AI prompt for timeline prediction
   */
  private buildPredictionPrompt(
    supplierContext: string,
    deliverablesContext: string,
    historicalContext: string
  ): string {
    return `
Predict the project completion timeline for a supplier seeking Toyota Battery Manufacturing (TBMNC) qualification using PMI Schedule Management best practices.

SUPPLIER STATUS:
${supplierContext}

DELIVERABLES STATUS:
${deliverablesContext}

HISTORICAL DATA:
${historicalContext}

PREDICTION REQUIREMENTS:

1. Estimate days to completion (most likely scenario)
2. Provide confidence level (0-1) for the prediction
3. Calculate optimistic (best case) and pessimistic (worst case) scenarios
4. Identify schedule risks with:
   - Risk description
   - Impact on timeline (e.g., "+2 weeks")
   - Probability (0-1)
   - Mitigation strategy
5. Identify critical path activities
6. Provide actionable recommendations to stay on schedule

7. Calculate PMI metrics:
   - Schedule Performance Index (SPI = EV/PV)
   - Schedule Variance (SV = EV - PV) in days
   - Estimate at Completion (EAC) in days
   - Estimate to Complete (ETC) in days
   - Forecast accuracy assessment

CONSIDERATIONS:
- Current progress and velocity
- Remaining deliverables and dependencies
- Resource availability
- Complexity factors (certifications, experience gaps)
- Historical performance of similar projects
- Risk level and blocking issues
- Toyota/TBMNC-specific requirements

Provide realistic, data-driven predictions. Consider both optimistic and pessimistic scenarios.
`;
  }

  /**
   * Get system prompt for AI
   */
  private getSystemPrompt(): string {
    return `You are an expert project scheduler with deep knowledge of PMI Schedule Management and automotive supplier qualification timelines. You specialize in predictive analytics and earned value management. Provide accurate, realistic timeline predictions with clear reasoning and risk assessment.`;
  }

  /**
   * Get JSON schema for predictions
   */
  private getPredictionSchema(): any {
    return {
      predictedDaysToCompletion: 'number',
      confidence: 'number (0-1)',
      optimisticDays: 'number',
      pessimisticDays: 'number',
      scheduleRisks: [
        {
          risk: 'string',
          impact: 'string',
          probability: 'number (0-1)',
          mitigation: 'string',
        },
      ],
      criticalPath: ['string'],
      recommendations: ['string'],
      pmiMetrics: {
        spi: 'number',
        scheduleVariance: 'number',
        estimateAtCompletion: 'number',
        estimateToComplete: 'number',
        forecastAccuracy: 'string',
      },
    };
  }

  /**
   * Calculate average progress across deliverables
   */
  private calculateAverageProgress(deliverables: Deliverable[]): number {
    if (deliverables.length === 0) return 0;
    
    const totalProgress = deliverables.reduce((sum, d) => sum + d.progress.percentage, 0);
    return totalProgress / deliverables.length;
  }

  /**
   * Calculate average completion time from historical data
   */
  private calculateAverageCompletionTime(historicalData: any[]): number {
    if (historicalData.length === 0) return 0;
    
    const total = historicalData.reduce((sum, project) => sum + (project.completionDays || 0), 0);
    return total / historicalData.length;
  }

  /**
   * Calculate success rate from historical data
   */
  private calculateSuccessRate(historicalData: any[]): number {
    if (historicalData.length === 0) return 0;
    
    const successful = historicalData.filter((p) => p.status === 'qualified').length;
    return (successful / historicalData.length) * 100;
  }

  /**
   * Identify common delays from historical data
   */
  private identifyCommonDelays(historicalData: any[]): string[] {
    const delays: Record<string, number> = {};
    
    historicalData.forEach((project) => {
      if (project.delays) {
        project.delays.forEach((delay: string) => {
          delays[delay] = (delays[delay] || 0) + 1;
        });
      }
    });
    
    return Object.entries(delays)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([delay]) => delay);
  }

  /**
   * Add days to a date
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Simple timeline prediction (fallback if AI fails)
   */
  calculateSimpleTimeline(supplier: Supplier, deliverables: Deliverable[]): number {
    // Calculate based on current velocity
    const completedDeliverables = deliverables.filter((d) => d.status === 'completed').length;
    const totalDeliverables = deliverables.length;
    
    if (completedDeliverables === 0) {
      // No progress yet, use average estimate
      return 90; // Default 90 days
    }
    
    const daysPerDeliverable = supplier.totalDaysInProcess / completedDeliverables;
    const remainingDeliverables = totalDeliverables - completedDeliverables;
    
    return Math.ceil(remainingDeliverables * daysPerDeliverable);
  }
}

export const timelinePredictionService = new TimelinePredictionService();
