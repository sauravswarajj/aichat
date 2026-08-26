/**
 * routes/index.ts
 * -----------------------------------------------------------------------------
 * Mounts every feature's router under /api. When you add a new feature
 * (e.g. routes/history.routes.ts in a later phase), register it here —
 * app.ts only ever imports this one file.
 *
 * AUTH NOTE: /health stays public (so uptime checks work without a token).
 * /auth/login is public by necessity; /auth/logout, /auth/logout-all, and
 * /auth/me require a valid session (enforced inside auth.routes.ts itself).
 * /chat and /threads are protected here with requireAuth — both spend your
 * provider API quota or expose your conversation history, so both need a
 * valid session token.
 * -----------------------------------------------------------------------------
 */

import { Router } from "express";
import { chatRouter } from "./chat.routes";
import { healthRouter } from "./health.routes";
import { authRouter } from "./auth.routes";
import { threadRouter } from "./thread.routes";
import { requireAuth } from "../middleware/auth.middleware";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/chat", requireAuth, chatRouter);
apiRouter.use("/threads", requireAuth, threadRouter);
