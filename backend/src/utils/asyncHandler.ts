/**
 * utils/asyncHandler.ts
 * -----------------------------------------------------------------------------
 * Express (v4) does not automatically catch errors thrown inside an async
 * route handler — an unhandled rejection would crash the process instead of
 * reaching errorHandler.middleware.ts. Wrapping every async controller with
 * this function fixes that with zero try/catch boilerplate per route.
 * -----------------------------------------------------------------------------
 */

import { NextFunction, Request, Response } from "express";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
