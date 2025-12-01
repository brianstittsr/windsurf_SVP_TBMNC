/**
 * AI PMI Insights Service
 * Project Management Institute best practices and recommendations
 */

import { aiProviderService } from './ai-provider.service';
import { isFeatureEnabled } from './ai.config';
import { Supplier, Deliverable, Assignment } from '../../types/enhanced.types';
import { logger } from '../../utils/logger';

export interface PMIInsight {
  category: string;
  knowledgeArea: string;
  processGroup: string;
  insight: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  effort: string;
  expectedBenefit: string;
}

export interface PMIAnalysis {
  supplierId: string;
  supplierName: string;
  
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  healthScore: number; // 0-100
  
  insights: PMIInsight[];
  
  knowledgeAreaAssessment: {
    integration: number; // 0-100
    scope: number;
    schedule: number;
    cost: number;
    quality: number;
    resource: number;
    communications: number;
    risk: number;
    procurement: number;
    stakeholder: number;
  };
  
  processGroupStatus: {
    initiating: string;
    planning: string;
    executing: string;
    monitoring: string;
    closing: string;
  };
  
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  
  quickWins: string[];
  strategicInitiatives: string[];
  
  lessonsLearned: string[];
  bestPractices: string[];
  
  analysisDate: Date;
}

export class PMIInsightsService {
  /**
   * Generate comprehensive PMI analysis
   */
  async generatePMIInsights(
    supplier: Supplier,
    deliverables: Deliverable[],
    assignments: Assignment[]
  ): Promise<PMIAnalysis> {
    if (!isFeatureEnabled('pmiInsights')) {
      throw new Error('AI PMI insights are disabled');
    }

    logger.info(`Generating PMI insights for supplier: ${supplier.id}`);

    try {
      const context = this.buildProjectContext(supplier, deliverables, assignments);

      const aiResponse = await aiProviderService.generateStructuredResponse<{
        overallHealth: string;
        healthScore: number;
        insights: PMIInsight[];
        knowledgeAreaAssessment: any;
        processGroupStatus: any;
        strengths: string[];
        weaknesses: string[];
        opportunities: string[];
        threats: string[];
        quickWins: string[];
        strategicInitiatives: string[];
        lessonsLearned: string[];
        bestPractices: string[];
      }>(
        this.buildInsightsPrompt(context),
        this.getInsightsSchema(),
        {
          systemPrompt: this.getSystemPrompt(),
          temperature: 0.4,
        }
      );

      const analysis: PMIAnalysis = {
        supplierId: supplier.id,
        supplierName: supplier.companyName,
        overallHealth: aiResponse.overallHealth as any,
        healthScore: aiResponse.healthScore,
        insights: aiResponse.insights,
        knowledgeAreaAssessment: aiResponse.knowledgeAreaAssessment,
        processGroupStatus: aiResponse.processGroupStatus,
        strengths: aiResponse.strengths,
        weaknesses: aiResponse.weaknesses,
        opportunities: aiResponse.opportunities,
        threats: aiResponse.threats,
        quickWins: aiResponse.quickWins,
        strategicInitiatives: aiResponse.strategicInitiatives,
        lessonsLearned: aiResponse.lessonsLearned,
        bestPractices: aiResponse.bestPractices,
        analysisDate: new Date(),
      };

      logger.info(`PMI insights generated for ${supplier.id}: Health ${analysis.overallHealth}`);

      return analysis;
    } catch (error) {
      logger.error('PMI insights generation failed:', error);
      throw error;
    }
  }

  /**
   * Build project context for AI
   */
  private buildProjectContext(
    supplier: Supplier,
    deliverables: Deliverable[],
    assignments: Assignment[]
  ): string {
    const context = {
      project: {
        name: `${supplier.companyName} TBMNC Qualification`,
        stage: supplier.currentStage,
        progress: supplier.progressPercentage,
        daysInProcess: supplier.totalDaysInProcess,
        riskLevel: supplier.riskLevel,
      },
      
      scope: {
        onboardingCompleted: supplier.onboardingCompleted,
        categories: supplier.categories,
        proposedProducts: supplier.tbmncAlignment.proposedProducts,
      },
      
      schedule: {
        totalDeliverables: deliverables.length,
        completed: deliverables.filter((d) => d.status === 'completed').length,
        inProgress: deliverables.filter((d) => d.status === 'in-progress').length,
        overdue: deliverables.filter((d) => d.status === 'overdue').length,
        blocked: deliverables.filter((d) => d.status === 'blocked').length,
      },
      
      resources: {
        assignedAffiliates: assignments.length,
        activeAssignments: assignments.filter((a) => a.status === 'active').length,
        teamSize: supplier.team.length,
      },
      
      quality: {
        certifications: {
          iso9001: supplier.certifications.iso9001.certified,
          iatf16949: supplier.certifications.iatf16949.certified,
        },
        qualityManagementSystem: supplier.certifications.qualityManagementSystem,
      },
      
      risk: {
        level: supplier.riskLevel,
        factors: supplier.riskFactors,
      },
      
      stakeholder: {
        primaryContact: supplier.primaryContact,
        teamMembers: supplier.team.length,
        assignedAffiliates: supplier.assignedAffiliates.length,
      },
    };

    return JSON.stringify(context, null, 2);
  }

