/**
 * models/thread.model.ts
 * -----------------------------------------------------------------------------
 * A "Thread" = one conversation in the sidebar, exactly like Claude's chat
 * history. Each Thread document embeds its own list of "turns" — one turn
 * per user task sent in that thread, holding everything the agent chain
 * produced for it.
 * -----------------------------------------------------------------------------
 */

import { Schema, model, Document } from "mongoose";
import { AgentRole, TaskType } from "../types/agent.types";
import { ProviderName } from "../types/provider.types";

interface AgentConfigSubdoc {
  role: AgentRole;
  provider: ProviderName;
  model: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

interface AgentMessageSubdoc {
  role: AgentRole;
  provider: ProviderName;
  model: string;
  content: string;
  round: number;
  timestamp: string;
}

export interface ThreadTurnSubdoc {
  id: string;
  task: string;
  taskType: TaskType;
  agents: AgentConfigSubdoc[];
  messages: AgentMessageSubdoc[];
  finalResult: string;
  image?: string;
  createdAt: string;
}

export interface ThreadDocument extends Document {
  title: string;
  createdAt: string;
  updatedAt: string;
  turns: ThreadTurnSubdoc[];
}

const agentRoles = ["creator", "reviewer", "critic", "optimizer", "finalizer"];
const providerNames = ["gemini", "nvidia", "qwen", "openrouter", "deepseek", "grok", "groq"];
const taskTypes = ["coding", "prompt_engineering", "image_prompt", "video_prompt", "study_research", "general"];

const agentConfigSchema = new Schema<AgentConfigSubdoc>(
  {
    role: { type: String, enum: agentRoles, required: true },
    provider: { type: String, enum: providerNames, required: true },
    model: { type: String, required: true },
    systemPrompt: { type: String, required: true },
    temperature: { type: Number, required: false },
    maxTokens: { type: Number, required: false },
  },
  { _id: false }
);

const agentMessageSchema = new Schema<AgentMessageSubdoc>(
  {
    role: { type: String, enum: agentRoles, required: true },
    provider: { type: String, enum: providerNames, required: true },
    model: { type: String, required: true },
    content: { type: String, required: true },
    round: { type: Number, required: true },
    timestamp: { type: String, required: true },
  },
  { _id: false }
);

const threadTurnSchema = new Schema<ThreadTurnSubdoc>(
  {
    id: { type: String, required: true },
    task: { type: String, required: true },
    taskType: { type: String, enum: taskTypes, required: true },
    agents: { type: [agentConfigSchema], required: true },
    messages: { type: [agentMessageSchema], required: true },
    finalResult: { type: String, required: true },
    image: { type: String, required: false },
    createdAt: { type: String, required: true },
  },
  { _id: false }
);

const threadSchema = new Schema<ThreadDocument>(
  {
    title: { type: String, required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true, index: true },
    turns: { type: [threadTurnSchema], required: true, default: [] },
  },
  { collection: "threads" }
);

export const ThreadModel = model<ThreadDocument>("Thread", threadSchema);
