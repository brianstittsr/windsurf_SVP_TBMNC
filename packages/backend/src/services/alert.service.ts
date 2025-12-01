/**
 * Alert Service
 * Manages system alerts and notifications
 */

import { getFirestore } from '../firebase/config';
import { Alert, AlertType, AlertSeverity, RelatedEntityType } from '../types/enhanced.types';
import { logger } from '../utils/logger';

export class AlertService {
  private db = getFirestore();
  private collection = 'alerts';

  /**
   * Get all alerts with optional filtering
   */
  async getAllAlerts(filters?: {
    type?: AlertType;
    severity?: AlertSeverity;
    resolved?: boolean;
    recipientId?: string;
  }): Promise<Alert[]> {
    try {
      let query = this.db.collection(this.collection);

      if (filters?.type) {
        query = query.where('type', '==', filters.type) as any;
      }

      if (filters?.severity) {
        query = query.where('severity', '==', filters.severity) as any;
      }

      if (filters?.resolved !== undefined) {
        query = query.where('resolved', '==', filters.resolved) as any;
      }

      if (filters?.recipientId) {
        query = query.where('recipients', 'array-contains', filters.recipientId) as any;
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Alert));
    } catch (error) {
      logger.error('Error getting alerts:', error);
      throw error;
    }
  }

  /**
   * Get alert by ID
   */
  async getAlertById(id: string): Promise<Alert | null> {
    try {
      const doc = await this.db.collection(this.collection).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() } as Alert;
    } catch (error) {
      logger.error(`Error getting alert ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new alert
   */
  async createAlert(data: Partial<Alert>): Promise<Alert> {
    try {
      const now = new Date();

      const alertData: Partial<Alert> = {
        ...data,
        read: false,
        readBy: [],
        readAt: {},
        resolved: false,
        escalated: false,
        createdAt: now as any,
        triggeredBy: data.triggeredBy || 'system',
      };

      const docRef = await this.db.collection(this.collection).add(alertData);
      const doc = await docRef.get();

      logger.info(`Created alert: ${docRef.id} (${data.type}, ${data.severity})`);

      return { id: doc.id, ...doc.data() } as Alert;
    } catch (error) {
      logger.error('Error creating alert:', error);
      throw error;
    }
  }

  /**
   * Update alert
   */
  async updateAlert(id: string, data: Partial<Alert>): Promise<Alert> {
    try {
      await this.db.collection(this.collection).doc(id).update(data);

      const updated = await this.getAlertById(id);

      if (!updated) {
        throw new Error(`Alert ${id} not found after update`);
      }

      logger.info(`Updated alert: ${id}`);

      return updated;
    } catch (error) {
      logger.error(`Error updating alert ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete alert
   */
  async deleteAlert(id: string): Promise<void> {
    try {
      await this.db.collection(this.collection).doc(id).delete();
      logger.info(`Deleted alert: ${id}`);
    } catch (error) {
      logger.error(`Error deleting alert ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mark alert as read by user
   */
  async markAsRead(id: string, userId: string): Promise<Alert> {
    try {
      const alert = await this.getAlertById(id);

      if (!alert) {
        throw new Error(`Alert ${id} not found`);
      }

      const readBy = [...new Set([...alert.readBy, userId])];
      const readAt = {
        ...alert.readAt,
        [userId]: new Date() as any,
      };

      const allRead = alert.recipients.every((r) => readBy.includes(r));

      await this.db.collection(this.collection).doc(id).update({
        readBy,
        readAt,
        read: allRead,
      });

      const updated = await this.getAlertById(id);

      if (!updated) {
        throw new Error(`Alert ${id} not found after marking as read`);
      }

      logger.info(`Marked alert ${id} as read by user ${userId}`);

      return updated;
    } catch (error) {
      logger.error(`Error marking alert ${id} as read:`, error);
      throw error;
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(id: string, userId: string, notes?: string): Promise<Alert> {
    try {
      const updateData: Record<string, any> = {
        resolved: true,
        resolvedBy: userId,
        resolvedAt: new Date(),
      };

      if (notes) {
        updateData.resolutionNotes = notes;
      }

      await this.db.collection(this.collection).doc(id).update(updateData);

      const updated = await this.getAlertById(id);

      if (!updated) {
        throw new Error(`Alert ${id} not found after resolution`);
      }

      logger.info(`Resolved alert ${id} by user ${userId}`);

      return updated;
    } catch (error) {
      logger.error(`Error resolving alert ${id}:`, error);
      throw error;
    }
  }

  /**
   * Take action on alert
   */
  async takeAction(id: string, action: string, userId: string, notes?: string): Promise<Alert> {
    try {
      const actionTaken = {
        action,
        takenBy: userId,
        takenAt: new Date() as any,
        notes: notes || '',
      };

      await this.db.collection(this.collection).doc(id).update({
        actionTaken,
      });

      const updated = await this.getAlertById(id);

      if (!updated) {
        throw new Error(`Alert ${id} not found after action`);
      }

      logger.info(`Action taken on alert ${id}: ${action} by ${userId}`);

      return updated;
    } catch (error) {
      logger.error(`Error taking action on alert ${id}:`, error);
      throw error;
    }
  }

  /**
   * Escalate alert
   */
  async escalateAlert(id: string, escalateTo: string): Promise<Alert> {
    try {
      const alert = await this.getAlertById(id);

      if (!alert) {
        throw new Error(`Alert ${id} not found`);
      }

      const recipients = [...new Set([...alert.recipients, escalateTo])];

      await this.db.collection(this.collection).doc(id).update({
        escalated: true,
        escalatedTo: escalateTo,
        escalatedAt: new Date(),
        recipients,
        severity: this.escalateSeverity(alert.severity),
      });

      const updated = await this.getAlertById(id);

      if (!updated) {
        throw new Error(`Alert ${id} not found after escalation`);
      }

      logger.info(`Escalated alert ${id} to ${escalateTo}`);

      return updated;
    } catch (error) {
      logger.error(`Error escalating alert ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get unread alerts for user
   */
  async getUnreadAlerts(userId: string): Promise<Alert[]> {
    try {
      const alerts = await this.getAllAlerts({ recipientId: userId, resolved: false });
      return alerts.filter((a) => !a.readBy.includes(userId));
    } catch (error) {
      logger.error(`Error getting unread alerts for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get critical unresolved alerts
   */
  async getCriticalAlerts(): Promise<Alert[]> {
    try {
      return await this.getAllAlerts({
        severity: 'critical',
        resolved: false,
      });
    } catch (error) {
      logger.error('Error getting critical alerts:', error);
      throw error;
    }
  }

  /**
   * Get alerts for entity
   */
  async getEntityAlerts(entityType: RelatedEntityType, entityId: string): Promise<Alert[]> {
    try {
      const allAlerts = await this.getAllAlerts();
      return allAlerts.filter(
        (a) => a.relatedTo.type === entityType && a.relatedTo.id === entityId
      );
    } catch (error) {
      logger.error(`Error getting alerts for ${entityType} ${entityId}:`, error);
      throw error;
    }
  }

  /**
   * Clean up expired alerts
   */
  async cleanupExpiredAlerts(): Promise<number> {
    try {
      const now = new Date();
      const allAlerts = await this.getAllAlerts({ resolved: true });

      let deletedCount = 0;

      for (const alert of allAlerts) {
        if (alert.expiresAt) {
          const expiresAt = new Date(alert.expiresAt as any);
          if (expiresAt < now) {
            await this.deleteAlert(alert.id);
            deletedCount++;
          }
        }
      }

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} expired alerts`);
      }

      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up expired alerts:', error);
      throw error;
    }
  }

  /**
   * Get alert statistics
   */
  async getAlertStats(filters?: {
    recipientId?: string;
  }): Promise<{
    total: number;
    unresolved: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    byType: Record<AlertType, number>;
  }> {
    try {
      const alerts = await this.getAllAlerts(filters);

      const stats = {
        total: alerts.length,
        unresolved: alerts.filter((a) => !a.resolved).length,
        critical: alerts.filter((a) => a.severity === 'critical' && !a.resolved).length,
        high: alerts.filter((a) => a.severity === 'high' && !a.resolved).length,
        medium: alerts.filter((a) => a.severity === 'medium' && !a.resolved).length,
        low: alerts.filter((a) => a.severity === 'low' && !a.resolved).length,
        info: alerts.filter((a) => a.severity === 'info' && !a.resolved).length,
        byType: {} as Record<AlertType, number>,
      };

      // Count by type
      const types: AlertType[] = [
        'overdue',
        'approaching-deadline',
        'at-risk',
        'stalled',
        'milestone-achieved',
        'stage-advanced',
        'document-rejected',
        'missing-documentation',
        'affiliate-overloaded',
        'unassigned-supplier',
        'custom',
      ];

      types.forEach((type) => {
        stats.byType[type] = alerts.filter((a) => a.type === type && !a.resolved).length;
      });

      return stats;
    } catch (error) {
      logger.error('Error getting alert stats:', error);
      throw error;
    }
  }

  /**
   * Create overdue deliverable alert
   */
  async createOverdueAlert(
    deliverableId: string,
    deliverableName: string,
    recipients: string[]
  ): Promise<Alert> {
    return this.createAlert({
      type: 'overdue',
      severity: 'high',
      relatedTo: {
        type: 'deliverable',
        id: deliverableId,
        name: deliverableName,
      },
      title: 'Deliverable Overdue',
      message: `Deliverable "${deliverableName}" is overdue and requires immediate attention.`,
      recipients,
      recipientRoles: ['admin', 'affiliate'],
      actionRequired: true,
      actionType: 'review',
    });
  }

  /**
   * Create approaching deadline alert
   */
  async createApproachingDeadlineAlert(
    deliverableId: string,
    deliverableName: string,
    daysRemaining: number,
    recipients: string[]
  ): Promise<Alert> {
    return this.createAlert({
      type: 'approaching-deadline',
      severity: daysRemaining <= 1 ? 'high' : 'medium',
      relatedTo: {
        type: 'deliverable',
        id: deliverableId,
        name: deliverableName,
      },
      title: 'Deadline Approaching',
      message: `Deliverable "${deliverableName}" is due in ${daysRemaining} day(s).`,
      recipients,
      recipientRoles: ['admin', 'affiliate'],
      actionRequired: true,
      actionType: 'review',
    });
  }

  /**
   * Create at-risk project alert
   */
  async createAtRiskAlert(
    supplierId: string,
    supplierName: string,
    reason: string,
    recipients: string[]
  ): Promise<Alert> {
    return this.createAlert({
      type: 'at-risk',
      severity: 'high',
      relatedTo: {
        type: 'supplier',
        id: supplierId,
        name: supplierName,
      },
      title: 'Supplier At Risk',
      message: `Supplier "${supplierName}" is at risk: ${reason}`,
      recipients,
      recipientRoles: ['admin'],
      actionRequired: true,
      actionType: 'intervention',
    });
  }

  /**
   * Create stalled project alert
   */
  async createStalledAlert(
    supplierId: string,
    supplierName: string,
    daysInactive: number,
    recipients: string[]
  ): Promise<Alert> {
    return this.createAlert({
      type: 'stalled',
      severity: 'medium',
      relatedTo: {
        type: 'supplier',
        id: supplierId,
        name: supplierName,
      },
      title: 'Project Stalled',
      message: `Supplier "${supplierName}" has had no activity for ${daysInactive} days.`,
      recipients,
      recipientRoles: ['admin', 'affiliate'],
      actionRequired: true,
      actionType: 'follow-up',
    });
  }

  /**
   * Create affiliate overloaded alert
   */
  async createAffiliateOverloadedAlert(
    affiliateId: string,
    affiliateName: string,
    currentLoad: number,
    maxCapacity: number,
    recipients: string[]
  ): Promise<Alert> {
    return this.createAlert({
      type: 'affiliate-overloaded',
      severity: 'medium',
      relatedTo: {
        type: 'affiliate',
        id: affiliateId,
        name: affiliateName,
      },
      title: 'Affiliate Over Capacity',
      message: `Affiliate "${affiliateName}" is at ${currentLoad}/${maxCapacity} capacity.`,
      recipients,
      recipientRoles: ['admin'],
      actionRequired: true,
      actionType: 'reassign',
    });
  }

  /**
   * Create unassigned supplier alert
   */
  async createUnassignedSupplierAlert(
    supplierId: string,
    supplierName: string,
    daysUnassigned: number,
    recipients: string[]
  ): Promise<Alert> {
    return this.createAlert({
      type: 'unassigned-supplier',
      severity: 'high',
      relatedTo: {
        type: 'supplier',
        id: supplierId,
        name: supplierName,
      },
      title: 'Supplier Unassigned',
      message: `Supplier "${supplierName}" has been unassigned for ${daysUnassigned} days.`,
      recipients,
      recipientRoles: ['admin'],
      actionRequired: true,
      actionType: 'assign',
    });
  }

  /**
   * Escalate severity level
   */
  private escalateSeverity(current: AlertSeverity): AlertSeverity {
    const levels: AlertSeverity[] = ['info', 'low', 'medium', 'high', 'critical'];
    const currentIndex = levels.indexOf(current);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : current;
  }
}

export const alertService = new AlertService();
