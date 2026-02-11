import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types/api.types';

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err.stack);

  const errorResponse: ErrorResponse = {
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(
  req: Request,
  res: Response
): void {
  const errorResponse: ErrorResponse = {
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  res.status(404).json(errorResponse);
}