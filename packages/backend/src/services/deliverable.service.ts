/**
 * Deliverable Service
 * Manages time-tracked deliverables with dependencies
 */

import { getFirestore } from '../firebase/config';
import { Deliverable, DeliverableStatus, Priority, Milestone } from '../types/enhanced.types';
import { logger } from '../utils/logger';

export class DeliverableService {
  private db = getFirestore();
  private collection = 'deliverables';

  /**
   * Get all deliverables with optional filtering
   */
  async getAllDeliverables(filters?: {
    supplierId?: string;
    affiliateId?: string;
    status?: DeliverableStatus;
    priority?: Priority;
  }): Promise<Deliverable[]> {
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

      if (filters?.priority) {
        query = query.where('priority', '==', filters.priority) as any;
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Deliverable));
    } catch (error) {
      logger.error('Error getting deliverables:', error);
      throw error;
    }
  }

  /**
   * Get deliverable by ID
   */
  async getDeliverableById(id: string): Promise<Deliverable | null> {
    try {
      const doc = await this.db.collection(this.collection).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() } as Deliverable;
    } catch (error) {
      logger.error(`Error getting deliverable ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new deliverable
   */
  async createDeliverable(data: Partial<Deliverable>): Promise<Deliverable> {
    try {
      const now = new Date();

      const deliverableData: Partial<Deliverable> = {
        ...data,
        status: 'not-started',
        progress: {
          percentage: 0,
          lastUpdate: now as any,
          milestones: data.progress?.milestones || [],
          completedMilestones: 0,
          totalMilestones: data.progress?.milestones?.length || 0,
        },
        dependencies: data.dependencies || [],
        blockedBy: [],
        blocks: [],
        documents: [],
        links: data.links || [],
        notes: [],
        comments: [],
        alerts: [],
        createdAt: now as any,
        updatedAt: now as any,
      };

      const docRef = await this.db.collection(this.collection).add(deliverableData);
      const doc = await docRef.get();

      logger.info(`Created deliverable: ${docRef.id}`);

      return { id: doc.id, ...doc.data() } as Deliverable;
    } catch (error) {
      logger.error('Error creating deliverable:', error);
      throw error;
    }
  }

  /**
   * Update deliverable
   */
  async updateDeliverable(id: string, data: Partial<Deliverable>): Promise<Deliverable> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await this.db.collection(this.collection).doc(id).update(updateData);

      const updated = await this.getDeliverableById(id);

      if (!updated) {
        throw new Error(`Deliverable ${id} not found after update`);
      }

      logger.info(`Updated deliverable: ${id}`);

      return updated;
    } catch (error) {
      logger.error(`Error updating deliverable ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete deliverable
   */
  async deleteDeliverable(id: string): Promise<void> {
    try {
      await this.db.collection(this.collection).doc(id).delete();
      logger.info(`Deleted deliverable: ${id}`);
    } catch (error) {
      logger.error(`Error deleting deliverable ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update deliverable status
   */
  async updateStatus(id: string, status: DeliverableStatus, userId: string): Promise<Deliverable> {
    try {
      const deliverable = await this.getDeliverableById(id);

      if (!deliverable) {
        throw new Error(`Deliverable ${id} not found`);
      }

      const updates: any = {
        status,
        updatedAt: new Date(),
        lastModifiedBy: userId,
      };

      // If completed, set completion date
      if (status === 'completed') {
        updates['timing.completedDate'] = new Date();
        updates['progress.percentage'] = 100;

        // Calculate actual duration
        const startDate = new Date(deliverable.timing.startDate as any);
        const completedDate = new Date();
        const actualDuration = Math.ceil(
          (completedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        updates['timing.actualDuration'] = actualDuration;
      }

      await this.db.collection(this.collection).doc(id).update(updates);

      // Update blocked/blocking relationships
      if (status === 'completed') {
        await this.updateDependencies(id);
      }

      const updated = await this.getDeliverableById(id);

      if (!updated) {
        throw new Error(`Deliverable ${id} not found after status update`);
      }

      logger.info(`Updated status for deliverable ${id}: ${status}`);

      return updated;
    } catch (error) {
      logger.error(`Error updating status for deliverable ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update deliverable progress
   */
  async updateProgress(id: string, percentage: number, userId: string): Promise<Deliverable> {
    try {
      const updates: Record<string, any> = {
        'progress.percentage': Math.min(100, Math.max(0, percentage)),
        'progress.lastUpdate': new Date(),
        updatedAt: new Date(),
        lastModifiedBy: userId,
      };

      // Auto-update status based on progress
      if (percentage === 0) {
        updates.status = 'not-started';
      } else if (percentage === 100) {
        updates.status = 'completed';
        updates['timing.completedDate'] = new Date();
      } else if (percentage > 0) {
        updates.status = 'in-progress';
      }

      await this.db.collection(this.collection).doc(id).update(updates);

      const updated = await this.getDeliverableById(id);

      if (!updated) {
        throw new Error(`Deliverable ${id} not found after progress update`);
      }

      logger.info(`Updated progress for deliverable ${id}: ${percentage}%`);

      return updated;
    } catch (error) {
      logger.error(`Error updating progress for deliverable ${id}:`, error);
      throw error;
    }
  }

  /**
   * Complete milestone
   */
  async completeMilestone(id: string, milestoneId: string): Promise<Deliverable> {
    try {
      const deliverable = await this.getDeliverableById(id);

      if (!deliverable) {
        throw new Error(`Deliverable ${id} not found`);
      }

      const milestones = deliverable.progress.milestones.map((m) => {
        if (m.id === milestoneId) {
          return {
            ...m,
            completed: true,
            completedDate: new Date() as any,
          };
        }
        return m;
      });

      const completedCount = milestones.filter((m) => m.completed).length;
      const progressPercentage = (completedCount / milestones.length) * 100;

      await this.db.collection(this.collection).doc(id).update({
        'progress.milestones': milestones,
        'progress.completedMilestones': completedCount,
        'progress.percentage': progressPercentage,
        'progress.lastUpdate': new Date(),
        updatedAt: new Date(),
      });

      const updated = await this.getDeliverableById(id);

      if (!updated) {
        throw new Error(`Deliverable ${id} not found after milestone update`);
      }

      logger.info(`Completed milestone ${milestoneId} for deliverable ${id}`);

      return updated;
    } catch (error) {
      logger.error(`Error completing milestone for deliverable ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add note to deliverable
   */
  async addNote(id: string, content: string, author: string, isPrivate: boolean = false): Promise<void> {
    try {
      const deliverable = await this.getDeliverableById(id);

      if (!deliverable) {
        throw new Error(`Deliverable ${id} not found`);
      }

      const note = {
        id: `note-${Date.now()}`,
        content,
        author,
        createdAt: new Date() as any,
        private: isPrivate,
      };

      const notes = [...(deliverable.notes || []), note];

      await this.db.collection(this.collection).doc(id).update({
        notes,
        updatedAt: new Date(),
      });

      logger.info(`Added note to deliverable ${id}`);
    } catch (error) {
      logger.error(`Error adding note to deliverable ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add comment to deliverable
   */
  async addComment(id: string, content: string, author: string, mentions: string[] = []): Promise<void> {
    try {
      const deliverable = await this.getDeliverableById(id);

      if (!deliverable) {
        throw new Error(`Deliverable ${id} not found`);
      }

      const comment = {
        id: `comment-${Date.now()}`,
        content,
        author,
        createdAt: new Date() as any,
        mentions,
      };

      const comments = [...(deliverable.comments || []), comment];

      await this.db.collection(this.collection).doc(id).update({
        comments,
        updatedAt: new Date(),
      });

      logger.info(`Added comment to deliverable ${id}`);
    } catch (error) {
      logger.error(`Error adding comment to deliverable ${id}:`, error);
      throw error;
    }
  }

  /**
   * Check and update overdue deliverables
   */
  async checkOverdueDeliverables(): Promise<string[]> {
    try {
      const now = new Date();
      const deliverables = await this.getAllDeliverables({
        status: 'in-progress',
      });

      const overdueIds: string[] = [];

      for (const deliverable of deliverables) {
        const dueDate = new Date(deliverable.timing.dueDate as any);

        if (dueDate < now && deliverable.status !== 'overdue') {
          await this.updateStatus(deliverable.id, 'overdue', 'system');
          overdueIds.push(deliverable.id);
        }
      }

      if (overdueIds.length > 0) {
        logger.info(`Marked ${overdueIds.length} deliverables as overdue`);
      }

      return overdueIds;
    } catch (error) {
      logger.error('Error checking overdue deliverables:', error);
      throw error;
    }
  }

  /**
   * Get deliverables approaching deadline
   */
  async getApproachingDeadlines(daysAhead: number = 3): Promise<Deliverable[]> {
    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

      const deliverables = await this.getAllDeliverables();

      return deliverables.filter((d) => {
        if (d.status === 'completed' || d.status === 'cancelled') {
          return false;
        }

        const dueDate = new Date(d.timing.dueDate as any);
        return dueDate >= now && dueDate <= futureDate;
      });
    } catch (error) {
      logger.error('Error getting approaching deadlines:', error);
      throw error;
    }
  }

  /**
   * Update dependencies when deliverable is completed
   */
  private async updateDependencies(completedId: string): Promise<void> {
    try {
      // Find all deliverables that depend on this one
      const allDeliverables = await this.getAllDeliverables();

      for (const deliverable of allDeliverables) {
        if (deliverable.dependencies.includes(completedId)) {
          // Remove from blockedBy
          const updatedBlockedBy = deliverable.blockedBy.filter((id) => id !== completedId);

          await this.db.collection(this.collection).doc(deliverable.id).update({
            blockedBy: updatedBlockedBy,
            updatedAt: new Date(),
          });

          // If no longer blocked, update status
          if (updatedBlockedBy.length === 0 && deliverable.status === 'blocked') {
            await this.updateStatus(deliverable.id, 'not-started', 'system');
          }
        }
      }
    } catch (error) {
      logger.error('Error updating dependencies:', error);
      throw error;
    }
  }

  /**
   * Get deliverable statistics for a supplier
   */
  async getSupplierStats(supplierId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    notStarted: number;
    completionRate: number;
  }> {
    try {
      const deliverables = await this.getAllDeliverables({ supplierId });

      const stats = {
        total: deliverables.length,
        completed: deliverables.filter((d) => d.status === 'completed').length,
        inProgress: deliverables.filter((d) => d.status === 'in-progress').length,
        overdue: deliverables.filter((d) => d.status === 'overdue').length,
        notStarted: deliverables.filter((d) => d.status === 'not-started').length,
        completionRate: 0,
      };

      if (stats.total > 0) {
        stats.completionRate = (stats.completed / stats.total) * 100;
      }

      return stats;
    } catch (error) {
      logger.error(`Error getting stats for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Get deliverable statistics for an affiliate
   */
  async getAffiliateStats(affiliateId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    onTimeRate: number;
  }> {
    try {
      const deliverables = await this.getAllDeliverables({ affiliateId });

      const completed = deliverables.filter((d) => d.status === 'completed');
      const onTime = completed.filter((d) => {
        const dueDate = new Date(d.timing.dueDate as any);
        const completedDate = new Date(d.timing.completedDate as any);
        return completedDate <= dueDate;
      });

      const stats = {
        total: deliverables.length,
        completed: completed.length,
        inProgress: deliverables.filter((d) => d.status === 'in-progress').length,
        overdue: deliverables.filter((d) => d.status === 'overdue').length,
        onTimeRate: 0,
      };

      if (completed.length > 0) {
        stats.onTimeRate = (onTime.length / completed.length) * 100;
      }

      return stats;
    } catch (error) {
      logger.error(`Error getting stats for affiliate ${affiliateId}:`, error);
      throw error;
    }
  }
}

export const deliverableService = new DeliverableService();
