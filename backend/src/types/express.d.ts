/**
 * types/express.d.ts
 * -----------------------------------------------------------------------------
 * Augments Express's Request type so `req.sessionToken` (set by
 * middleware/auth.middleware.ts) is recognized by TypeScript everywhere else.
 * -----------------------------------------------------------------------------
 */

declare namespace Express {
  export interface Request {
    sessionToken?: string;
  }
}
