import { Router } from 'express';
import { fileController } from './file.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { uploadMiddleware } from '../../middleware/upload.middleware';

const router = Router();

// Anonymous upload route (no auth required)
router.post(
  '/upload-anonymous',
  uploadMiddleware.single('file'),
  (req, res, next) => fileController.uploadFileAnonymous(req, res, next)
);

// All other file routes require authentication
router.use(authMiddleware);

router.get('/', (req, res, next) => fileController.listFiles(req, res, next));
router.post(
  '/upload',
  uploadMiddleware.single('file'),
  (req, res, next) => fileController.uploadFile(req, res, next)
);
router.post('/:id/claim', (req, res, next) => fileController.claimFile(req, res, next));
router.get('/:id', (req, res, next) => fileController.getFile(req, res, next));
router.delete('/:id', (req, res, next) => fileController.deleteFile(req, res, next));

export default router;

