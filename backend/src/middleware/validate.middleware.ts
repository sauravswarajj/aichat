/**
 * middleware/validate.middleware.ts
 * -----------------------------------------------------------------------------
 * A generic factory: pass it a zod schema, get back Express middleware that
 * validates req.body and returns a clean 400 with field-level errors on
 * failure, or attaches the parsed/typed body as req.body on success.
 * -----------------------------------------------------------------------------
 */

import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
    }

    req.body = result.data;
    return next();
  };
}