  /**
   * Build AI prompt for PMI insights
   */
  private buildInsightsPrompt(context: string): string {
    return `
Analyze this Toyota Battery Manufacturing (TBMNC) supplier qualification project using PMI (Project Management Institute) best practices and provide comprehensive insights.

PROJECT CONTEXT:
${context}

ANALYSIS REQUIREMENTS:

1. Overall Project Health:
   - Assess overall health (excellent/good/fair/poor)
   - Calculate health score (0-100)

2. PMI Knowledge Area Assessment (score 0-100 for each):
   - Integration Management
   - Scope Management
   - Schedule Management
   - Cost Management
   - Quality Management
   - Resource Management
   - Communications Management
   - Risk Management
   - Procurement Management
   - Stakeholder Management

3. Process Group Status:
   - Initiating: assessment
   - Planning: assessment
   - Executing: assessment
   - Monitoring & Controlling: assessment
   - Closing: assessment

4. SWOT Analysis:
   - Strengths
   - Weaknesses
   - Opportunities
   - Threats

5. Actionable Insights:
   - Specific PMI-based recommendations
   - Knowledge area and process group for each
   - Priority (high/medium/low)
   - Expected impact and effort
   - Expected benefit

6. Quick Wins:
   - Easy improvements with immediate impact

7. Strategic Initiatives:
   - Longer-term improvements for major impact

8. Lessons Learned:
   - Key takeaways from current progress

9. Best Practices:
   - PMI best practices being followed

Provide specific, actionable recommendations aligned with PMI PMBOK Guide. Focus on TBMNC qualification success.
`;
  }

  /**
   * Get system prompt for AI
   */
  private getSystemPrompt(): string {
    return `You are a certified PMP (Project Management Professional) and expert in PMI methodologies. You specialize in automotive supplier development and Toyota production systems. Provide detailed PMI-aligned analysis with specific, actionable recommendations based on PMBOK Guide best practices.`;
  }

  /**
   * Get JSON schema for insights
   */
  private getInsightsSchema(): any {
    return {
      overallHealth: 'string (excellent|good|fair|poor)',
      healthScore: 'number (0-100)',
      insights: [
        {
          category: 'string',
          knowledgeArea: 'string',
          processGroup: 'string',
          insight: 'string',
          recommendation: 'string',
          priority: 'string (high|medium|low)',
          impact: 'string',
          effort: 'string',
          expectedBenefit: 'string',
        },
      ],
      knowledgeAreaAssessment: {
        integration: 'number (0-100)',
        scope: 'number (0-100)',
        schedule: 'number (0-100)',
        cost: 'number (0-100)',
        quality: 'number (0-100)',
        resource: 'number (0-100)',
        communications: 'number (0-100)',
        risk: 'number (0-100)',
        procurement: 'number (0-100)',
        stakeholder: 'number (0-100)',
      },
      processGroupStatus: {
        initiating: 'string',
        planning: 'string',
        executing: 'string',
        monitoring: 'string',
        closing: 'string',
      },
      strengths: ['string'],
      weaknesses: ['string'],
      opportunities: ['string'],
      threats: ['string'],
      quickWins: ['string'],
      strategicInitiatives: ['string'],
      lessonsLearned: ['string'],
      bestPractices: ['string'],
    };
  }

  /**
   * Get knowledge area recommendations
   */
  async getKnowledgeAreaRecommendations(
    knowledgeArea: string,
    supplier: Supplier
  ): Promise<string[]> {
    const recommendations: Record<string, string[]> = {
      integration: [
        'Establish integrated change control process',
        'Create project charter with clear objectives',
        'Develop comprehensive project management plan',
      ],
      scope: [
        'Define clear scope statement',
        'Create work breakdown structure (WBS)',
        'Implement scope change control',
      ],
      schedule: [
        'Develop detailed project schedule',
        'Identify critical path activities',
        'Implement schedule monitoring and control',
      ],
      cost: [
        'Establish cost baseline',
        'Implement earned value management',
        'Monitor cost performance regularly',
      ],
      quality: [
        'Define quality standards and metrics',
        'Implement quality assurance processes',
        'Conduct regular quality audits',
      ],
      resource: [
        'Develop resource management plan',
        'Optimize resource allocation',
        'Build high-performing team',
      ],
      communications: [
        'Create communications management plan',
        'Establish regular stakeholder updates',
        'Implement effective reporting mechanisms',
      ],
      risk: [
        'Conduct comprehensive risk assessment',
        'Develop risk response strategies',
        'Monitor and control risks continuously',
      ],
      procurement: [
        'Plan procurement management',
        'Conduct supplier evaluations',
        'Manage contracts effectively',
      ],
      stakeholder: [
        'Identify all stakeholders',
        'Analyze stakeholder engagement levels',
        'Develop stakeholder engagement strategies',
      ],
    };

    return recommendations[knowledgeArea.toLowerCase()] || [];
  }

  /**
   * Calculate simple health score (fallback)
   */
  calculateSimpleHealthScore(supplier: Supplier, deliverables: Deliverable[]): number {
    let score = 0;

    // Progress (30 points)
    score += (supplier.progressPercentage / 100) * 30;

    // Deliverables (30 points)
    const completedRate = deliverables.filter((d) => d.status === 'completed').length / deliverables.length;
    score += completedRate * 30;

    // Risk (20 points)
    const riskScores = { low: 20, medium: 15, high: 10, critical: 5 };
    score += riskScores[supplier.riskLevel];

    // Resources (20 points)
    if (supplier.assignedAffiliates.length > 0) score += 10;
    if (supplier.team.length >= 3) score += 10;

    return Math.round(score);
  }
}

export const pmiInsightsService = new PMIInsightsService();
