/**
 * AI Assignment Recommendation Service
 * PMI Resource Management - intelligent affiliate-supplier matching
 */

import { aiProviderService } from './ai-provider.service';
import { isFeatureEnabled } from './ai.config';
import { Supplier, Affiliate } from '../../types/enhanced.types';
import { logger } from '../../utils/logger';

export interface AffiliateRecommendation {
  affiliateId: string;
  affiliateName: string;
  matchScore: number; // 0-100
  reasoning: string;
  services: string[];
  estimatedDuration: string;
  estimatedCost: string;
  successProbability: number; // 0-1
  strengths: string[];
  concerns: string[];
  availability: string;
}

export interface AssignmentRecommendations {
  supplierId: string;
  supplierName: string;
  recommendations: AffiliateRecommendation[];
  analysisDate: Date;
  pmiInsights: {
    resourcePlan: string;
    teamStructure: string;
    skillGaps: string[];
    developmentNeeds: string[];
  };
}

export class AssignmentRecommendationService {
  /**
   * Generate affiliate recommendations for a supplier
   */
  async recommendAffiliates(
    supplier: Supplier,
    availableAffiliates: Affiliate[],
    topN: number = 5
  ): Promise<AssignmentRecommendations> {
    if (!isFeatureEnabled('assignmentRecommendations')) {
      throw new Error('AI assignment recommendations are disabled');
    }

    logger.info(`Generating affiliate recommendations for supplier: ${supplier.id}`);

    try {
      // Build context
      const supplierContext = this.buildSupplierContext(supplier);
      const affiliatesContext = this.buildAffiliatesContext(availableAffiliates);

      // Generate AI recommendations
      const aiResponse = await aiProviderService.generateStructuredResponse<{
        recommendations: AffiliateRecommendation[];
        pmiInsights: any;
      }>(
        this.buildRecommendationPrompt(supplierContext, affiliatesContext, topN),
        this.getRecommendationSchema(),
        {
          systemPrompt: this.getSystemPrompt(),
          temperature: 0.4, // Lower temperature for more consistent matching
        }
      );

      const recommendations: AssignmentRecommendations = {
        supplierId: supplier.id,
        supplierName: supplier.companyName,
        recommendations: aiResponse.recommendations.slice(0, topN),
        analysisDate: new Date(),
        pmiInsights: aiResponse.pmiInsights,
      };

      logger.info(`Generated ${recommendations.recommendations.length} recommendations for ${supplier.id}`);

      return recommendations;
    } catch (error) {
      logger.error('Assignment recommendation failed:', error);
      throw error;
    }
  }

  /**
   * Build supplier context for AI
   */
  private buildSupplierContext(supplier: Supplier): string {
    const context = {
      company: {
        name: supplier.companyName,
        size: supplier.companySize,
        location: `${supplier.headquarters.city}, ${supplier.headquarters.state}`,
      },
      needs: {
        batteryExperience: supplier.batteryExperience.hasExperience,
        automotiveExperience: supplier.automotiveExperience.hasExperience,
        certifications: {
          iso9001: supplier.certifications.iso9001.certified,
          iatf16949: supplier.certifications.iatf16949.certified,
        },
        technicalCapabilities: supplier.technicalCapabilities.automationLevel,
        rdCapabilities: supplier.technicalCapabilities.rdCapabilities.hasRD,
      },
      gaps: {
        missingCertifications: this.identifyMissingCertifications(supplier),
        technicalGaps: this.identifyTechnicalGaps(supplier),
        experienceGaps: this.identifyExperienceGaps(supplier),
      },
      alignment: {
        motivation: supplier.tbmncAlignment.motivation,
        proposedProducts: supplier.tbmncAlignment.proposedProducts,
        investmentReadiness: supplier.tbmncAlignment.investmentReadiness,
      },
    };

    return JSON.stringify(context, null, 2);
  }

