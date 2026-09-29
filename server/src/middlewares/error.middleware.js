import { AppError } from '../utils/errors.js';
import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err instanceof AppError ? err.statusCode : (err.statusCode || 500);
  const code = err instanceof AppError ? err.code : (err.code || 'INTERNAL_ERROR');
  const message = err.message || 'An unexpected error occurred';
  const details = err.details || null;

  // Log error (avoid logging secrets or tokens)
  if (statusCode >= 500) {
    console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
    },
  });
}
