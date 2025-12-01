/**
 * AI Document Analysis Service
 * PMI Quality Management - automated document review and validation
 */

import { aiProviderService } from './ai-provider.service';
import { isFeatureEnabled } from './ai.config';
import { logger } from '../../utils/logger';

export interface DocumentAnalysisResult {
  documentId: string;
  documentType: string;
  
  completeness: number; // 0-1
  compliant: boolean;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  
  extractedData: Record<string, any>;
  keyMetrics: Record<string, string>;
  
  issues: {
    type: 'error' | 'warning' | 'info';
    message: string;
    location?: string;
    recommendation: string;
  }[];
  
  concerns: string[];
  strengths: string[];
  
  summary: string;
  recommendations: string[];
  
  pmiInsights: {
    qualityScore: number;
    complianceLevel: string;
    improvementAreas: string[];
    bestPractices: string[];
  };
  
  analysisDate: Date;
}

export class DocumentAnalysisService {
  /**
   * Analyze uploaded document
   */
  async analyzeDocument(
    documentId: string,
    documentType: string,
    documentContent: string,
    requirements?: string[]
  ): Promise<DocumentAnalysisResult> {
    if (!isFeatureEnabled('documentAnalysis')) {
      throw new Error('AI document analysis is disabled');
    }

    logger.info(`Analyzing document: ${documentId} (${documentType})`);

    try {
      // Generate AI analysis
      const aiResponse = await aiProviderService.generateStructuredResponse<{
        completeness: number;
        compliant: boolean;
        quality: string;
        extractedData: Record<string, any>;
        keyMetrics: Record<string, string>;
        issues: any[];
        concerns: string[];
        strengths: string[];
        summary: string;
        recommendations: string[];
        pmiInsights: any;
      }>(
        this.buildAnalysisPrompt(documentType, documentContent, requirements),
        this.getAnalysisSchema(),
        {
          systemPrompt: this.getSystemPrompt(),
          temperature: 0.2, // Very low temperature for consistent analysis
        }
      );

      const result: DocumentAnalysisResult = {
        documentId,
        documentType,
        completeness: aiResponse.completeness,
        compliant: aiResponse.compliant,
        quality: aiResponse.quality as any,
        extractedData: aiResponse.extractedData,
        keyMetrics: aiResponse.keyMetrics,
        issues: aiResponse.issues,
        concerns: aiResponse.concerns,
        strengths: aiResponse.strengths,
        summary: aiResponse.summary,
        recommendations: aiResponse.recommendations,
        pmiInsights: aiResponse.pmiInsights,
        analysisDate: new Date(),
      };

      logger.info(`Document analysis complete: ${documentId} - Quality: ${result.quality}`);

      return result;
    } catch (error) {
      logger.error('Document analysis failed:', error);
      throw error;
    }
  }

