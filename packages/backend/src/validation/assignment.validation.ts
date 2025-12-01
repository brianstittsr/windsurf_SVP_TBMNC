/**
 * Assignment Validation Schemas
 * Request validation for assignment endpoints
 */

import { body, param, query } from 'express-validator';

export const assignmentValidation = {
  // Create assignment validation
  create: [
    body('supplierId').trim().notEmpty().withMessage('Supplier ID is required'),
    body('affiliateId').trim().notEmpty().withMessage('Affiliate ID is required'),
    body('scope').trim().notEmpty().withMessage('Scope is required'),
    body('startDate').optional().isISO8601().withMessage('Valid start date required'),
    body('financial.budgetAllocated').optional().isFloat({ min: 0 }),
    body('financial.billingType').optional().isIn(['hourly', 'fixed', 'milestone']),
  ],

  // Update assignment validation
  update: [
    param('id').trim().notEmpty().withMessage('Assignment ID is required'),
    body('scope').optional().trim(),
    body('status').optional().isIn(['pending', 'active', 'completed', 'cancelled']),
  ],

  // Get by ID validation
  getById: [
    param('id').trim().notEmpty().withMessage('Assignment ID is required'),
  ],

  // Approve assignment validation
  approve: [
    param('id').trim().notEmpty().withMessage('Assignment ID is required'),
  ],

  // Cancel assignment validation
  cancel: [
    param('id').trim().notEmpty().withMessage('Assignment ID is required'),
    body('reason').optional().trim(),
  ],

  // Query filters validation
  queryFilters: [
    query('supplierId').optional().trim(),
    query('affiliateId').optional().trim(),
    query('status').optional().isIn(['pending', 'active', 'completed', 'cancelled']),
  ],
};
