/**
 * Deliverable Routes
 * API routes for deliverable operations
 */

import { Router } from 'express';
import { deliverableController } from '../controllers/deliverable.controller';

const router = Router();

// GET /api/deliverables - Get all deliverables
router.get('/', deliverableController.getAllDeliverables.bind(deliverableController));

// GET /api/deliverables/overdue - Get overdue deliverables
router.get('/overdue', deliverableController.getOverdueDeliverables.bind(deliverableController));

// GET /api/deliverables/:id - Get deliverable by ID
router.get('/:id', deliverableController.getDeliverableById.bind(deliverableController));

// POST /api/deliverables - Create new deliverable
router.post('/', deliverableController.createDeliverable.bind(deliverableController));

// PUT /api/deliverables/:id - Update deliverable
router.put('/:id', deliverableController.updateDeliverable.bind(deliverableController));

// DELETE /api/deliverables/:id - Delete deliverable
router.delete('/:id', deliverableController.deleteDeliverable.bind(deliverableController));

// PATCH /api/deliverables/:id/status - Update deliverable status
router.patch('/:id/status', deliverableController.updateStatus.bind(deliverableController));

// PATCH /api/deliverables/:id/progress - Update deliverable progress
router.patch('/:id/progress', deliverableController.updateProgress.bind(deliverableController));

// POST /api/deliverables/:id/milestones - Complete milestone
router.post('/:id/milestones', deliverableController.completeMilestone.bind(deliverableController));

// POST /api/deliverables/:id/notes - Add note
router.post('/:id/notes', deliverableController.addNote.bind(deliverableController));

export default router;
