/**
 * User Controller
 * Handles HTTP requests for user operations
 */

import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { logger } from '../utils/logger';

export class UserController {
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        role: req.query.role as any,
        status: req.query.status as any,
      };

      const users = await userService.getAllUsers(filters);

      res.status(200).json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      logger.error('Error in getAllUsers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve users',
      });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('Error in getUserById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve user',
      });
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.createUser(req.body);

      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully',
      });
    } catch (error) {
      logger.error('Error in createUser:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create user',
      });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.updateUser(id, req.body);

      res.status(200).json({
        success: true,
        data: user,
        message: 'User updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateUser:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user',
      });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteUser:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete user',
      });
    }
  }

  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const userId = (req as any).user?.id || 'system';

      const user = await userService.updateRole(id, role, userId);

      res.status(200).json({
        success: true,
        data: user,
        message: 'User role updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateRole:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user role',
      });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const user = await userService.updateStatus(id, status);

      res.status(200).json({
        success: true,
        data: user,
        message: 'User status updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateStatus:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user status',
      });
    }
  }

  async updatePreferences(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.updatePreferences(id, req.body);

      res.status(200).json({
        success: true,
        data: user,
        message: 'User preferences updated successfully',
      });
    } catch (error) {
      logger.error('Error in updatePreferences:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user preferences',
      });
    }
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await userService.getUserStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error in getStats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve user statistics',
      });
    }
  }
}

export const userController = new UserController();
