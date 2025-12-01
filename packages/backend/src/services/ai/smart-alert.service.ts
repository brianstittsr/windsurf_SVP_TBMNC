/**
 * AI Smart Alert Service
 * Intelligent alert prioritization and routing
 */

import { aiProviderService } from './ai-provider.service';
import { isFeatureEnabled } from './ai.config';
import { Alert, AlertSeverity } from '../../types/enhanced.types';
import { logger } from '../../utils/logger';

export interface PrioritizedAlert extends Alert {
  priorityScore: number; // 0-100
  reasoning: string;
  impact: string;
  urgency: string;
  recommendedAction: string;
  stakeholders: string[];
  escalationPath?: string[];
}

export interface AlertPrioritization {
  prioritizedAlerts: PrioritizedAlert[];
  summary: {
    totalAlerts: number;
    criticalCount: number;
    highPriorityCount: number;
    mediumPriorityCount: number;
    lowPriorityCount: number;
  };
  recommendations: string[];
  analysisDate: Date;
}

export class SmartAlertService {
  /**
   * Prioritize multiple alerts using AI
   */
  async prioritizeAlerts(alerts: Alert[]): Promise<AlertPrioritization> {
    if (!isFeatureEnabled('smartAlerts')) {
      throw new Error('AI smart alerts are disabled');
    }

    logger.info(`Prioritizing ${alerts.length} alerts`);

    try {
      const alertsContext = this.buildAlertsContext(alerts);

      const aiResponse = await aiProviderService.generateStructuredResponse<{
        prioritizedAlerts: Array<{
          alertId: string;
          priorityScore: number;
          reasoning: string;
          impact: string;
          urgency: string;
          recommendedAction: string;
          stakeholders: string[];
          escalationPath?: string[];
        }>;
        recommendations: string[];
      }>(
        this.buildPrioritizationPrompt(alertsContext),
        this.getPrioritizationSchema(),
        {
          systemPrompt: this.getSystemPrompt(),
          temperature: 0.3,
        }
      );

      // Merge AI analysis with original alerts
      const prioritizedAlerts: PrioritizedAlert[] = alerts.map((alert) => {
        const aiAnalysis = aiResponse.prioritizedAlerts.find((a) => a.alertId === alert.id);
        
        return {
          ...alert,
          priorityScore: aiAnalysis?.priorityScore || this.calculateSimplePriority(alert),
          reasoning: aiAnalysis?.reasoning || 'Default prioritization',
          impact: aiAnalysis?.impact || 'Unknown',
          urgency: aiAnalysis?.urgency || 'Unknown',
          recommendedAction: aiAnalysis?.recommendedAction || 'Review alert',
          stakeholders: aiAnalysis?.stakeholders || alert.recipients,
          escalationPath: aiAnalysis?.escalationPath,
        };
      });

      // Sort by priority score
      prioritizedAlerts.sort((a, b) => b.priorityScore - a.priorityScore);

      const summary = {
        totalAlerts: alerts.length,
        criticalCount: prioritizedAlerts.filter((a) => a.priorityScore >= 90).length,
        highPriorityCount: prioritizedAlerts.filter((a) => a.priorityScore >= 70 && a.priorityScore < 90).length,
        mediumPriorityCount: prioritizedAlerts.filter((a) => a.priorityScore >= 40 && a.priorityScore < 70).length,
        lowPriorityCount: prioritizedAlerts.filter((a) => a.priorityScore < 40).length,
      };

      logger.info(`Alert prioritization complete: ${summary.criticalCount} critical, ${summary.highPriorityCount} high`);

      return {
        prioritizedAlerts,
        summary,
        recommendations: aiResponse.recommendations,
        analysisDate: new Date(),
      };
    } catch (error) {
      logger.error('Alert prioritization failed:', error);
      throw error;
    }
  }

  /**
   * Build alerts context for AI
   */
  private buildAlertsContext(alerts: Alert[]): string {
    const context = alerts.map((alert) => ({
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      relatedTo: alert.relatedTo,
      actionRequired: alert.actionRequired,
      createdAt: alert.createdAt,
      recipients: alert.recipients,
      recipientRoles: alert.recipientRoles,
    }));

    return JSON.stringify(context, null, 2);
  }

