/**
 * Supplier Service (Enhanced V2)
 * Manages comprehensive supplier operations with TBMNC-specific fields
 */

import { getFirestore } from '../firebase/config';
import { Supplier, SupplierStatus, RiskLevel } from '../types/enhanced.types';
import { logger } from '../utils/logger';

export class SupplierService {
  private db = getFirestore();
  private collection = 'suppliers';

  /**
   * Get all suppliers with optional filtering
   */
  async getAllSuppliers(filters?: {
    status?: SupplierStatus;
    stage?: number;
    riskLevel?: RiskLevel;
    assignedAffiliate?: string;
  }): Promise<Supplier[]> {
    try {
      let query = this.db.collection(this.collection);

      if (filters?.status) {
        query = query.where('status', '==', filters.status) as any;
      }

      if (filters?.stage) {
        query = query.where('currentStage', '==', filters.stage) as any;
      }

      if (filters?.riskLevel) {
        query = query.where('riskLevel', '==', filters.riskLevel) as any;
      }

      if (filters?.assignedAffiliate) {
        query = query.where('assignedAffiliates', 'array-contains', filters.assignedAffiliate) as any;
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Supplier));
    } catch (error) {
      logger.error('Error getting suppliers:', error);
      throw error;
    }
  }

  /**
   * Get supplier by ID
   */
  async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      const doc = await this.db.collection(this.collection).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() } as Supplier;
    } catch (error) {
      logger.error(`Error getting supplier ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new supplier
   */
  async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
    try {
      const now = new Date();

      const supplierData: Partial<Supplier> = {
        ...data,
        status: 'pending',
        currentStage: 1,
        progressPercentage: 0,
        daysInCurrentStage: 0,
        totalDaysInProcess: 0,
        riskLevel: 'low',
        riskFactors: [],
        assignedAffiliates: [],
        onboardingCompleted: false,
        onboardingStep: 1,
        onboardingStartedAt: now as any,
        tags: data.tags || [],
        categories: data.categories || [],
        createdAt: now as any,
        updatedAt: now as any,
        createdBy: data.createdBy || 'system',
        lastModifiedBy: data.createdBy || 'system',
      };

      const docRef = await this.db.collection(this.collection).add(supplierData);
      const doc = await docRef.get();

      logger.info(`Created supplier: ${docRef.id} (${data.companyName})`);

      return { id: doc.id, ...doc.data() } as Supplier;
    } catch (error) {
      logger.error('Error creating supplier:', error);
      throw error;
    }
  }

  /**
   * Update supplier
   */
  async updateSupplier(id: string, data: Partial<Supplier>, userId: string): Promise<Supplier> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
        lastModifiedBy: userId,
      };

      await this.db.collection(this.collection).doc(id).update(updateData);

      const updated = await this.getSupplierById(id);

      if (!updated) {
        throw new Error(`Supplier ${id} not found after update`);
      }

      logger.info(`Updated supplier: ${id}`);

      return updated;
    } catch (error) {
      logger.error(`Error updating supplier ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete supplier
   */
  async deleteSupplier(id: string): Promise<void> {
    try {
      await this.db.collection(this.collection).doc(id).delete();
      logger.info(`Deleted supplier: ${id}`);
    } catch (error) {
      logger.error(`Error deleting supplier ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update supplier status
   */
  async updateStatus(id: string, status: SupplierStatus, userId: string): Promise<Supplier> {
    try {
      await this.db.collection(this.collection).doc(id).update({
        status,
        updatedAt: new Date(),
        lastModifiedBy: userId,
      });

      const updated = await this.getSupplierById(id);

      if (!updated) {
        throw new Error(`Supplier ${id} not found after status update`);
      }

      logger.info(`Updated status for supplier ${id}: ${status}`);

      return updated;
    } catch (error) {
      logger.error(`Error updating status for supplier ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update supplier stage
   */
  async updateStage(id: string, stage: number, userId: string): Promise<Supplier> {
    try {
      const supplier = await this.getSupplierById(id);

      if (!supplier) {
        throw new Error(`Supplier ${id} not found`);
      }

      await this.db.collection(this.collection).doc(id).update({
        currentStage: stage,
        daysInCurrentStage: 0,
        updatedAt: new Date(),
        lastModifiedBy: userId,
      });

      const updated = await this.getSupplierById(id);

      if (!updated) {
        throw new Error(`Supplier ${id} not found after stage update`);
      }

      logger.info(`Updated stage for supplier ${id}: ${stage}`);

      return updated;
    } catch (error) {
      logger.error(`Error updating stage for supplier ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update supplier progress
   */
  async updateProgress(id: string, percentage: number, userId: string): Promise<Supplier> {
    try {
      await this.db.collection(this.collection).doc(id).update({
        progressPercentage: Math.min(100, Math.max(0, percentage)),
        updatedAt: new Date(),
        lastModifiedBy: userId,
      });

      const updated = await this.getSupplierById(id);

      if (!updated) {
        throw new Error(`Supplier ${id} not found after progress update`);
      }

      logger.info(`Updated progress for supplier ${id}: ${percentage}%`);

      return updated;
    } catch (error) {
      logger.error(`Error updating progress for supplier ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update risk level
   */
  async updateRiskLevel(id: string, riskLevel: RiskLevel, riskFactors: string[], userId: string): Promise<Supplier> {
    try {
      await this.db.collection(this.collection).doc(id).update({
        riskLevel,
        riskFactors,
        updatedAt: new Date(),
        lastModifiedBy: userId,
      });

      const updated = await this.getSupplierById(id);

      if (!updated) {
        throw new Error(`Supplier ${id} not found after risk update`);
      }

      logger.info(`Updated risk level for supplier ${id}: ${riskLevel}`);

      return updated;
    } catch (error) {
      logger.error(`Error updating risk level for supplier ${id}:`, error);
      throw error;
    }
  }

  /**
   * Assign affiliate to supplier
   */
  async assignAffiliate(supplierId: string, affiliateId: string, userId: string): Promise<Supplier> {
    try {
      const supplier = await this.getSupplierById(supplierId);

      if (!supplier) {
        throw new Error(`Supplier ${supplierId} not found`);
      }

      const assignedAffiliates = [...new Set([...supplier.assignedAffiliates, affiliateId])];

      await this.db.collection(this.collection).doc(supplierId).update({
        assignedAffiliates,
        updatedAt: new Date(),
        lastModifiedBy: userId,
      });

      const updated = await this.getSupplierById(supplierId);

      if (!updated) {
        throw new Error(`Supplier ${supplierId} not found after affiliate assignment`);
      }

      logger.info(`Assigned affiliate ${affiliateId} to supplier ${supplierId}`);

      return updated;
    } catch (error) {
      logger.error(`Error assigning affiliate to supplier ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Remove affiliate from supplier
   */
  async removeAffiliate(supplierId: string, affiliateId: string, userId: string): Promise<Supplier> {
    try {
      const supplier = await this.getSupplierById(supplierId);

      if (!supplier) {
        throw new Error(`Supplier ${supplierId} not found`);
      }

      const assignedAffiliates = supplier.assignedAffiliates.filter((id) => id !== affiliateId);

      await this.db.collection(this.collection).doc(supplierId).update({
        assignedAffiliates,
        updatedAt: new Date(),
        lastModifiedBy: userId,
      });

      const updated = await this.getSupplierById(supplierId);

      if (!updated) {
        throw new Error(`Supplier ${supplierId} not found after affiliate removal`);
      }

      logger.info(`Removed affiliate ${affiliateId} from supplier ${supplierId}`);

      return updated;
    } catch (error) {
      logger.error(`Error removing affiliate from supplier ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(id: string, userId: string): Promise<Supplier> {
    try {
      await this.db.collection(this.collection).doc(id).update({
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: userId,
      });

      const updated = await this.getSupplierById(id);

      if (!updated) {
        throw new Error(`Supplier ${id} not found after onboarding completion`);
      }

      logger.info(`Completed onboarding for supplier ${id}`);

      return updated;
    } catch (error) {
      logger.error(`Error completing onboarding for supplier ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get supplier statistics
   */
  async getSupplierStats(filters?: {
    status?: SupplierStatus;
  }): Promise<{
    total: number;
    byStatus: Record<SupplierStatus, number>;
    byStage: Record<number, number>;
    byRisk: Record<RiskLevel, number>;
    averageProgress: number;
    averageDaysInProcess: number;
  }> {
    try {
      const suppliers = await this.getAllSuppliers(filters);

      const stats = {
        total: suppliers.length,
        byStatus: {
          pending: suppliers.filter((s) => s.status === 'pending').length,
          active: suppliers.filter((s) => s.status === 'active').length,
          qualified: suppliers.filter((s) => s.status === 'qualified').length,
          rejected: suppliers.filter((s) => s.status === 'rejected').length,
          'on-hold': suppliers.filter((s) => s.status === 'on-hold').length,
        },
        byStage: {} as Record<number, number>,
        byRisk: {
          low: suppliers.filter((s) => s.riskLevel === 'low').length,
          medium: suppliers.filter((s) => s.riskLevel === 'medium').length,
          high: suppliers.filter((s) => s.riskLevel === 'high').length,
          critical: suppliers.filter((s) => s.riskLevel === 'critical').length,
        },
        averageProgress: 0,
        averageDaysInProcess: 0,
      };

      // Calculate by stage
      suppliers.forEach((s) => {
        stats.byStage[s.currentStage] = (stats.byStage[s.currentStage] || 0) + 1;
      });

      // Calculate averages
      if (suppliers.length > 0) {
        stats.averageProgress =
          suppliers.reduce((sum, s) => sum + s.progressPercentage, 0) / suppliers.length;
        stats.averageDaysInProcess =
          suppliers.reduce((sum, s) => sum + s.totalDaysInProcess, 0) / suppliers.length;
      }

      return stats;
    } catch (error) {
      logger.error('Error getting supplier stats:', error);
      throw error;
    }
  }

  /**
   * Update days in process (should be run daily)
   */
  async updateDaysInProcess(): Promise<void> {
    try {
      const suppliers = await this.getAllSuppliers({
        status: 'active',
      });

      for (const supplier of suppliers) {
        await this.db.collection(this.collection).doc(supplier.id).update({
          daysInCurrentStage: supplier.daysInCurrentStage + 1,
          totalDaysInProcess: supplier.totalDaysInProcess + 1,
          updatedAt: new Date(),
        });
      }

      logger.info(`Updated days in process for ${suppliers.length} suppliers`);
    } catch (error) {
      logger.error('Error updating days in process:', error);
      throw error;
    }
  }
}

export const supplierService = new SupplierService();
