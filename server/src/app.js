import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { AppError } from './utils/errors.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// 1. Global Middlewares
app.use(
  cors({
    origin: 'http://localhost:3000', // Next.js frontend URL
    credentials: true,               // Allow sending cookies across domains
  })
);
app.use(express.json());
app.use(cookieParser());

// 2. Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 3. API Route Mounts (Prefixing with /api/v1)
app.use('/api/v1', apiRoutes);

// 4. Catch-all 404 Not Found Handler
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND'));
});

// 5. Centralized Error-Handling Middleware
app.use(errorHandler);

export default app;