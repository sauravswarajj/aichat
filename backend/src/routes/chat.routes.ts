/**
 * routes/chat.routes.ts
 * -----------------------------------------------------------------------------
 * POST /api/chat         Run a workflow, get one JSON response at the end.
 * POST /api/chat/stream   Run a workflow, get real-time SSE events as agents run.
 *
 * Both routes share the same validation middleware, since they accept the
 * exact same request body shape (WorkflowRequest) — only the response
 * mechanism differs.
 * -----------------------------------------------------------------------------
 */

import { Router } from "express";
import { runWorkflowJSON, runWorkflowSSE } from "../controllers/chat.controller";
import { validateBody } from "../middleware/validate.middleware";
import { workflowRequestSchema } from "../validators/chat.validator";
import { asyncHandler } from "../utils/asyncHandler";

export const chatRouter = Router();

chatRouter.post("/", validateBody(workflowRequestSchema), asyncHandler(runWorkflowJSON));
chatRouter.post("/stream", validateBody(workflowRequestSchema), asyncHandler(runWorkflowSSE));
