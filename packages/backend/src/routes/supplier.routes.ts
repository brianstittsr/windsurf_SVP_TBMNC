/**
 * Supplier Routes
 * API routes for supplier operations
 */

import { Router } from 'express';
import { supplierController } from '../controllers/supplier.controller';

const router = Router();

// GET /api/suppliers - Get all suppliers
router.get('/', supplierController.getAllSuppliers.bind(supplierController));

// GET /api/suppliers/stats - Get supplier statistics
router.get('/stats', supplierController.getStats.bind(supplierController));

// GET /api/suppliers/:id - Get supplier by ID
router.get('/:id', supplierController.getSupplierById.bind(supplierController));

// POST /api/suppliers - Create new supplier
router.post('/', supplierController.createSupplier.bind(supplierController));

// PUT /api/suppliers/:id - Update supplier
router.put('/:id', supplierController.updateSupplier.bind(supplierController));

// DELETE /api/suppliers/:id - Delete supplier
router.delete('/:id', supplierController.deleteSupplier.bind(supplierController));

// PATCH /api/suppliers/:id/status - Update supplier status
router.patch('/:id/status', supplierController.updateStatus.bind(supplierController));

// PATCH /api/suppliers/:id/stage - Update supplier stage
router.patch('/:id/stage', supplierController.updateStage.bind(supplierController));

// PATCH /api/suppliers/:id/progress - Update supplier progress
router.patch('/:id/progress', supplierController.updateProgress.bind(supplierController));

// POST /api/suppliers/:id/affiliates - Assign affiliate to supplier
router.post('/:id/affiliates', supplierController.assignAffiliate.bind(supplierController));

// DELETE /api/suppliers/:id/affiliates - Remove affiliate from supplier
router.delete('/:id/affiliates', supplierController.removeAffiliate.bind(supplierController));

// POST /api/suppliers/:id/complete-onboarding - Complete supplier onboarding
router.post('/:id/complete-onboarding', supplierController.completeOnboarding.bind(supplierController));

export default router;
