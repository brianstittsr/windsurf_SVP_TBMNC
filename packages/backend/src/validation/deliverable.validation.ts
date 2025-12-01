/**
 * Deliverable Validation Schemas
 * Request validation for deliverable endpoints
 */

import { body, param, query } from 'express-validator';

export const deliverableValidation = {
  // Create deliverable validation
  create: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('supplierId').trim().notEmpty().withMessage('Supplier ID is required'),
    body('priority').isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority'),
    body('timing.dueDate').optional().isISO8601().withMessage('Valid due date required'),
    body('timing.estimatedDuration').optional().isInt({ min: 0 }),
  ],

  // Update deliverable validation
  update: [
    param('id').trim().notEmpty().withMessage('Deliverable ID is required'),
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('status').optional().isIn(['not-started', 'in-progress', 'completed', 'overdue', 'blocked']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  ],

  // Get by ID validation
  getById: [
    param('id').trim().notEmpty().withMessage('Deliverable ID is required'),
  ],

  // Update status validation
  updateStatus: [
    param('id').trim().notEmpty().withMessage('Deliverable ID is required'),
    body('status').isIn(['not-started', 'in-progress', 'completed', 'overdue', 'blocked'])
      .withMessage('Invalid status'),
  ],

  // Update progress validation
  updateProgress: [
    param('id').trim().notEmpty().withMessage('Deliverable ID is required'),
    body('percentage').isInt({ min: 0, max: 100 })
      .withMessage('Percentage must be between 0 and 100'),
  ],

  // Complete milestone validation
  completeMilestone: [
    param('id').trim().notEmpty().withMessage('Deliverable ID is required'),
    body('milestone').trim().notEmpty().withMessage('Milestone is required'),
  ],

  // Add note validation
  addNote: [
    param('id').trim().notEmpty().withMessage('Deliverable ID is required'),
    body('note').trim().notEmpty().withMessage('Note is required'),
  ],

  // Query filters validation
  queryFilters: [
    query('supplierId').optional().trim(),
    query('assignmentId').optional().trim(),
    query('status').optional().isIn(['not-started', 'in-progress', 'completed', 'overdue', 'blocked']),
    query('category').optional().trim(),
  ],
};
