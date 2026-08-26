/**
 * middleware/errorHandler.middleware.ts
 * -----------------------------------------------------------------------------
 * The single place that turns any thrown error into an HTTP response.
 * Every route handler can just `throw new AppError(...)` (or let an
 * unexpected error bubble up) and this middleware formats the response —
 * routes never need their own try/catch-and-format boilerplate.
 *
 * Must be registered LAST in app.ts, after all routes.
 * -----------------------------------------------------------------------------
 */

import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { isProduction } from "../config/env";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const appError =
    err instanceof AppError ? err : new AppError(err instanceof Error ? err.message : "Internal server error", 500);

  logger.error(`${req.method} ${req.path} -> ${appError.statusCode}`, {
    message: appError.message,
  });

  res.status(appError.statusCode).json({
    error: appError.message,
    // Stack traces are only useful (and only safe) to expose in development.
    ...(isProduction ? {} : { stack: appError.stack }),
  });
}