  /**
   * Build affiliates context for AI
   */
  private buildAffiliatesContext(affiliates: Affiliate[]): string {
    const context = affiliates.map((a) => ({
      id: a.id,
      name: a.name,
      services: a.serviceOfferings.categories,
      specificServices: a.serviceOfferings.specificServices,
      expertise: {
        certifications: a.expertise.certifications,
        automotiveYears: a.expertise.industryExperience.automotive,
        batteryYears: a.expertise.industryExperience.battery,
        toyotaExperience: a.expertise.toyotaExperience,
        toyotaProjects: a.expertise.toyotaProjects,
      },
      capacity: {
        currentLoad: a.capacity.currentLoad,
        maxCapacity: a.capacity.maxCapacity,
        availability: a.capacity.availability,
        geographicPreferences: a.capacity.geographicPreferences,
      },
      performance: {
        averageRating: a.performance.averageRating,
        onTimeRate: a.performance.onTimeDeliveryRate,
        clientSatisfaction: a.performance.clientSatisfactionScore,
      },
      pricing: {
        structure: a.serviceOfferings.pricing.structure,
        hourlyRate: a.serviceOfferings.pricing.hourlyRate,
      },
    }));

    return JSON.stringify(context, null, 2);
  }

  /**
   * Build AI prompt for recommendations
   */
  private buildRecommendationPrompt(
    supplierContext: string,
    affiliatesContext: string,
    topN: number
  ): string {
    return `
Analyze the supplier's needs and recommend the best ${topN} affiliates to help them qualify for Toyota Battery Manufacturing (TBMNC) using PMI Resource Management best practices.

SUPPLIER PROFILE:
${supplierContext}

AVAILABLE AFFILIATES:
${affiliatesContext}

MATCHING CRITERIA:
1. Service Alignment: Match affiliate services to supplier gaps
2. Experience: Prioritize automotive and battery industry experience
3. Toyota Knowledge: Value Toyota/TBMNC-specific experience
4. Performance: Consider ratings, on-time delivery, satisfaction
5. Capacity: Ensure affiliate has availability
6. Geographic Fit: Consider location preferences
7. Cost-Effectiveness: Balance quality with pricing
8. Success Probability: Assess likelihood of successful outcome

For each recommended affiliate:
- Calculate match score (0-100) based on weighted criteria
- Provide clear reasoning for the recommendation
- List specific services they should provide
- Estimate project duration and cost
- Calculate success probability
- Identify strengths and any concerns
- Note current availability

Also provide PMI-aligned insights:
- Resource management plan
- Recommended team structure
- Skill gaps to address
- Development needs

Be specific and actionable. Focus on TBMNC qualification requirements.
`;
  }

  /**
   * Get system prompt for AI
   */
  private getSystemPrompt(): string {
    return `You are an expert resource manager specializing in PMI resource management practices and automotive supplier development. You excel at matching service providers (affiliates) with companies seeking Toyota Battery Manufacturing qualification. Provide data-driven, specific recommendations with clear reasoning.`;
  }

  /**
   * Get JSON schema for recommendations
   */
  private getRecommendationSchema(): any {
    return {
      recommendations: [
        {
          affiliateId: 'string',
          affiliateName: 'string',
          matchScore: 'number (0-100)',
          reasoning: 'string',
          services: ['string'],
          estimatedDuration: 'string',
          estimatedCost: 'string',
          successProbability: 'number (0-1)',
          strengths: ['string'],
          concerns: ['string'],
          availability: 'string',
        },
      ],
      pmiInsights: {
        resourcePlan: 'string',
        teamStructure: 'string',
        skillGaps: ['string'],
        developmentNeeds: ['string'],
      },
    };
  }

  /**
   * Identify missing certifications
   */
  private identifyMissingCertifications(supplier: Supplier): string[] {
    const missing: string[] = [];

    if (!supplier.certifications.iso9001.certified) {
      missing.push('ISO 9001');
    }
    if (!supplier.certifications.iatf16949.certified) {
      missing.push('IATF 16949');
    }
    if (!supplier.certifications.iso14001.certified) {
      missing.push('ISO 14001');
    }
    if (!supplier.certifications.iso45001.certified) {
      missing.push('ISO 45001');
    }

    return missing;
  }

