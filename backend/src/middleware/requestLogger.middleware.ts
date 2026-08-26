/**
 * middleware/requestLogger.middleware.ts
 * -----------------------------------------------------------------------------
 * Logs every incoming request's method, path, and response time. Kept as
 * our own middleware (instead of pulling in morgan) so the log format
 * matches our own logger util.
 * -----------------------------------------------------------------------------
 */

import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs}ms)`);
  });

  next();
}
