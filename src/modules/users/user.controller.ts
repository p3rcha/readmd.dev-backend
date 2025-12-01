import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { sendSuccess, sendError } from '../../utils/responses';

export class UserController {
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        sendError(res, 'User ID is required', 400);
        return;
      }

      const user = await userService.getUserById(id);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();

