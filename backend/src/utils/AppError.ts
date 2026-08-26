/**
 * utils/AppError.ts
 * -----------------------------------------------------------------------------
 * A single custom error class used everywhere instead of throwing plain
 * strings/Errors. Carries an HTTP status code so the central error handler
 * middleware (middleware/errorHandler.middleware.ts) knows what to send back.
 * -----------------------------------------------------------------------------
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
