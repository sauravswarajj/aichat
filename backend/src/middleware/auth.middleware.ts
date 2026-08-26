/**
 * middleware/auth.middleware.ts
 * -----------------------------------------------------------------------------
 * Protects any route it's applied to. Expects:
 *   Authorization: Bearer <token>
 *
 * Checks the token against the session store (utils/sessionStore.ts, backed
 * by MongoDB) — NOT against any JWT signature — so a token that was revoked
 * (via logout or logout-everywhere) stops working immediately, on its very
 * next request. Wrapped in asyncHandler so a database error during the check
 * is forwarded to errorHandler.middleware.ts instead of crashing the process.
 * -----------------------------------------------------------------------------
 */

import { NextFunction, Request, Response } from "express";
import { isValidSession } from "../utils/sessionStore";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Not authenticated — missing or malformed Authorization header", 401));
  }

  const token = header.slice("Bearer ".length).trim();

  if (!token || !(await isValidSession(token))) {
    return next(new AppError("Not authenticated — session is invalid or has been logged out", 401));
  }

  // Attach the token so downstream handlers (e.g. logout-this-device) can use it
  // without re-parsing the header.
  req.sessionToken = token;
  next();
});
