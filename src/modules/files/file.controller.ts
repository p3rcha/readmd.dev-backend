import { Request, Response, NextFunction } from 'express';
import { fileService } from './file.service';
import { sendSuccess, sendError } from '../../utils/responses';
import { FileVisibility } from './file.types';

export class FileController {
  async listFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      // Extract query parameters and build params object
      const params: {
        visibility?: 'private' | 'unlisted' | 'public';
        sort?: 'createdAt' | 'filename' | 'sizeBytes';
        order?: 'asc' | 'desc';
        page?: number;
        limit?: number;
        search?: string;
      } = {};

      if (req.query.visibility && ['private', 'unlisted', 'public'].includes(req.query.visibility as string)) {
        params.visibility = req.query.visibility as 'private' | 'unlisted' | 'public';
      }
      if (req.query.sort && ['createdAt', 'filename', 'sizeBytes'].includes(req.query.sort as string)) {
        params.sort = req.query.sort as 'createdAt' | 'filename' | 'sizeBytes';
      }
      if (req.query.order && ['asc', 'desc'].includes(req.query.order as string)) {
        params.order = req.query.order as 'asc' | 'desc';
      }
      if (req.query.page) {
        const page = parseInt(req.query.page as string, 10);
        if (!isNaN(page) && page > 0) {
          params.page = page;
        }
      }
      if (req.query.limit) {
        const limit = parseInt(req.query.limit as string, 10);
        if (!isNaN(limit) && limit > 0) {
          params.limit = limit;
        }
      }
      if (req.query.search && typeof req.query.search === 'string') {
        params.search = req.query.search;
      }

      const result = await fileService.listFiles(req.user.id, params);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const { id } = req.params;
      if (!id) {
        sendError(res, 'File ID is required', 400);
        return;
      }

      const file = await fileService.getFileById(id, req.user.id);
      sendSuccess(res, file);
    } catch (error) {
      next(error);
    }
  }

  async uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      if (!req.file) {
        sendError(res, 'No file uploaded', 400);
        return;
      }

      const content = req.file.buffer.toString('utf8');
      const filename = req.file.originalname;
      const visibility = (req.body.visibility as FileVisibility) || 'private';

      // Validate visibility
      if (!['private', 'unlisted', 'public'].includes(visibility)) {
        sendError(res, 'Invalid visibility value', 400);
        return;
      }

      const file = await fileService.uploadFile(req.user.id, filename, content, visibility);
      sendSuccess(res, file, 'File uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async uploadFileAnonymous(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        sendError(res, 'No file uploaded', 400);
        return;
      }

      const content = req.file.buffer.toString('utf8');
      const filename = req.file.originalname;
      const visibility = (req.body.visibility as FileVisibility) || 'private';

      // Validate visibility
      if (!['private', 'unlisted', 'public'].includes(visibility)) {
        sendError(res, 'Invalid visibility value', 400);
        return;
      }

      const file = await fileService.uploadFileAnonymous(filename, content, visibility);
      sendSuccess(res, file, 'File uploaded successfully. Please login to claim ownership.', 201);
    } catch (error) {
      next(error);
    }
  }

  async claimFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const { id } = req.params;
      if (!id) {
        sendError(res, 'File ID is required', 400);
        return;
      }

      const file = await fileService.claimFile(id, req.user.id);
      sendSuccess(res, file, 'File claimed successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const { id } = req.params;
      if (!id) {
        sendError(res, 'File ID is required', 400);
        return;
      }

      await fileService.deleteFile(id, req.user.id);
      sendSuccess(res, null, 'File deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const fileController = new FileController();

