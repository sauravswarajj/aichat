/**
 * types/agent.types.ts
 * -----------------------------------------------------------------------------
 * An "Agent" = one Role + one Provider + one Model, per the project blueprint's
 * core principle: role and model are independent and configurable, and the
 * same underlying model can serve different roles in different workflows.
 * -----------------------------------------------------------------------------
 */

import { ProviderName } from "./provider.types";

/** The job this agent performs in the pipeline. Extend freely as needed. */
export type AgentRole =
  | "creator"
  | "reviewer"
  | "critic"
  | "optimizer"
  | "finalizer";

/** One configured step in a workflow — this is what the frontend sends per agent. */
export interface AgentConfig {
  role: AgentRole;
  provider: ProviderName;
  model: string;
  /** Instructions that define this agent's specific responsibility (its "system prompt"). */
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

/** The task categories from the blueprint's task-type dropdown. */
export type TaskType =
  | "coding"
  | "prompt_engineering"
  | "image_prompt"
  | "video_prompt"
  | "study_research"
  | "general";

/** The full request body the frontend sends to start a workflow run. */
export interface WorkflowRequest {
  task: string;
  taskType: TaskType;
  agents: AgentConfig[];
  /**
   * Optional — send the id of an existing thread to continue that
   * conversation (prior turns are fed back to the agents as context).
   * Omit it to start a brand-new thread; the response will include the
   * newly created thread's id.
   */
  threadId?: string;
}
