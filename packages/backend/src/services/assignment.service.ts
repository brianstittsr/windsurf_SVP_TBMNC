/**
 * Assignment Service
 * Manages affiliate-supplier assignments
 */

import { getFirestore } from '../firebase/config';
import { Assignment, AssignmentStatus, RiskLevel } from '../types/enhanced.types';
import { affiliateService } from './affiliate.service';
import { logger } from '../utils/logger';

export class AssignmentService {
  private db = getFirestore();
  private collection = 'assignments';

  /**
   * Get all assignments with optional filtering
   */
  async getAllAssignments(filters?: {
    supplierId?: string;
    affiliateId?: string;
    status?: AssignmentStatus;
  }): Promise<Assignment[]> {
    try {
      let query = this.db.collection(this.collection);

      if (filters?.supplierId) {
        query = query.where('supplierId', '==', filters.supplierId) as any;
      }

      if (filters?.affiliateId) {
        query = query.where('affiliateId', '==', filters.affiliateId) as any;
      }

      if (filters?.status) {
        query = query.where('status', '==', filters.status) as any;
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Assignment));
    } catch (error) {
      logger.error('Error getting assignments:', error);
      throw error;
    }
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(id: string): Promise<Assignment | null> {
    try {
      const doc = await this.db.collection(this.collection).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() } as Assignment;
    } catch (error) {
      logger.error(`Error getting assignment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new assignment
   */
  async createAssignment(data: Partial<Assignment>): Promise<Assignment> {
    try {
      const now = new Date();

      const assignmentData: Partial<Assignment> = {
        ...data,
        status: 'pending',
        deliverables: [],
        completedDeliverables: 0,
        totalDeliverables: 0,
        financial: {
          budgetAllocated: data.financial?.budgetAllocated || 0,
          budgetSpent: 0,
          billingType: data.financial?.billingType || 'hourly',
          invoices: [],
        },
        performance: {
          onTrack: true,
          progressPercentage: 0,
          issuesCount: 0,
          riskLevel: 'low',
        },
        assignedAt: now as any,
        lastContact: now as any,
        meetingNotes: [],
        createdAt: now as any,
        updatedAt: now as any,
      };

      const docRef = await this.db.collection(this.collection).add(assignmentData);
      const doc = await docRef.get();

      // Update affiliate's assignment list
      if (data.affiliateId) {
        await affiliateService.addAssignment(data.affiliateId, data.supplierId!);
      }

      logger.info(`Created assignment: ${docRef.id}`);

      return { id: doc.id, ...doc.data() } as Assignment;
    } catch (error) {
      logger.error('Error creating assignment:', error);
      throw error;
    }
  }

  /**
   * Update assignment
   */
  async updateAssignment(id: string, data: Partial<Assignment>): Promise<Assignment> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await this.db.collection(this.collection).doc(id).update(updateData);

      const updated = await this.getAssignmentById(id);

      if (!updated) {
        throw new Error(`Assignment ${id} not found after update`);
      }

      logger.info(`Updated assignment: ${id}`);

      return updated;
    } catch (error) {
      logger.error(`Error updating assignment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete assignment
   */
  async deleteAssignment(id: string): Promise<void> {
    try {
      const assignment = await this.getAssignmentById(id);

      if (assignment) {
        // Remove from affiliate's assignment list
        await affiliateService.completeAssignment(assignment.affiliateId, assignment.supplierId);
      }

      await this.db.collection(this.collection).doc(id).delete();
      logger.info(`Deleted assignment: ${id}`);
    } catch (error) {
      logger.error(`Error deleting assignment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Approve assignment
   */
  async approveAssignment(id: string, approvedBy: string): Promise<Assignment> {
    try {
      const updateData = {
        status: 'active' as AssignmentStatus,
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      };

      await this.db.collection(this.collection).doc(id).update(updateData);

      const updated = await this.getAssignmentById(id);

      if (!updated) {
        throw new Error(`Assignment ${id} not found after approval`);
      }

      logger.info(`Approved assignment: ${id} by ${approvedBy}`);

      return updated;
    } catch (error) {
      logger.error(`Error approving assignment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Complete assignment
   */
  async completeAssignment(id: string): Promise<Assignment> {
    try {
      const assignment = await this.getAssignmentById(id);

      if (!assignment) {
        throw new Error(`Assignment ${id} not found`);
      }

      const updateData = {
        status: 'completed' as AssignmentStatus,
        endDate: new Date(),
        updatedAt: new Date(),
      };

      await this.db.collection(this.collection).doc(id).update(updateData);

      // Update affiliate's assignment list
      await affiliateService.completeAssignment(assignment.affiliateId, assignment.supplierId);

      const updated = await this.getAssignmentById(id);

      if (!updated) {
        throw new Error(`Assignment ${id} not found after completion`);
      }

      logger.info(`Completed assignment: ${id}`);

      return updated;
    } catch (error) {
      logger.error(`Error completing assignment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cancel assignment
   */
  async cancelAssignment(id: string, reason?: string): Promise<Assignment> {
    try {
      const assignment = await this.getAssignmentById(id);

      if (!assignment) {
        throw new Error(`Assignment ${id} not found`);
      }

      const updateData: Record<string, any> = {
        status: 'cancelled' as AssignmentStatus,
        endDate: new Date(),
        updatedAt: new Date(),
      };

      if (reason) {
        updateData.cancellationReason = reason;
      }

      await this.db.collection(this.collection).doc(id).update(updateData);

      // Update affiliate's assignment list
      await affiliateService.completeAssignment(assignment.affiliateId, assignment.supplierId);

      const updated = await this.getAssignmentById(id);

      if (!updated) {
        throw new Error(`Assignment ${id} not found after cancellation`);
      }

      logger.info(`Cancelled assignment: ${id}`);

      return updated;
    } catch (error) {
      logger.error(`Error cancelling assignment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add deliverable to assignment
   */
  async addDeliverable(id: string, deliverableId: string): Promise<void> {
    try {
      const assignment = await this.getAssignmentById(id);

      if (!assignment) {
        throw new Error(`Assignment ${id} not found`);
      }

      const deliverables = [...assignment.deliverables, deliverableId];

      await this.db.collection(this.collection).doc(id).update({
        deliverables,
        totalDeliverables: deliverables.length,
        updatedAt: new Date(),
      });

      logger.info(`Added deliverable ${deliverableId} to assignment ${id}`);
    } catch (error) {
      logger.error(`Error adding deliverable to assignment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mark deliverable as completed
   */
  async completeDeliverable(id: string, deliverableId: string): Promise<void> {
    try {
      const assignment = await this.getAssignmentById(id);

      if (!assignment) {
        throw new Error(`Assignment ${id} not found`);
      }

      const completedCount = assignment.completedDeliverables + 1;
      const progressPercentage = (completedCount / assignment.totalDeliverables) * 100;

      await this.db.collection(this.collection).doc(id).update({
        completedDeliverables: completedCount,
        'performance.progressPercentage': progressPercentage,
        updatedAt: new Date(),
      });

      logger.info(`Completed deliverable ${deliverableId} for assignment ${id}`);
    } catch (error) {
      logger.error(`Error completing deliverable for assignment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update financial information
   */
  async updateFinancials(id: string, data: {
    budgetSpent?: number;
    invoiceId?: string;
  }): Promise<void> {
    try {
      const assignment = await this.getAssignmentById(id);

      if (!assignment) {
        throw new Error(`Assignment ${id} not found`);
      }

      const updates: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (data.budgetSpent !== undefined) {
        updates['financial.budgetSpent'] = data.budgetSpent;

        // Check if over budget
        if (data.budgetSpent > assignment.financial.budgetAllocated) {
          updates['performance.issuesCount'] = assignment.performance.issuesCount + 1;
        }
      }

      if (data.invoiceId) {
        const invoices = [...assignment.financial.invoices, data.invoiceId];
        updates['financial.invoices'] = invoices;
      }

      await this.db.collection(this.collection).doc(id).update(updates);

      logger.info(`Updated financials for assignment ${id}`);
    } catch (error) {
      logger.error(`Error updating financials for assignment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update performance metrics
   */
  async updatePerformance(id: string, data: {
    onTrack?: boolean;
    issuesCount?: number;
    riskLevel?: RiskLevel;
  }): Promise<void> {
    try {
      const updates: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (data.onTrack !== undefined) {
        updates['performance.onTrack'] = data.onTrack;
      }

      if (data.issuesCount !== undefined) {
        updates['performance.issuesCount'] = data.issuesCount;
      }

      if (data.riskLevel) {
        updates['performance.riskLevel'] = data.riskLevel;
      }

      await this.db.collection(this.collection).doc(id).update(updates);

      logger.info(`Updated performance for assignment ${id}`);
    } catch (error) {
      logger.error(`Error updating performance for assignment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add meeting note
   */
  async addMeetingNote(id: string, note: string): Promise<void> {
    try {
      const assignment = await this.getAssignmentById(id);

      if (!assignment) {
        throw new Error(`Assignment ${id} not found`);
      }

      const meetingNotes = [...assignment.meetingNotes, note];

      await this.db.collection(this.collection).doc(id).update({
        meetingNotes,
        lastContact: new Date(),
        updatedAt: new Date(),
      });

      logger.info(`Added meeting note to assignment ${id}`);
    } catch (error) {
      logger.error(`Error adding meeting note to assignment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Schedule next meeting
   */
  async scheduleNextMeeting(id: string, meetingDate: Date): Promise<void> {
    try {
      await this.db.collection(this.collection).doc(id).update({
        nextMeeting: meetingDate,
        updatedAt: new Date(),
      });

      logger.info(`Scheduled next meeting for assignment ${id}`);
    } catch (error) {
      logger.error(`Error scheduling meeting for assignment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get active assignments for supplier
   */
  async getSupplierActiveAssignments(supplierId: string): Promise<Assignment[]> {
    try {
      return await this.getAllAssignments({
        supplierId,
        status: 'active',
      });
    } catch (error) {
      logger.error(`Error getting active assignments for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Get active assignments for affiliate
   */
  async getAffiliateActiveAssignments(affiliateId: string): Promise<Assignment[]> {
    try {
      return await this.getAllAssignments({
        affiliateId,
        status: 'active',
      });
    } catch (error) {
      logger.error(`Error getting active assignments for affiliate ${affiliateId}:`, error);
      throw error;
    }
  }

  /**
   * Get assignment statistics
   */
  async getAssignmentStats(filters?: {
    supplierId?: string;
    affiliateId?: string;
  }): Promise<{
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    pending: number;
    averageProgress: number;
    onTrackPercentage: number;
  }> {
    try {
      const assignments = await this.getAllAssignments(filters);

      const active = assignments.filter((a) => a.status === 'active');
      const onTrack = active.filter((a) => a.performance.onTrack);

      const stats = {
        total: assignments.length,
        active: active.length,
        completed: assignments.filter((a) => a.status === 'completed').length,
        cancelled: assignments.filter((a) => a.status === 'cancelled').length,
        pending: assignments.filter((a) => a.status === 'pending').length,
        averageProgress: 0,
        onTrackPercentage: 0,
      };

      if (active.length > 0) {
        const totalProgress = active.reduce((sum, a) => sum + a.performance.progressPercentage, 0);
        stats.averageProgress = totalProgress / active.length;
        stats.onTrackPercentage = (onTrack.length / active.length) * 100;
      }

      return stats;
    } catch (error) {
      logger.error('Error getting assignment stats:', error);
      throw error;
    }
  }

  /**
   * Check for stalled assignments (no activity in X days)
   */
  async checkStalledAssignments(daysInactive: number = 14): Promise<Assignment[]> {
    try {
      const assignments = await this.getAllAssignments({ status: 'active' });
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - daysInactive * 24 * 60 * 60 * 1000);

      return assignments.filter((a) => {
        const lastContact = new Date(a.lastContact as any);
        return lastContact < cutoffDate;
      });
    } catch (error) {
      logger.error('Error checking stalled assignments:', error);
      throw error;
    }
  }
}

export const assignmentService = new AssignmentService();
