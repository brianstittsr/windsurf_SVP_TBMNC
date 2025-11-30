import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';

const router = Router();
const customerController = new CustomerController();

// Customer CRUD operations
router.post('/', customerController.create);
router.get('/:id', customerController.getById);
router.put('/:id', customerController.update);
router.get('/', customerController.getAll);

// Customer-specific operations
router.get('/:id/stages', customerController.getStages);
router.get('/:id/progress', customerController.getProgress);
router.get('/:id/documents', customerController.getDocuments);

export default router;
