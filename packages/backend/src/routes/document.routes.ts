import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';

const router = Router();
const documentController = new DocumentController();

// Document operations
router.post('/upload', documentController.upload);
router.get('/:id', documentController.getById);
router.get('/:id/download', documentController.download);
router.put('/:id', documentController.update);
router.delete('/:id', documentController.delete);

export default router;
