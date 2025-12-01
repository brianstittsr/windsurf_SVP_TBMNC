/**
 * Assignment Routes
 * API routes for assignment operations
 */

import { Router } from 'express';
import { assignmentController } from '../controllers/assignment.controller';

const router = Router();

// GET /api/assignments - Get all assignments
router.get('/', assignmentController.getAllAssignments.bind(assignmentController));

// GET /api/assignments/stats - Get assignment statistics
router.get('/stats', assignmentController.getStats.bind(assignmentController));

// GET /api/assignments/:id - Get assignment by ID
router.get('/:id', assignmentController.getAssignmentById.bind(assignmentController));

// POST /api/assignments - Create new assignment
router.post('/', assignmentController.createAssignment.bind(assignmentController));

// PUT /api/assignments/:id - Update assignment
router.put('/:id', assignmentController.updateAssignment.bind(assignmentController));

// DELETE /api/assignments/:id - Delete assignment
router.delete('/:id', assignmentController.deleteAssignment.bind(assignmentController));

// POST /api/assignments/:id/approve - Approve assignment
router.post('/:id/approve', assignmentController.approveAssignment.bind(assignmentController));

// POST /api/assignments/:id/complete - Complete assignment
router.post('/:id/complete', assignmentController.completeAssignment.bind(assignmentController));

// POST /api/assignments/:id/cancel - Cancel assignment
router.post('/:id/cancel', assignmentController.cancelAssignment.bind(assignmentController));

export default router;
