/**
 * User Service
 * Manages multi-role user operations
 */

import { getFirestore } from '../firebase/config';
import { User, UserRole, UserStatus } from '../types/enhanced.types';
import { logger } from '../utils/logger';

export class UserService {
  private db = getFirestore();
  private collection = 'users';

  /**
   * Get all users with optional filtering
   */
  async getAllUsers(filters?: {
    role?: UserRole;
    status?: UserStatus;
  }): Promise<User[]> {
    try {
      let query = this.db.collection(this.collection);

      if (filters?.role) {
        query = query.where('role', '==', filters.role) as any;
      }

      if (filters?.status) {
        query = query.where('status', '==', filters.status) as any;
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
    } catch (error) {
      logger.error('Error getting users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const doc = await this.db.collection(this.collection).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() } as User;
    } catch (error) {
      logger.error(`Error getting user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    } catch (error) {
      logger.error(`Error getting user by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(data: Partial<User>): Promise<User> {
    try {
      const now = new Date();

      const userData: Partial<User> = {
        ...data,
        status: 'pending',
        permissions: data.permissions || this.getDefaultPermissions(data.role!),
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          alertTypes: ['critical', 'high'],
          ...data.preferences,
        },
        lastLogin: now as any,
        lastActivity: now as any,
        createdAt: now as any,
        updatedAt: now as any,
      };

      const docRef = await this.db.collection(this.collection).add(userData);
      const doc = await docRef.get();

      logger.info(`Created user: ${docRef.id} (${data.email})`);

      return { id: doc.id, ...doc.data() } as User;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await this.db.collection(this.collection).doc(id).update(updateData);

      const updated = await this.getUserById(id);

      if (!updated) {
        throw new Error(`User ${id} not found after update`);
      }

      logger.info(`Updated user: ${id}`);

      return updated;
    } catch (error) {
      logger.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await this.db.collection(this.collection).doc(id).delete();
      logger.info(`Deleted user: ${id}`);
    } catch (error) {
      logger.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update user role
   */
  async updateRole(id: string, role: UserRole, updatedBy: string): Promise<User> {
    try {
      const permissions = this.getDefaultPermissions(role);

      await this.db.collection(this.collection).doc(id).update({
        role,
        permissions,
        updatedAt: new Date(),
        updatedBy,
      });

      const updated = await this.getUserById(id);

      if (!updated) {
        throw new Error(`User ${id} not found after role update`);
      }

      logger.info(`Updated role for user ${id}: ${role}`);

      return updated;
    } catch (error) {
      logger.error(`Error updating role for user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update user status
   */
  async updateStatus(id: string, status: UserStatus): Promise<User> {
    try {
      await this.db.collection(this.collection).doc(id).update({
        status,
        updatedAt: new Date(),
      });

      const updated = await this.getUserById(id);

      if (!updated) {
        throw new Error(`User ${id} not found after status update`);
      }

      logger.info(`Updated status for user ${id}: ${status}`);

      return updated;
    } catch (error) {
      logger.error(`Error updating status for user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update last login
   */
  async updateLastLogin(id: string): Promise<void> {
    try {
      await this.db.collection(this.collection).doc(id).update({
        lastLogin: new Date(),
        lastActivity: new Date(),
      });

      logger.info(`Updated last login for user ${id}`);
    } catch (error) {
      logger.error(`Error updating last login for user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update last activity
   */
  async updateLastActivity(id: string): Promise<void> {
    try {
      await this.db.collection(this.collection).doc(id).update({
        lastActivity: new Date(),
      });
    } catch (error) {
      logger.error(`Error updating last activity for user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(id: string, preferences: Partial<User['preferences']>): Promise<User> {
    try {
      const user = await this.getUserById(id);

      if (!user) {
        throw new Error(`User ${id} not found`);
      }

      const updatedPreferences = {
        ...user.preferences,
        ...preferences,
      };

      await this.db.collection(this.collection).doc(id).update({
        preferences: updatedPreferences,
        updatedAt: new Date(),
      });

      const updated = await this.getUserById(id);

      if (!updated) {
        throw new Error(`User ${id} not found after preferences update`);
      }

      logger.info(`Updated preferences for user ${id}`);

      return updated;
    } catch (error) {
      logger.error(`Error updating preferences for user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Link user to supplier
   */
  async linkToSupplier(userId: string, supplierId: string): Promise<User> {
    try {
      await this.db.collection(this.collection).doc(userId).update({
        supplierId,
        updatedAt: new Date(),
      });

      const updated = await this.getUserById(userId);

      if (!updated) {
        throw new Error(`User ${userId} not found after supplier link`);
      }

      logger.info(`Linked user ${userId} to supplier ${supplierId}`);

      return updated;
    } catch (error) {
      logger.error(`Error linking user ${userId} to supplier:`, error);
      throw error;
    }
  }

  /**
   * Link user to affiliate
   */
  async linkToAffiliate(userId: string, affiliateId: string): Promise<User> {
    try {
      await this.db.collection(this.collection).doc(userId).update({
        affiliateId,
        updatedAt: new Date(),
      });

      const updated = await this.getUserById(userId);

      if (!updated) {
        throw new Error(`User ${userId} not found after affiliate link`);
      }

      logger.info(`Linked user ${userId} to affiliate ${affiliateId}`);

      return updated;
    } catch (error) {
      logger.error(`Error linking user ${userId} to affiliate:`, error);
      throw error;
    }
  }

  /**
   * Get default permissions for role
   */
  private getDefaultPermissions(role: UserRole): string[] {
    const permissions: Record<UserRole, string[]> = {
      admin: [
        'users:read',
        'users:write',
        'suppliers:read',
        'suppliers:write',
        'affiliates:read',
        'affiliates:write',
        'assignments:read',
        'assignments:write',
        'deliverables:read',
        'deliverables:write',
        'alerts:read',
        'alerts:write',
        'analytics:read',
        'settings:write',
      ],
      affiliate: [
        'suppliers:read',
        'assignments:read',
        'deliverables:read',
        'deliverables:write',
        'alerts:read',
        'documents:read',
        'documents:write',
      ],
      supplier: [
        'suppliers:read:own',
        'deliverables:read:own',
        'assignments:read:own',
        'alerts:read:own',
        'documents:read:own',
        'documents:write:own',
      ],
      viewer: [
        'suppliers:read',
        'analytics:read',
        'documents:read',
      ],
    };

    return permissions[role] || [];
  }

  /**
   * Check if user has permission
   */
  hasPermission(user: User, permission: string): boolean {
    return user.permissions.includes(permission);
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole): Promise<User[]> {
    return this.getAllUsers({ role, status: 'active' });
  }

  /**
   * Get active admins
   */
  async getActiveAdmins(): Promise<User[]> {
    return this.getUsersByRole('admin');
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total: number;
    byRole: Record<UserRole, number>;
    byStatus: Record<UserStatus, number>;
    activeToday: number;
    activeThisWeek: number;
  }> {
    try {
      const users = await this.getAllUsers();

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats = {
        total: users.length,
        byRole: {
          admin: users.filter((u) => u.role === 'admin').length,
          affiliate: users.filter((u) => u.role === 'affiliate').length,
          supplier: users.filter((u) => u.role === 'supplier').length,
          viewer: users.filter((u) => u.role === 'viewer').length,
        },
        byStatus: {
          active: users.filter((u) => u.status === 'active').length,
          inactive: users.filter((u) => u.status === 'inactive').length,
          pending: users.filter((u) => u.status === 'pending').length,
        },
        activeToday: users.filter((u) => {
          const lastActivity = new Date(u.lastActivity as any);
          return lastActivity >= today;
        }).length,
        activeThisWeek: users.filter((u) => {
          const lastActivity = new Date(u.lastActivity as any);
          return lastActivity >= weekAgo;
        }).length,
      };

      return stats;
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
