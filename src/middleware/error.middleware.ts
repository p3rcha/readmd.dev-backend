import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responses';
import { logger } from '../config/logger';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Error:', err.message, err.stack);

  if (res.headersSent) {
    return next(err);
  }

  // Determine status code based on error type
  let statusCode = (err as { statusCode?: number }).statusCode || 500;
  const message = err.message || 'Internal server error';

  // Handle authentication errors
  if (message.includes('Invalid email or password') || 
      message.includes('User not authenticated') ||
      message.includes('not authenticated')) {
    statusCode = 401;
  }
  // Handle not found errors
  else if (message.includes('not found') || message.includes('Not found')) {
    statusCode = 404;
  }
  // Handle validation/duplicate errors
  else if (message.includes('already exists') || 
           message.includes('duplicate') ||
           message.includes('Invalid')) {
    statusCode = 400;
  }
  // Handle unauthorized access (different from authentication)
  else if (message.includes('Unauthorized') || message.includes('Forbidden')) {
    statusCode = 403;
  }

  sendError(res, message, statusCode);
}

