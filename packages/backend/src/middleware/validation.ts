import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg,
      })),
    });
  }
  next();
};

// Customer validation rules
export const validateCustomerCreate = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Company name must be between 2 and 200 characters'),
  
  body('legalName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Legal name must not exceed 200 characters'),
  
  body('taxId')
    .optional()
    .trim()
    .matches(/^[0-9-]+$/)
    .withMessage('Tax ID must contain only numbers and hyphens'),
  
  body('companySize')
    .optional()
    .isIn(['small', 'medium', 'large'])
    .withMessage('Company size must be small, medium, or large'),
  
  body('annualRevenue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Annual revenue must be a positive number'),
  
  body('yearsInBusiness')
    .optional()
    .isInt({ min: 0, max: 200 })
    .withMessage('Years in business must be between 0 and 200'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending', 'qualified', 'disqualified'])
    .withMessage('Invalid status value'),
  
  body('currentStage')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Current stage must be between 1 and 7'),
  
  body('contactEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('contactPhone')
    .optional()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format'),
  
  handleValidationErrors,
];

export const validateCustomerUpdate = [
  param('id')
    .notEmpty()
    .withMessage('Customer ID is required'),
  
  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Company name must be between 2 and 200 characters'),
  
  body('companySize')
    .optional()
    .isIn(['small', 'medium', 'large'])
    .withMessage('Company size must be small, medium, or large'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending', 'qualified', 'disqualified'])
    .withMessage('Invalid status value'),
  
  body('currentStage')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Current stage must be between 1 and 7'),
  
  body('contactEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  handleValidationErrors,
];

export const validateCustomerId = [
  param('id')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isLength({ min: 10 })
    .withMessage('Invalid customer ID format'),
  
  handleValidationErrors,
];

// Query parameter validation
export const validateCustomerQuery = [
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'pending', 'qualified', 'disqualified'])
    .withMessage('Invalid status filter'),
  
  query('stage')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Stage must be between 1 and 7'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive number'),
  
  handleValidationErrors,
];

// Generic ID validation
export const validateId = (paramName: string = 'id') => [
  param(paramName)
    .notEmpty()
    .withMessage(`${paramName} is required`)
    .isLength({ min: 10 })
    .withMessage(`Invalid ${paramName} format`),
  
  handleValidationErrors,
];
