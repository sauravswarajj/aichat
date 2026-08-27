/**
 * controllers/chat.controller.ts
 * -----------------------------------------------------------------------------
 * Two ways to run a workflow, both calling the SAME orchestrator, and both
 * now thread-aware and vision-aware:
 *
 *  - runWorkflowJSON  -> POST /api/chat        Simple request/response.
 *  - runWorkflowSSE   -> POST /api/chat/stream Real-time streaming, for the
 *                        frontend's live "AI conversation" view.
 * -----------------------------------------------------------------------------
 */

import { Request, Response } from "express";
import { runWorkflow } from "../orchestrator/orchestrator";
import { createSSEStream } from "../utils/sse";
import { ValidatedWorkflowRequest } from "../validators/chat.validator";
import { logger } from "../utils/logger";
import * as threadStore from "../utils/threadStore";

export async function runWorkflowJSON(req: Request, res: Response) {
  const workflowRequest = req.body as ValidatedWorkflowRequest;

  const thread = workflowRequest.threadId
    ? await threadStore.getThread(workflowRequest.threadId)
    : await threadStore.createThread();

  const threadHistory = await threadStore.buildThreadHistory(thread.id);

  const result = await runWorkflow(workflowRequest, undefined, threadHistory);

  await threadStore.appendTurn(thread.id, {
    task: workflowRequest.task,
    taskType: workflowRequest.taskType,
    agents: workflowRequest.agents,
    messages: result.messages,
    finalResult: result.finalResult ?? "",
    image: workflowRequest.image,
    createdAt: new Date().toISOString(),
  });

  res.status(200).json({ ...result, threadId: thread.id });
}

export async function runWorkflowSSE(req: Request, res: Response) {
  const workflowRequest = req.body as ValidatedWorkflowRequest;
  const sse = createSSEStream(res);

  // If the client disconnects early, stop wasting provider calls/tokens.
  let clientDisconnected = false;
  req.on("close", () => {
    clientDisconnected = true;
  });

  try {
    const thread = workflowRequest.threadId
      ? await threadStore.getThread(workflowRequest.threadId)
      : await threadStore.createThread();

    // Sent first so the frontend can immediately show/update the sidebar
    // entry for this thread, even before the first agent responds.
    sse.send({ type: "thread_info", data: { threadId: thread.id } });

    const threadHistory = await threadStore.buildThreadHistory(thread.id);

    const result = await runWorkflow(
      workflowRequest,
      (event) => {
        if (!clientDisconnected) sse.send(event);
      },
      threadHistory
    );

    await threadStore.appendTurn(thread.id, {
      task: workflowRequest.task,
      taskType: workflowRequest.taskType,
      agents: workflowRequest.agents,
      messages: result.messages,
      finalResult: result.finalResult ?? "",
      image: workflowRequest.image,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    // The orchestrator already emitted a "workflow_error" event before
    // throwing, so here we just log and make sure the stream is closed.
    logger.error("SSE workflow run failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  } finally {
    sse.close();
  }
}
