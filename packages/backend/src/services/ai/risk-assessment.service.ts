/**
 * AI Risk Assessment Service
 * PMI-based risk management using AI
 */

import { aiProviderService } from './ai-provider.service';
import { isFeatureEnabled } from './ai.config';
import { Supplier, RiskLevel } from '../../types/enhanced.types';
import { logger } from '../../utils/logger';

export interface RiskFactor {
  category: 'technical' | 'financial' | 'schedule' | 'quality' | 'resource' | 'external';
  description: string;
  probability: number; // 0-1
  impact: 'low' | 'medium' | 'high' | 'critical';
  impactScore: number; // 1-10
  riskScore: number; // probability * impactScore
  mitigation: string;
  owner?: string;
  status: 'identified' | 'analyzing' | 'mitigating' | 'monitoring' | 'closed';
}

export interface RiskAssessment {
  supplierId: string;
  overallRiskScore: number; // 0-100
  riskLevel: RiskLevel;
  risks: RiskFactor[];
  recommendations: string[];
  pmiInsights: {
    riskManagementPlan: string;
    contingencyReserve: string;
    riskOwners: string[];
    monitoringFrequency: string;
  };
  assessmentDate: Date;
  nextReviewDate: Date;
}

export class RiskAssessmentService {
  /**
   * Perform comprehensive risk assessment for a supplier
   */
  async assessSupplierRisk(supplier: Supplier): Promise<RiskAssessment> {
    if (!isFeatureEnabled('riskAssessment')) {
      throw new Error('AI risk assessment is disabled');
    }
    
    logger.info(`Performing AI risk assessment for supplier: ${supplier.id}`);
    
    try {
      // Build context for AI
      const context = this.buildRiskContext(supplier);
      
      // Generate AI assessment
      const aiResponse = await aiProviderService.generateStructuredResponse<{
        risks: RiskFactor[];
        recommendations: string[];
        pmiInsights: any;
      }>(
        this.buildRiskPrompt(context),
        this.getRiskSchema(),
        {
          systemPrompt: this.getSystemPrompt(),
          temperature: 0.3, // Lower temperature for more consistent risk assessment
        }
      );
      
      // Calculate overall risk score
      const overallRiskScore = this.calculateOverallRiskScore(aiResponse.risks);
      const riskLevel = this.determineRiskLevel(overallRiskScore);
      
      // Determine next review date based on risk level
      const nextReviewDate = this.calculateNextReviewDate(riskLevel);
      
      const assessment: RiskAssessment = {
        supplierId: supplier.id,
        overallRiskScore,
        riskLevel,
        risks: aiResponse.risks,
        recommendations: aiResponse.recommendations,
        pmiInsights: aiResponse.pmiInsights,
        assessmentDate: new Date(),
        nextReviewDate,
      };
      
      logger.info(`Risk assessment completed for ${supplier.id}:`, {
        riskLevel,
        riskScore: overallRiskScore,
        riskCount: aiResponse.risks.length,
      });
      
      return assessment;
    } catch (error) {
      logger.error('Risk assessment failed:', error);
      throw error;
    }
  }
  
  /**
   * Build context from supplier data
   */
  private buildRiskContext(supplier: Supplier): string {
    const context = {
      company: {
        name: supplier.companyName,
        size: supplier.companySize,
        yearEstablished: supplier.yearEstablished,
        employeeCount: supplier.employeeCount,
        annualRevenue: supplier.annualRevenue,
      },
      batteryExperience: {
        hasExperience: supplier.batteryExperience.hasExperience,
        yearsInIndustry: supplier.batteryExperience.yearsInIndustry,
        batteryTypes: supplier.batteryExperience.batteryTypes,
      },
      automotiveExperience: {
        hasExperience: supplier.automotiveExperience.hasExperience,
        yearsInIndustry: supplier.automotiveExperience.yearsInIndustry,
        tierLevel: supplier.automotiveExperience.tierLevel,
        currentOEMs: supplier.automotiveExperience.currentOEMs,
      },
      technicalCapabilities: {
        automationLevel: supplier.technicalCapabilities.automationLevel,
        qualityControlSystems: supplier.technicalCapabilities.qualityControlSystems,
        rdCapabilities: supplier.technicalCapabilities.rdCapabilities.hasRD,
        patents: supplier.technicalCapabilities.patents,
      },
      certifications: {
        iso9001: supplier.certifications.iso9001.certified,
        iatf16949: supplier.certifications.iatf16949.certified,
        iso14001: supplier.certifications.iso14001.certified,
        iso45001: supplier.certifications.iso45001.certified,
      },
      financialInfo: {
        revenueRange: supplier.financialInfo.revenueRange,
        creditRating: supplier.financialInfo.creditRating,
        investmentCapacity: supplier.financialInfo.investmentCapacity,
      },
      sustainability: {
        environmentalCompliance: supplier.sustainability.environmentalCompliance,
        carbonFootprint: supplier.sustainability.carbonFootprint,
      },
      currentStatus: {
        stage: supplier.currentStage,
        daysInProcess: supplier.totalDaysInProcess,
        progressPercentage: supplier.progressPercentage,
      },
    };
    
    return JSON.stringify(context, null, 2);
  }
  
