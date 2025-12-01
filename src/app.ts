import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import fileRoutes from './modules/files/file.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { sendError } from './utils/responses';

const app: Express = express();

// CORS middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/files', fileRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  sendError(res, 'Route not found', 404);
});

// Error handler (must be last)
app.use(errorMiddleware);

export default app;

