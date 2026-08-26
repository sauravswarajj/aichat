/**
 * routes/auth.routes.ts
 * -----------------------------------------------------------------------------
 * POST /api/auth/login       Public. Rate-limited. Returns a session token.
 * POST /api/auth/logout       Protected. Logs out THIS device only.
 * POST /api/auth/logout-all   Protected. Logs out EVERY device at once.
 * GET  /api/auth/me           Protected. Lets the frontend check login state.
 * -----------------------------------------------------------------------------
 */

import { Router } from "express";
import { login, logout, logoutAllDevices, me } from "../controllers/auth.controller";
import { validateBody } from "../middleware/validate.middleware";
import { loginRequestSchema } from "../validators/auth.validator";
import { requireAuth } from "../middleware/auth.middleware";
import { loginRateLimit } from "../middleware/loginRateLimit.middleware";
import { asyncHandler } from "../utils/asyncHandler";

export const authRouter = Router();

authRouter.post("/login", loginRateLimit, validateBody(loginRequestSchema), asyncHandler(login));
authRouter.post("/logout", requireAuth, asyncHandler(logout));
authRouter.post("/logout-all", requireAuth, asyncHandler(logoutAllDevices));
authRouter.get("/me", requireAuth, asyncHandler(me));