  /**
   * Build AI prompt for risk assessment
   */
  private buildRiskPrompt(context: string): string {
    return `
Perform a comprehensive risk assessment for a potential Toyota Battery Manufacturing (TBMNC) supplier using PMI risk management best practices.

SUPPLIER CONTEXT:
${context}

ASSESSMENT REQUIREMENTS:
1. Identify risks across all PMI risk categories:
   - Technical risks (capabilities, technology, quality)
   - Financial risks (stability, investment capacity)
   - Schedule risks (timeline, dependencies)
   - Quality risks (certifications, processes)
   - Resource risks (capacity, expertise)
   - External risks (market, regulatory)

2. For each risk:
   - Describe the risk clearly
   - Assess probability (0-1)
   - Determine impact level (low/medium/high/critical)
   - Assign impact score (1-10)
   - Provide specific mitigation strategies
   - Suggest risk owner role

3. Provide overall recommendations for risk management

4. Generate PMI-aligned insights:
   - Risk management plan summary
   - Contingency reserve recommendation
   - Risk ownership structure
   - Monitoring frequency

Focus on risks specific to becoming a TBMNC supplier, including:
- Battery manufacturing requirements
- Toyota quality standards (IATF 16949)
- Automotive industry experience
- Financial stability for long-term partnership
- Technical capability gaps
- Certification requirements

Provide actionable, specific recommendations.
`;
  }
  
  /**
   * Get system prompt for AI
   */
  private getSystemPrompt(): string {
    return `You are an expert project risk manager with deep knowledge of PMI risk management practices and automotive supplier qualification. You specialize in assessing supplier readiness for Toyota Battery Manufacturing. Provide thorough, actionable risk assessments with specific mitigation strategies.`;
  }
  
  /**
   * Get JSON schema for risk assessment
   */
  private getRiskSchema(): any {
    return {
      risks: [
        {
          category: 'string (technical|financial|schedule|quality|resource|external)',
          description: 'string',
          probability: 'number (0-1)',
          impact: 'string (low|medium|high|critical)',
          impactScore: 'number (1-10)',
          mitigation: 'string',
          owner: 'string (optional)',
          status: 'string (identified)',
        },
      ],
      recommendations: ['string'],
      pmiInsights: {
        riskManagementPlan: 'string',
        contingencyReserve: 'string',
        riskOwners: ['string'],
        monitoringFrequency: 'string',
      },
    };
  }
  
  /**
   * Calculate overall risk score from individual risks
   */
  private calculateOverallRiskScore(risks: RiskFactor[]): number {
    if (risks.length === 0) return 0;
    
    // Calculate weighted average of risk scores
    const totalRiskScore = risks.reduce((sum, risk) => {
      const riskScore = risk.probability * risk.impactScore;
      return sum + riskScore;
    }, 0);
    
    // Normalize to 0-100 scale
    const maxPossibleScore = risks.length * 10; // Max impact score is 10
    const normalizedScore = (totalRiskScore / maxPossibleScore) * 100;
    
    return Math.round(normalizedScore);
  }
  
  /**
   * Determine risk level from score
   */
  private determineRiskLevel(score: number): RiskLevel {
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }
  
  /**
   * Calculate next review date based on risk level
   */
  private calculateNextReviewDate(riskLevel: RiskLevel): Date {
    const now = new Date();
    const daysUntilReview = {
      critical: 7,   // Weekly for critical
      high: 14,      // Bi-weekly for high
      medium: 30,    // Monthly for medium
      low: 90,       // Quarterly for low
    };
    
    const days = daysUntilReview[riskLevel];
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  }
  
  /**
   * Monitor risks and generate alerts
   */
  async monitorRisks(assessment: RiskAssessment): Promise<string[]> {
    const alerts: string[] = [];
    
    // Check for high-probability, high-impact risks
    const criticalRisks = assessment.risks.filter(
      (r) => r.probability > 0.7 && (r.impact === 'high' || r.impact === 'critical')
    );
    
    if (criticalRisks.length > 0) {
      alerts.push(`${criticalRisks.length} critical risks require immediate attention`);
    }
    
    // Check if review is due
    if (new Date() >= assessment.nextReviewDate) {
      alerts.push('Risk assessment review is due');
    }
    
    // Check for unmitigated risks
    const unmitigatedRisks = assessment.risks.filter((r) => r.status === 'identified');
    if (unmitigatedRisks.length > 0) {
      alerts.push(`${unmitigatedRisks.length} risks have no mitigation plan`);
    }
    
    return alerts;
  }
}

export const riskAssessmentService = new RiskAssessmentService();
