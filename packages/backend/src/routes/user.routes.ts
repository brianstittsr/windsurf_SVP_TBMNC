/**
 * User Routes
 * API routes for user operations
 */

import { Router } from 'express';
import { userController } from '../controllers/user.controller';

const router = Router();

// GET /api/users - Get all users
router.get('/', userController.getAllUsers.bind(userController));

// GET /api/users/stats - Get user statistics
router.get('/stats', userController.getStats.bind(userController));

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getUserById.bind(userController));

// POST /api/users - Create new user
router.post('/', userController.createUser.bind(userController));

// PUT /api/users/:id - Update user
router.put('/:id', userController.updateUser.bind(userController));

// DELETE /api/users/:id - Delete user
router.delete('/:id', userController.deleteUser.bind(userController));

// PATCH /api/users/:id/role - Update user role
router.patch('/:id/role', userController.updateRole.bind(userController));

// PATCH /api/users/:id/status - Update user status
router.patch('/:id/status', userController.updateStatus.bind(userController));

// PATCH /api/users/:id/preferences - Update user preferences
router.patch('/:id/preferences', userController.updatePreferences.bind(userController));

export default router;
