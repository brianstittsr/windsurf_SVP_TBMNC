import { getFirestore } from '../firebase/config';

export class AnalyticsService {
  private db = getFirestore();

  async getDashboardMetrics() {
    try {
      const doc = await this.db.collection('analytics').doc('dashboard').get();
      
      if (!doc.exists) {
        // Return default metrics if not found
        return {
          totalCustomers: 0,
          activeCustomers: 0,
          qualifiedCustomers: 0,
          pendingReviews: 0,
          averageQualificationTime: 0,
          stageDistribution: {},
          statusDistribution: {},
          lastUpdated: new Date(),
        };
      }

      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }

  async getPipelineOverview() {
    try {
      const doc = await this.db.collection('analytics').doc('pipeline').get();
      
      if (!doc.exists) {
        // Return default pipeline if not found
        return {
          stages: [],
          lastUpdated: new Date(),
        };
      }

      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error getting pipeline overview:', error);
      throw error;
    }
  }

  async getCustomerAnalytics(customerId: string) {
    try {
      // Get customer data
      const customerDoc = await this.db.collection('customers').doc(customerId).get();
      
      if (!customerDoc.exists) {
        return null;
      }

      const customer = customerDoc.data();

      // Get stages
      const stagesSnapshot = await this.db
        .collection('customers')
        .doc(customerId)
        .collection('qualificationStages')
        .orderBy('stageNumber', 'asc')
        .get();

      const stages = stagesSnapshot.docs.map(doc => doc.data());

      // Get documents count
      const docsSnapshot = await this.db
        .collection('customers')
        .doc(customerId)
        .collection('documents')
        .get();

      // Get communications count
      const commsSnapshot = await this.db
        .collection('customers')
        .doc(customerId)
        .collection('communications')
        .get();

      return {
        customerId,
        companyName: customer?.companyName,
        currentStage: customer?.currentStage,
        status: customer?.status,
        totalStages: stages.length,
        completedStages: stages.filter((s: any) => s.status === 'completed').length,
        totalDocuments: docsSnapshot.size,
        totalCommunications: commsSnapshot.size,
        createdAt: customer?.createdAt,
        updatedAt: customer?.updatedAt,
      };
    } catch (error) {
      console.error('Error getting customer analytics:', error);
      throw error;
    }
  }

  async updateDashboardMetrics() {
    try {
      // Get all customers
      const customersSnapshot = await this.db.collection('customers').get();
      const customers = customersSnapshot.docs.map(doc => doc.data());

      // Calculate metrics
      const totalCustomers = customers.length;
      const activeCustomers = customers.filter((c: any) => c.status === 'active').length;
      const qualifiedCustomers = customers.filter((c: any) => c.status === 'qualified').length;

      // Get pending documents
      const pendingDocs = await this.db
        .collectionGroup('documents')
        .where('status', '==', 'pending')
        .get();

      // Calculate stage distribution
      const stageDistribution: Record<number, number> = {};
      customers.forEach((c: any) => {
        const stage = c.currentStage || 1;
        stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;
      });

      // Calculate status distribution
      const statusDistribution: Record<string, number> = {};
      customers.forEach((c: any) => {
        const status = c.status || 'pending';
        statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      });

      const metrics = {
        totalCustomers,
        activeCustomers,
        qualifiedCustomers,
        pendingReviews: pendingDocs.size,
        averageQualificationTime: 45, // TODO: Calculate from actual data
        stageDistribution,
        statusDistribution,
        lastUpdated: new Date(),
      };

      await this.db.collection('analytics').doc('dashboard').set(metrics);

      return metrics;
    } catch (error) {
      console.error('Error updating dashboard metrics:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();