  /**
   * Build AI prompt for document analysis
   */
  private buildAnalysisPrompt(
    documentType: string,
    documentContent: string,
    requirements?: string[]
  ): string {
    const requirementsText = requirements
      ? `\n\nREQUIREMENTS:\n${requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
      : '';

    return `
Analyze this ${documentType} document for a company seeking Toyota Battery Manufacturing (TBMNC) supplier qualification using PMI Quality Management best practices.

DOCUMENT TYPE: ${documentType}

DOCUMENT CONTENT:
${documentContent}
${requirementsText}

ANALYSIS REQUIREMENTS:

1. Assess completeness (0-1 scale):
   - Are all required sections present?
   - Is information sufficient and detailed?
   - Are there any gaps or missing data?

2. Verify compliance:
   - Does it meet TBMNC requirements?
   - Does it follow industry standards?
   - Are there any compliance issues?

3. Evaluate quality (excellent/good/fair/poor):
   - Clarity and organization
   - Accuracy and consistency
   - Professional presentation

4. Extract key data:
   - Important metrics, dates, numbers
   - Critical information points
   - Relevant business data

5. Identify issues:
   - Errors (critical problems)
   - Warnings (potential issues)
   - Info (suggestions for improvement)

6. Provide insights:
   - Document strengths
   - Areas of concern
   - Specific recommendations

7. PMI Quality Assessment:
   - Quality score (0-100)
   - Compliance level
   - Improvement areas
   - Best practices observed

Be thorough, specific, and actionable. Focus on TBMNC supplier qualification requirements.
`;
  }

  /**
   * Get system prompt for AI
   */
  private getSystemPrompt(): string {
    return `You are an expert quality manager and document reviewer specializing in PMI Quality Management and automotive supplier qualification. You excel at analyzing business documents for completeness, compliance, and quality. Provide detailed, actionable feedback with specific recommendations.`;
  }

  /**
   * Get JSON schema for analysis
   */
  private getAnalysisSchema(): any {
    return {
      completeness: 'number (0-1)',
      compliant: 'boolean',
      quality: 'string (excellent|good|fair|poor)',
      extractedData: {
        key: 'value',
      },
      keyMetrics: {
        metricName: 'metricValue',
      },
      issues: [
        {
          type: 'string (error|warning|info)',
          message: 'string',
          location: 'string (optional)',
          recommendation: 'string',
        },
      ],
      concerns: ['string'],
      strengths: ['string'],
      summary: 'string',
      recommendations: ['string'],
      pmiInsights: {
        qualityScore: 'number (0-100)',
        complianceLevel: 'string',
        improvementAreas: ['string'],
        bestPractices: ['string'],
      },
    };
  }

  /**
   * Analyze financial statement
   */
  async analyzeFinancialStatement(documentId: string, content: string): Promise<DocumentAnalysisResult> {
    return this.analyzeDocument(
      documentId,
      'Financial Statement',
      content,
      [
        'Annual revenue clearly stated',
        'Profit margins disclosed',
        'Debt-to-equity ratio provided',
        'Cash flow information included',
        'Financial projections for next 3 years',
        'Banking relationships documented',
      ]
    );
  }

  /**
   * Analyze certification document
   */
  async analyzeCertification(documentId: string, content: string, certType: string): Promise<DocumentAnalysisResult> {
    return this.analyzeDocument(
      documentId,
      `${certType} Certification`,
      content,
      [
        'Certification number present',
        'Issuing body identified',
        'Issue and expiry dates clear',
        'Scope of certification defined',
        'Valid and current certification',
      ]
    );
  }

  /**
   * Analyze technical capability document
   */
  async analyzeTechnicalCapability(documentId: string, content: string): Promise<DocumentAnalysisResult> {
    return this.analyzeDocument(
      documentId,
      'Technical Capability Document',
      content,
      [
        'Manufacturing processes described',
        'Equipment list provided',
        'Capacity metrics included',
        'Quality control systems detailed',
        'Testing capabilities outlined',
        'R&D capabilities documented',
      ]
    );
  }

  /**
   * Batch analyze multiple documents
   */
  async batchAnalyzeDocuments(
    documents: Array<{ id: string; type: string; content: string }>
  ): Promise<DocumentAnalysisResult[]> {
    const results: DocumentAnalysisResult[] = [];

    for (const doc of documents) {
      try {
        const result = await this.analyzeDocument(doc.id, doc.type, doc.content);
        results.push(result);
      } catch (error) {
        logger.error(`Failed to analyze document ${doc.id}:`, error);
        // Continue with other documents
      }
    }

    return results;
  }

  /**
   * Get document quality summary
   */
  getQualitySummary(results: DocumentAnalysisResult[]): {
    averageCompleteness: number;
    complianceRate: number;
    qualityDistribution: Record<string, number>;
    totalIssues: number;
    criticalIssues: number;
  } {
    const summary = {
      averageCompleteness: 0,
      complianceRate: 0,
      qualityDistribution: {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
      },
      totalIssues: 0,
      criticalIssues: 0,
    };

    if (results.length === 0) return summary;

    summary.averageCompleteness =
      results.reduce((sum, r) => sum + r.completeness, 0) / results.length;

    summary.complianceRate =
      (results.filter((r) => r.compliant).length / results.length) * 100;

    results.forEach((r) => {
      summary.qualityDistribution[r.quality]++;
      summary.totalIssues += r.issues.length;
      summary.criticalIssues += r.issues.filter((i) => i.type === 'error').length;
    });

    return summary;
  }
}

export const documentAnalysisService = new DocumentAnalysisService();
