/**
 * api.types.ts
 * -----------------------------------------------------------------------------
 * Shared TypeScript contracts mirroring the backend API models and SSE events.
 * -----------------------------------------------------------------------------
 */

export type ProviderName =
  | "gemini"
  | "nvidia"
  | "qwen"
  | "openrouter"
  | "deepseek"
  | "grok";

export type AgentRole =
  | "creator"
  | "reviewer"
  | "critic"
  | "optimizer"
  | "finalizer";

export type TaskType =
  | "coding"
  | "prompt_engineering"
  | "image_prompt"
  | "video_prompt"
  | "study_research"
  | "general";

export interface AgentConfig {
  role: AgentRole;
  provider: ProviderName;
  model: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgentMessage {
  role: AgentRole;
  provider: ProviderName;
  model: string;
  content: string;
  round: number;
  timestamp: string;
}

export type WorkflowStatus = "idle" | "running" | "completed" | "failed";

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

export interface WorkflowRequest {
  task: string;
  taskType: TaskType;
  agents: AgentConfig[];
  threadId?: string;
}

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

export interface WorkflowEvent<T = unknown> {
  type: WorkflowEventType;
  data: T;
}

export interface ThreadTurn {
  id: string;
  task: string;
  taskType: TaskType;
  agents: AgentConfig[];
  messages: AgentMessage[];
  finalResult: string;
  createdAt: string;
}

export interface Thread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  turns: ThreadTurn[];
}

export interface ThreadSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  turnCount: number;
  preview: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  label?: string;
}

export interface LoginResponse {
  token: string;
}

export interface AuthMeResponse {
  authenticated: boolean;
}

export interface HealthResponse {
  status: string;
  uptimeSeconds: number;
  database: string;
  databaseConnected: boolean;
  timestamp: string;
}
