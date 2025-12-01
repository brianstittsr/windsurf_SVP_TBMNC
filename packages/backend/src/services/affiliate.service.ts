/**
 * Affiliate Service
 * Manages affiliate (service provider) operations
 */

import { getFirestore } from '../firebase/config';
import { Affiliate, AffiliateStatus, Availability } from '../types/enhanced.types';
import { logger } from '../utils/logger';

export class AffiliateService {
  private db = getFirestore();
  private collection = 'affiliates';

  /**
   * Get all affiliates with optional filtering
   */
  async getAllAffiliates(filters?: {
    status?: AffiliateStatus;
    availability?: Availability;
    serviceCategory?: string;
  }): Promise<Affiliate[]> {
    try {
      let query = this.db.collection(this.collection);

      if (filters?.status) {
        query = query.where('status', '==', filters.status) as any;
      }

      if (filters?.availability) {
        query = query.where('capacity.availability', '==', filters.availability) as any;
      }

      if (filters?.serviceCategory) {
        query = query.where('serviceOfferings.categories', 'array-contains', filters.serviceCategory) as any;
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Affiliate));
    } catch (error) {
      logger.error('Error getting affiliates:', error);
      throw error;
    }
  }

  /**
   * Get affiliate by ID
   */
  async getAffiliateById(id: string): Promise<Affiliate | null> {
    try {
      const doc = await this.db.collection(this.collection).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() } as Affiliate;
    } catch (error) {
      logger.error(`Error getting affiliate ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new affiliate
   */
  async createAffiliate(data: Partial<Affiliate>): Promise<Affiliate> {
    try {
      const now = new Date();

      const affiliateData: Partial<Affiliate> = {
        ...data,
        status: 'pending-approval',
        registrationDate: now as any,
        registrationCompleted: false,
        registrationStep: 1,
        assignments: {
          current: [],
          past: [],
          totalCompleted: 0,
          totalActive: 0,
        },
        performance: {
          averageRating: 0,
          totalRatings: 0,
          onTimeDeliveryRate: 0,
          clientSatisfactionScore: 0,
          repeatClientRate: 0,
          ratings: {
            quality: 0,
            communication: 0,
            timeliness: 0,
            expertise: 0,
            value: 0,
          },
        },
        createdAt: now as any,
        updatedAt: now as any,
        lastActivity: now as any,
      };

      const docRef = await this.db.collection(this.collection).add(affiliateData);
      const doc = await docRef.get();

      logger.info(`Created affiliate: ${docRef.id}`);

      return { id: doc.id, ...doc.data() } as Affiliate;
    } catch (error) {
      logger.error('Error creating affiliate:', error);
      throw error;
    }
  }

  /**
   * Update affiliate
   */
  async updateAffiliate(id: string, data: Partial<Affiliate>): Promise<Affiliate> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await this.db.collection(this.collection).doc(id).update(updateData);

      const updated = await this.getAffiliateById(id);

      if (!updated) {
        throw new Error(`Affiliate ${id} not found after update`);
      }

      logger.info(`Updated affiliate: ${id}`);

      return updated;
    } catch (error) {
      logger.error(`Error updating affiliate ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete affiliate
   */
  async deleteAffiliate(id: string): Promise<void> {
    try {
      await this.db.collection(this.collection).doc(id).delete();
      logger.info(`Deleted affiliate: ${id}`);
    } catch (error) {
      logger.error(`Error deleting affiliate ${id}:`, error);
      throw error;
    }
  }

  /**
   * Approve affiliate registration
   */
  async approveAffiliate(id: string, approvedBy: string): Promise<Affiliate> {
    try {
      const updateData = {
        status: 'active' as AffiliateStatus,
        'approvalStatus.approved': true,
        'approvalStatus.approvedBy': approvedBy,
        'approvalStatus.approvedAt': new Date(),
        updatedAt: new Date(),
      };

      await this.db.collection(this.collection).doc(id).update(updateData);

      const updated = await this.getAffiliateById(id);

      if (!updated) {
        throw new Error(`Affiliate ${id} not found after approval`);
      }

      logger.info(`Approved affiliate: ${id} by ${approvedBy}`);

      return updated;
    } catch (error) {
      logger.error(`Error approving affiliate ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reject affiliate registration
   */
  async rejectAffiliate(id: string, reason: string): Promise<Affiliate> {
    try {
      const updateData = {
        status: 'inactive' as AffiliateStatus,
        'approvalStatus.approved': false,
        'approvalStatus.rejectionReason': reason,
        updatedAt: new Date(),
      };

      await this.db.collection(this.collection).doc(id).update(updateData);

      const updated = await this.getAffiliateById(id);

      if (!updated) {
        throw new Error(`Affiliate ${id} not found after rejection`);
      }

      logger.info(`Rejected affiliate: ${id}`);

      return updated;
    } catch (error) {
      logger.error(`Error rejecting affiliate ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get available affiliates for assignment
   */
  async getAvailableAffiliates(serviceCategory?: string): Promise<Affiliate[]> {
    try {
      let query = this.db.collection(this.collection)
        .where('status', '==', 'active')
        .where('capacity.availability', 'in', ['available', 'limited']);

      if (serviceCategory) {
        query = query.where('serviceOfferings.categories', 'array-contains', serviceCategory) as any;
      }

      const snapshot = await query.get();
      const affiliates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Affiliate));

      // Filter by capacity
      return affiliates.filter((a) => a.capacity.currentLoad < a.capacity.maxCapacity);
    } catch (error) {
      logger.error('Error getting available affiliates:', error);
      throw error;
    }
  }

  /**
   * Update affiliate capacity
   */
  async updateCapacity(id: string, currentLoad: number): Promise<void> {
    try {
      const affiliate = await this.getAffiliateById(id);

      if (!affiliate) {
        throw new Error(`Affiliate ${id} not found`);
      }

      const maxCapacity = affiliate.capacity.maxCapacity;
      const utilizationRate = currentLoad / maxCapacity;

      let availability: Availability = 'available';
      if (utilizationRate >= 1) {
        availability = 'unavailable';
      } else if (utilizationRate >= 0.8) {
        availability = 'limited';
      }

      await this.db.collection(this.collection).doc(id).update({
        'capacity.currentLoad': currentLoad,
        'capacity.availability': availability,
        updatedAt: new Date(),
      });

      logger.info(`Updated capacity for affiliate ${id}: ${currentLoad}/${maxCapacity}`);
    } catch (error) {
      logger.error(`Error updating capacity for affiliate ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update affiliate performance metrics
   */
  async updatePerformance(id: string, metrics: {
    rating?: number;
    onTimeDelivery?: boolean;
    clientSatisfaction?: number;
  }): Promise<void> {
    try {
      const affiliate = await this.getAffiliateById(id);

      if (!affiliate) {
        throw new Error(`Affiliate ${id} not found`);
      }

      const updates: any = {
        updatedAt: new Date(),
      };

      if (metrics.rating !== undefined) {
        const totalRatings = affiliate.performance.totalRatings + 1;
        const currentTotal = affiliate.performance.averageRating * affiliate.performance.totalRatings;
        const newAverage = (currentTotal + metrics.rating) / totalRatings;

        updates['performance.averageRating'] = newAverage;
        updates['performance.totalRatings'] = totalRatings;
      }

      if (metrics.onTimeDelivery !== undefined) {
        const totalDeliveries = affiliate.assignments.totalCompleted;
        const currentOnTime = affiliate.performance.onTimeDeliveryRate * totalDeliveries;
        const newOnTime = metrics.onTimeDelivery ? currentOnTime + 1 : currentOnTime;
        const newRate = newOnTime / (totalDeliveries + 1);

        updates['performance.onTimeDeliveryRate'] = newRate;
      }

      if (metrics.clientSatisfaction !== undefined) {
        updates['performance.clientSatisfactionScore'] = metrics.clientSatisfaction;
      }

      await this.db.collection(this.collection).doc(id).update(updates);

      logger.info(`Updated performance for affiliate ${id}`);
    } catch (error) {
      logger.error(`Error updating performance for affiliate ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add assignment to affiliate
   */
  async addAssignment(id: string, supplierId: string): Promise<void> {
    try {
      const affiliate = await this.getAffiliateById(id);

      if (!affiliate) {
        throw new Error(`Affiliate ${id} not found`);
      }

      const currentAssignments = affiliate.assignments.current || [];
      const newLoad = currentAssignments.length + 1;

      await this.db.collection(this.collection).doc(id).update({
        'assignments.current': [...currentAssignments, supplierId],
        'assignments.totalActive': newLoad,
        updatedAt: new Date(),
      });

      // Update capacity
      await this.updateCapacity(id, newLoad);

      logger.info(`Added assignment for affiliate ${id}: supplier ${supplierId}`);
    } catch (error) {
      logger.error(`Error adding assignment for affiliate ${id}:`, error);
      throw error;
    }
  }

  /**
   * Complete assignment for affiliate
   */
  async completeAssignment(id: string, supplierId: string): Promise<void> {
    try {
      const affiliate = await this.getAffiliateById(id);

      if (!affiliate) {
        throw new Error(`Affiliate ${id} not found`);
      }

      const currentAssignments = affiliate.assignments.current || [];
      const pastAssignments = affiliate.assignments.past || [];

      const updatedCurrent = currentAssignments.filter((s) => s !== supplierId);
      const updatedPast = [...pastAssignments, supplierId];

      await this.db.collection(this.collection).doc(id).update({
        'assignments.current': updatedCurrent,
        'assignments.past': updatedPast,
        'assignments.totalActive': updatedCurrent.length,
        'assignments.totalCompleted': updatedPast.length,
        updatedAt: new Date(),
      });

      // Update capacity
      await this.updateCapacity(id, updatedCurrent.length);

      logger.info(`Completed assignment for affiliate ${id}: supplier ${supplierId}`);
    } catch (error) {
      logger.error(`Error completing assignment for affiliate ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search affiliates by criteria
   */
  async searchAffiliates(criteria: {
    serviceCategories?: string[];
    minRating?: number;
    availability?: Availability;
    geographicPreferences?: string[];
  }): Promise<Affiliate[]> {
    try {
      let affiliates = await this.getAllAffiliates({
        status: 'active',
        availability: criteria.availability,
      });

      // Filter by service categories
      if (criteria.serviceCategories && criteria.serviceCategories.length > 0) {
        affiliates = affiliates.filter((a) =>
          criteria.serviceCategories!.some((cat) =>
            a.serviceOfferings.categories.includes(cat)
          )
        );
      }

      // Filter by minimum rating
      if (criteria.minRating !== undefined) {
        affiliates = affiliates.filter((a) => a.performance.averageRating >= criteria.minRating!);
      }

      // Filter by geographic preferences
      if (criteria.geographicPreferences && criteria.geographicPreferences.length > 0) {
        affiliates = affiliates.filter((a) =>
          criteria.geographicPreferences!.some((geo) =>
            a.capacity.geographicPreferences.includes(geo)
          )
        );
      }

      return affiliates;
    } catch (error) {
      logger.error('Error searching affiliates:', error);
      throw error;
    }
  }
}

export const affiliateService = new AffiliateService();
