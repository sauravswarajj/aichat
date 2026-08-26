/**
 * types/workflow.types.ts
 * -----------------------------------------------------------------------------
 * Describes the in-memory state of one workflow run, and the exact set of
 * real-time events the orchestrator emits while running it (see blueprint
 * doc section 16 — Real-Time Streaming — for the original event list).
 *
 * V1 has no database (per blueprint section 18), so workflow state lives only
 * in memory for the lifetime of a single request.
 * -----------------------------------------------------------------------------
 */

import { AgentConfig, TaskType } from "./agent.types";
import { ProviderName } from "./provider.types";

export type WorkflowStatus = "running" | "completed" | "failed";

/** One message produced by one agent during the run — this is what the
 *  frontend's "live conversation" panel renders. */
export interface AgentMessage {
  role: AgentConfig["role"];
  provider: ProviderName;
  model: string;
  content: string;
  round: number;
  timestamp: string;
}

/** The full state of one workflow run, mirroring blueprint section 17. */
export interface WorkflowState {
  task: string;
  taskType: TaskType;
  agents: AgentConfig[];
  messages: AgentMessage[];
  round: number;
  status: WorkflowStatus;
  finalResult?: string;
  error?: string;
}

/**
 * SSE event names streamed to the frontend, exactly matching the blueprint's
 * event list so the frontend contract stays predictable. "thread_info" is
 * one addition beyond the original blueprint list — sent once, first, so
 * the frontend knows which thread this run belongs to (important for a
 * brand-new chat, where the thread didn't exist until this request created it).
 */
export type WorkflowEventType =
  | "thread_info"
  | "workflow_started"
  | "agent_started"
  | "agent_response"
  | "agent_completed"
  | "agent_error"
  | "final_result"
  | "workflow_completed"
  | "workflow_error";

export interface WorkflowEvent {
  type: WorkflowEventType;
  data: unknown;
}
