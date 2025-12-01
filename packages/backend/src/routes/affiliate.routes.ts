/**
 * Affiliate Routes
 * API routes for affiliate operations
 */

import { Router } from 'express';
import { affiliateController } from '../controllers/affiliate.controller';

const router = Router();

// GET /api/affiliates - Get all affiliates
router.get('/', affiliateController.getAllAffiliates.bind(affiliateController));

// GET /api/affiliates/:id - Get affiliate by ID
router.get('/:id', affiliateController.getAffiliateById.bind(affiliateController));

// POST /api/affiliates - Create new affiliate
router.post('/', affiliateController.createAffiliate.bind(affiliateController));

// PUT /api/affiliates/:id - Update affiliate
router.put('/:id', affiliateController.updateAffiliate.bind(affiliateController));

// DELETE /api/affiliates/:id - Delete affiliate
router.delete('/:id', affiliateController.deleteAffiliate.bind(affiliateController));

// POST /api/affiliates/:id/approve - Approve affiliate
router.post('/:id/approve', affiliateController.approveAffiliate.bind(affiliateController));

// POST /api/affiliates/:id/reject - Reject affiliate
router.post('/:id/reject', affiliateController.rejectAffiliate.bind(affiliateController));

// PATCH /api/affiliates/:id/capacity - Update affiliate capacity
router.patch('/:id/capacity', affiliateController.updateCapacity.bind(affiliateController));

export default router;