  /**
   * Identify technical gaps
   */
  private identifyTechnicalGaps(supplier: Supplier): string[] {
    const gaps: string[] = [];

    if (supplier.technicalCapabilities.automationLevel === 'manual') {
      gaps.push('Low automation level');
    }

    if (!supplier.technicalCapabilities.rdCapabilities.hasRD) {
      gaps.push('No R&D capabilities');
    }

    if (supplier.technicalCapabilities.qualityControlSystems.length === 0) {
      gaps.push('Limited quality control systems');
    }

    if (supplier.technicalCapabilities.testingCapabilities.length === 0) {
      gaps.push('Limited testing capabilities');
    }

    return gaps;
  }

  /**
   * Identify experience gaps
   */
  private identifyExperienceGaps(supplier: Supplier): string[] {
    const gaps: string[] = [];

    if (!supplier.batteryExperience.hasExperience) {
      gaps.push('No battery industry experience');
    } else if (supplier.batteryExperience.yearsInIndustry < 3) {
      gaps.push('Limited battery industry experience');
    }

    if (!supplier.automotiveExperience.hasExperience) {
      gaps.push('No automotive industry experience');
    } else if (supplier.automotiveExperience.yearsInIndustry < 5) {
      gaps.push('Limited automotive experience');
    }

    if (supplier.automotiveExperience.tierLevel === 'none') {
      gaps.push('No automotive tier classification');
    }

    return gaps;
  }

  /**
   * Calculate simple match score (fallback if AI fails)
   */
  calculateSimpleMatchScore(supplier: Supplier, affiliate: Affiliate): number {
    let score = 0;

    // Service alignment (40 points)
    const supplierNeeds = this.identifySupplierNeeds(supplier);
    const matchingServices = affiliate.serviceOfferings.categories.filter((cat) =>
      supplierNeeds.includes(cat)
    );
    score += (matchingServices.length / Math.max(supplierNeeds.length, 1)) * 40;

    // Experience (30 points)
    if (affiliate.expertise.toyotaExperience) score += 15;
    if (affiliate.expertise.industryExperience.automotive > 5) score += 10;
    if (affiliate.expertise.industryExperience.battery > 3) score += 5;

    // Performance (20 points)
    score += affiliate.performance.averageRating * 2; // 0-10 points
    score += affiliate.performance.onTimeDeliveryRate * 10; // 0-10 points

    // Availability (10 points)
    const utilization = affiliate.capacity.currentLoad / affiliate.capacity.maxCapacity;
    if (utilization < 0.7) score += 10;
    else if (utilization < 0.9) score += 5;

    return Math.round(Math.min(100, score));
  }

  /**
   * Identify supplier service needs
   */
  private identifySupplierNeeds(supplier: Supplier): string[] {
    const needs: string[] = [];

    const missingCerts = this.identifyMissingCertifications(supplier);
    if (missingCerts.includes('ISO 9001') || missingCerts.includes('IATF 16949')) {
      needs.push('Quality Management');
      needs.push('ISO/IATF Certification');
    }

    if (!supplier.batteryExperience.hasExperience) {
      needs.push('Battery Technology');
    }

    if (!supplier.automotiveExperience.hasExperience) {
      needs.push('Automotive Standards');
    }

    if (supplier.technicalCapabilities.automationLevel === 'manual') {
      needs.push('Manufacturing Excellence');
      needs.push('Automation');
    }

    if (!supplier.technicalCapabilities.rdCapabilities.hasRD) {
      needs.push('R&D Development');
    }

    if (!supplier.sustainability.environmentalCompliance) {
      needs.push('Environmental Compliance');
    }

    return needs;
  }
}

export const assignmentRecommendationService = new AssignmentRecommendationService();
