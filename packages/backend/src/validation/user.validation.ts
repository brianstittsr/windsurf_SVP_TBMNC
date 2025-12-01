/**
 * User Validation Schemas
 * Request validation for user endpoints
 */

import { body, param, query } from 'express-validator';

export const userValidation = {
  // Create user validation
  create: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('role').isIn(['admin', 'affiliate', 'supplier', 'viewer'])
      .withMessage('Invalid role'),
    body('phone').optional().trim(),
  ],

  // Update user validation
  update: [
    param('id').trim().notEmpty().withMessage('User ID is required'),
    body('email').optional().isEmail(),
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('phone').optional().trim(),
  ],

  // Get by ID validation
  getById: [
    param('id').trim().notEmpty().withMessage('User ID is required'),
  ],

  // Update role validation
  updateRole: [
    param('id').trim().notEmpty().withMessage('User ID is required'),
    body('role').isIn(['admin', 'affiliate', 'supplier', 'viewer'])
      .withMessage('Invalid role'),
  ],

  // Update status validation
  updateStatus: [
    param('id').trim().notEmpty().withMessage('User ID is required'),
    body('status').isIn(['active', 'inactive', 'pending'])
      .withMessage('Invalid status'),
  ],

  // Update preferences validation
  updatePreferences: [
    param('id').trim().notEmpty().withMessage('User ID is required'),
    body('emailNotifications').optional().isBoolean(),
    body('smsNotifications').optional().isBoolean(),
    body('alertTypes').optional().isArray(),
  ],

  // Query filters validation
  queryFilters: [
    query('role').optional().isIn(['admin', 'affiliate', 'supplier', 'viewer']),
    query('status').optional().isIn(['active', 'inactive', 'pending']),
  ],
};
