import { getFirestore } from '../firebase/config';
import { Timestamp } from 'firebase-admin/firestore';

export interface Customer {
  id: string;
  companyName: string;
  legalName?: string;
  taxId?: string;
  companySize?: 'small' | 'medium' | 'large';
  annualRevenue?: number;
  yearsInBusiness?: number;
  status: 'active' | 'inactive' | 'pending' | 'qualified' | 'disqualified';
  currentStage: number;
  assignedToId?: string;
  assignedToName?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  tags?: string[];
  notes?: string;
}

export class CustomerService {
  private db = getFirestore();

  async getAllCustomers(filters?: {
    status?: string;
    stage?: number;
    assignedTo?: string;
  }): Promise<Customer[]> {
    try {
      let query = this.db.collection('customers');

      if (filters?.status) {
        query = query.where('status', '==', filters.status) as any;
      }
      if (filters?.stage) {
        query = query.where('currentStage', '==', filters.stage) as any;
      }
      if (filters?.assignedTo) {
        query = query.where('assignedToId', '==', filters.assignedTo) as any;
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Customer));
    } catch (error) {
      console.error('Error getting customers:', error);
      throw error;
    }
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const doc = await this.db.collection('customers').doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return {
        id: doc.id,
        ...doc.data()
      } as Customer;
    } catch (error) {
      console.error('Error getting customer:', error);
      throw error;
    }
  }

  async createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    try {
      const docRef = await this.db.collection('customers').add({
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      const doc = await docRef.get();
      return {
        id: doc.id,
        ...doc.data()
      } as Customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
    try {
      const docRef = this.db.collection('customers').doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      await docRef.update({
        ...data,
        updatedAt: Timestamp.now(),
      });

      const updatedDoc = await docRef.get();
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as Customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  async deleteCustomer(id: string): Promise<boolean> {
    try {
      await this.db.collection('customers').doc(id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  async getCustomerStages(customerId: string) {
    try {
      const snapshot = await this.db
        .collection('customers')
        .doc(customerId)
        .collection('qualificationStages')
        .orderBy('stageNumber', 'asc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting customer stages:', error);
      throw error;
    }
  }

  async getCustomerDocuments(customerId: string) {
    try {
      const snapshot = await this.db
        .collection('customers')
        .doc(customerId)
        .collection('documents')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting customer documents:', error);
      throw error;
    }
  }

  async getCustomerCommunications(customerId: string) {
    try {
      const snapshot = await this.db
        .collection('customers')
        .doc(customerId)
        .collection('communications')
        .orderBy('sentAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting customer communications:', error);
      throw error;
    }
  }
}

export default new CustomerService();
