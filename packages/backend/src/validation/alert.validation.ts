/**
 * Alert Validation Schemas
 * Request validation for alert endpoints
 */

import { body, param, query } from 'express-validator';

export const alertValidation = {
  // Create alert validation
  create: [
    body('type').isIn([
      'overdue',
      'approaching-deadline',
      'at-risk',
      'stalled',
      'milestone-achieved',
      'stage-advanced',
      'document-rejected',
      'missing-documentation',
      'affiliate-overloaded',
      'unassigned-supplier',
      'custom',
    ]).withMessage('Invalid alert type'),
    body('severity').isIn(['info', 'low', 'medium', 'high', 'critical'])
      .withMessage('Invalid severity'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('recipients').isArray({ min: 1 }).withMessage('At least one recipient required'),
    body('relatedTo.type').isIn(['supplier', 'affiliate', 'deliverable', 'assignment'])
      .withMessage('Invalid related entity type'),
    body('relatedTo.id').trim().notEmpty().withMessage('Related entity ID is required'),
  ],

  // Get by ID validation
  getById: [
    param('id').trim().notEmpty().withMessage('Alert ID is required'),
  ],

  // Mark as read validation
  markAsRead: [
    param('id').trim().notEmpty().withMessage('Alert ID is required'),
  ],

  // Resolve alert validation
  resolve: [
    param('id').trim().notEmpty().withMessage('Alert ID is required'),
    body('notes').optional().trim(),
  ],

  // Take action validation
  takeAction: [
    param('id').trim().notEmpty().withMessage('Alert ID is required'),
    body('action').trim().notEmpty().withMessage('Action is required'),
    body('notes').optional().trim(),
  ],

  // Escalate alert validation
  escalate: [
    param('id').trim().notEmpty().withMessage('Alert ID is required'),
    body('escalateTo').trim().notEmpty().withMessage('Escalation target is required'),
  ],

  // Query filters validation
  queryFilters: [
    query('type').optional().isIn([
      'overdue',
      'approaching-deadline',
      'at-risk',
      'stalled',
      'milestone-achieved',
      'stage-advanced',
      'document-rejected',
      'missing-documentation',
      'affiliate-overloaded',
      'unassigned-supplier',
      'custom',
    ]),
    query('severity').optional().isIn(['info', 'low', 'medium', 'high', 'critical']),
    query('resolved').optional().isBoolean(),
    query('recipientId').optional().trim(),
  ],
};
