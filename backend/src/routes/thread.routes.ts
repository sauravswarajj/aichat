/**
 * routes/thread.routes.ts
 * -----------------------------------------------------------------------------
 * GET    /api/threads       Sidebar list.
 * GET    /api/threads/:id    Full thread (reopen to continue a chat).
 * POST   /api/threads        Create a new empty thread ("New Chat" button).
 * PATCH  /api/threads/:id    Rename a thread.
 * DELETE /api/threads/:id    Delete a thread.
 *
 * All of these are mounted behind requireAuth in routes/index.ts.
 * -----------------------------------------------------------------------------
 */

import { Router } from "express";
import * as threadController from "../controllers/thread.controller";
import { validateBody } from "../middleware/validate.middleware";
import { createThreadSchema, renameThreadSchema } from "../validators/thread.validator";
import { asyncHandler } from "../utils/asyncHandler";

export const threadRouter = Router();

threadRouter.get("/", asyncHandler(threadController.list));
threadRouter.get("/:id", asyncHandler(threadController.get));
threadRouter.post("/", validateBody(createThreadSchema), asyncHandler(threadController.create));
threadRouter.patch("/:id", validateBody(renameThreadSchema), asyncHandler(threadController.rename));
threadRouter.delete("/:id", asyncHandler(threadController.remove));
