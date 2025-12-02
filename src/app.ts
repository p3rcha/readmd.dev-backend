import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import fileRoutes from './modules/files/file.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { sendError } from './utils/responses';

const app: Express = express();

// CORS middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

// Also allow Vercel preview deployments
const isAllowedOrigin = (origin: string): boolean => {
  // Check exact matches
  if (allowedOrigins.includes(origin)) return true;
  
  // Allow all Vercel preview URLs for this project
  if (origin.includes('readmd-dev-frontend') && origin.endsWith('.vercel.app')) {
    return true;
  }
  
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
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