  /**
   * Build AI prompt for prioritization
   */
  private buildPrioritizationPrompt(alertsContext: string): string {
    return `
Analyze and prioritize these system alerts for a Toyota Battery Manufacturing (TBMNC) supplier qualification platform.

ALERTS:
${alertsContext}

PRIORITIZATION CRITERIA:

1. Business Impact:
   - Revenue/contract risk
   - Relationship impact
   - Compliance issues
   - Quality concerns

2. Urgency:
   - Time sensitivity
   - Deadline proximity
   - Escalation potential
   - Stakeholder expectations

3. Complexity:
   - Resolution difficulty
   - Resource requirements
   - Dependencies
   - Risk of escalation

4. Stakeholder Importance:
   - Executive visibility
   - Customer impact
   - Regulatory implications

For each alert, provide:
- Priority score (0-100)
- Clear reasoning for the score
- Business impact assessment
- Urgency assessment
- Recommended action
- Key stakeholders who should be notified
- Escalation path if needed

Also provide overall recommendations for alert management.

Be specific and actionable. Consider TBMNC qualification timeline and requirements.
`;
  }

  /**
   * Get system prompt for AI
   */
  private getSystemPrompt(): string {
    return `You are an expert operations manager specializing in alert triage and incident management for automotive supplier qualification programs. You excel at assessing business impact, urgency, and stakeholder needs to prioritize actions effectively.`;
  }

  /**
   * Get JSON schema for prioritization
   */
  private getPrioritizationSchema(): any {
    return {
      prioritizedAlerts: [
        {
          alertId: 'string',
          priorityScore: 'number (0-100)',
          reasoning: 'string',
          impact: 'string',
          urgency: 'string',
          recommendedAction: 'string',
          stakeholders: ['string'],
          escalationPath: ['string (optional)'],
        },
      ],
      recommendations: ['string'],
    };
  }

  /**
   * Calculate simple priority score (fallback)
   */
  private calculateSimplePriority(alert: Alert): number {
    let score = 0;

    // Severity weight (40 points)
    const severityScores: Record<AlertSeverity, number> = {
      critical: 40,
      high: 30,
      medium: 20,
      low: 10,
      info: 5,
    };
    score += severityScores[alert.severity];

    // Type weight (30 points)
    const highPriorityTypes = ['overdue', 'at-risk', 'unassigned-supplier'];
    if (highPriorityTypes.includes(alert.type)) {
      score += 30;
    } else if (alert.type === 'approaching-deadline') {
      score += 20;
    } else {
      score += 10;
    }

    // Action required (20 points)
    if (alert.actionRequired) {
      score += 20;
    }

    // Age (10 points - older = higher priority)
    const ageInHours = (Date.now() - new Date(alert.createdAt as any).getTime()) / (1000 * 60 * 60);
    if (ageInHours > 48) score += 10;
    else if (ageInHours > 24) score += 5;

    return Math.min(100, score);
  }

  /**
   * Group related alerts
   */
  groupRelatedAlerts(alerts: Alert[]): Array<{ group: string; alerts: Alert[] }> {
    const groups: Record<string, Alert[]> = {};

    alerts.forEach((alert) => {
      const key = `${alert.relatedTo.type}-${alert.relatedTo.id}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(alert);
    });

    return Object.entries(groups).map(([group, alerts]) => ({
      group,
      alerts,
    }));
  }

  /**
   * Suggest alert consolidation
   */
  async suggestConsolidation(alerts: Alert[]): Promise<{
    consolidatedAlerts: Array<{
      title: string;
      message: string;
      relatedAlerts: string[];
      priority: number;
    }>;
  }> {
    const grouped = this.groupRelatedAlerts(alerts);

    const consolidatedAlerts = grouped
      .filter((g) => g.alerts.length > 1)
      .map((g) => {
        const highestPriority = Math.max(...g.alerts.map((a) => this.calculateSimplePriority(a)));
        
        return {
          title: `Multiple alerts for ${g.alerts[0].relatedTo.name}`,
          message: `${g.alerts.length} alerts require attention`,
          relatedAlerts: g.alerts.map((a) => a.id),
          priority: highestPriority,
        };
      });

    return { consolidatedAlerts };
  }
}

export const smartAlertService = new SmartAlertService();
