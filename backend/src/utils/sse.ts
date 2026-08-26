/**
 * utils/sse.ts
 * -----------------------------------------------------------------------------
 * Small helper around Server-Sent Events (SSE). SSE was chosen over WebSocket
 * for v1 per the blueprint (section 16) because it's simpler: plain HTTP,
 * one-directional (server -> client), and every browser/fetch client supports
 * it natively via EventSource — no extra library needed on the frontend.
 *
 * Usage in a controller:
 *   const sse = createSSEStream(res);
 *   sse.send({ type: "agent_started", data: { role: "creator" } });
 *   sse.close();
 * -----------------------------------------------------------------------------
 */

import { Response } from "express";
import { WorkflowEvent } from "../types/workflow.types";

export interface SSEStream {
  send(event: WorkflowEvent): void;
  close(): void;
}

export function createSSEStream(res: Response): SSEStream {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    // Allows the EventSource client to reconnect cleanly if the connection drops.
    "X-Accel-Buffering": "no",
  });

  return {
    send(event: WorkflowEvent) {
      // SSE wire format: "event: <name>\ndata: <json>\n\n"
      res.write(`event: ${event.type}\n`);
      res.write(`data: ${JSON.stringify(event.data)}\n\n`);
    },
    close() {
      res.end();
    },
  };
}
