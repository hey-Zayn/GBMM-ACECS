import { AppError } from '../utils/errors.js';

export function errorHandler(error, req, res, next) {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const code = error instanceof AppError ? error.code : 'INTERNAL_ERROR';
  const message = error instanceof AppError ? error.message : 'An unexpected error occurred';

  if (statusCode >= 500) {
    console.error('[Server Error]', {
      method: req.method,
      path: req.originalUrl,
      code,
      message,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(error.details ? { details: error.details } : {}),
    },
  });
}
