/**
 * Alert Routes
 * API routes for alert operations
 */

import { Router } from 'express';
import { alertController } from '../controllers/alert.controller';

const router = Router();

// GET /api/alerts - Get all alerts
router.get('/', alertController.getAllAlerts.bind(alertController));

// GET /api/alerts/unread - Get unread alerts
router.get('/unread', alertController.getUnreadAlerts.bind(alertController));

// GET /api/alerts/critical - Get critical alerts
router.get('/critical', alertController.getCriticalAlerts.bind(alertController));

// GET /api/alerts/stats - Get alert statistics
router.get('/stats', alertController.getStats.bind(alertController));

// GET /api/alerts/:id - Get alert by ID
router.get('/:id', alertController.getAlertById.bind(alertController));

// POST /api/alerts - Create new alert
router.post('/', alertController.createAlert.bind(alertController));

// PATCH /api/alerts/:id/read - Mark alert as read
router.patch('/:id/read', alertController.markAsRead.bind(alertController));

// POST /api/alerts/:id/resolve - Resolve alert
router.post('/:id/resolve', alertController.resolveAlert.bind(alertController));

// POST /api/alerts/:id/action - Take action on alert
router.post('/:id/action', alertController.takeAction.bind(alertController));

// POST /api/alerts/:id/escalate - Escalate alert
router.post('/:id/escalate', alertController.escalateAlert.bind(alertController));

export default router;
