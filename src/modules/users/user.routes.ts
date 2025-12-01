import { Router } from 'express';
import { userController } from './user.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.get('/:id', authMiddleware, (req, res, next) => userController.getUserById(req, res, next));

export default router;

