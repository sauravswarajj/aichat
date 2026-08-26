/**
 * middleware/loginRateLimit.middleware.ts
 * -----------------------------------------------------------------------------
 * Since there's exactly one valid account and no lockout mechanism, the login
 * endpoint is the single door an attacker would try to brute-force if they
 * ever found your deployed URL. This limits login ATTEMPTS (not general API
 * usage) per IP, independent of whether you add broader API rate limiting later.
 * -----------------------------------------------------------------------------
 */

import rateLimit from "express-rate-limit";

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in a few minutes." },
});
