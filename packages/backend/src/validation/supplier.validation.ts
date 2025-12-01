/**
 * Supplier Validation Schemas
 * Request validation for supplier endpoints
 */

import { body, param, query } from 'express-validator';

export const supplierValidation = {
  // Create supplier validation
  create: [
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('legalName').optional().trim(),
    body('taxId').optional().trim(),
    body('companySize').optional().isIn(['small', 'medium', 'large']),
    body('primaryContact.name').trim().notEmpty().withMessage('Primary contact name is required'),
    body('primaryContact.email').isEmail().withMessage('Valid email is required'),
    body('primaryContact.phone').optional().trim(),
    body('headquarters.address').optional().trim(),
    body('headquarters.city').optional().trim(),
    body('headquarters.state').optional().trim(),
    body('headquarters.zipCode').optional().trim(),
    body('headquarters.country').optional().trim(),
  ],

  // Update supplier validation
  update: [
    param('id').trim().notEmpty().withMessage('Supplier ID is required'),
    body('companyName').optional().trim().notEmpty(),
    body('status').optional().isIn(['pending', 'active', 'qualified', 'rejected', 'on-hold']),
    body('currentStage').optional().isInt({ min: 1, max: 10 }),
    body('progressPercentage').optional().isInt({ min: 0, max: 100 }),
  ],

  // Get by ID validation
  getById: [
    param('id').trim().notEmpty().withMessage('Supplier ID is required'),
  ],

  // Update status validation
  updateStatus: [
    param('id').trim().notEmpty().withMessage('Supplier ID is required'),
    body('status').isIn(['pending', 'active', 'qualified', 'rejected', 'on-hold'])
      .withMessage('Invalid status'),
  ],

  // Update stage validation
  updateStage: [
    param('id').trim().notEmpty().withMessage('Supplier ID is required'),
    body('stage').isInt({ min: 1, max: 10 }).withMessage('Stage must be between 1 and 10'),
  ],

  // Update progress validation
  updateProgress: [
    param('id').trim().notEmpty().withMessage('Supplier ID is required'),
    body('percentage').isInt({ min: 0, max: 100 }).withMessage('Percentage must be between 0 and 100'),
  ],

  // Assign affiliate validation
  assignAffiliate: [
    param('id').trim().notEmpty().withMessage('Supplier ID is required'),
    body('affiliateId').trim().notEmpty().withMessage('Affiliate ID is required'),
  ],

  // Query filters validation
  queryFilters: [
    query('status').optional().isIn(['pending', 'active', 'qualified', 'rejected', 'on-hold']),
    query('stage').optional().isInt({ min: 1, max: 10 }),
    query('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
    query('assignedAffiliate').optional().trim(),
  ],
};
