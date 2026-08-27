/**
 * validators/chat.validator.ts
 * -----------------------------------------------------------------------------
 * Validates the shape of every incoming workflow request BEFORE it reaches
 * the orchestrator. Rejecting bad input here (with a clear 400 message)
 * means the orchestrator and provider adapters can trust their input types
 * and never need to defensively re-check them.
 * -----------------------------------------------------------------------------
 */

import { z } from "zod";

const providerNameSchema = z.enum(["gemini", "nvidia", "qwen", "openrouter", "deepseek", "grok", "groq"]);

const agentRoleSchema = z.enum(["creator", "reviewer", "critic", "optimizer", "finalizer"]);

const taskTypeSchema = z.enum([
  "coding",
  "prompt_engineering",
  "image_prompt",
  "video_prompt",
  "study_research",
  "general",
]);

const agentConfigSchema = z.object({
  role: agentRoleSchema,
  provider: providerNameSchema,
  model: z.string().min(1, "model is required"),
  systemPrompt: z.string().min(1, "systemPrompt is required"),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
});

export const workflowRequestSchema = z.object({
  task: z.string().min(1, "task is required"),
  taskType: taskTypeSchema,
  agents: z.array(agentConfigSchema).min(1, "at least one agent is required"),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  /** Optional — continue an existing thread. Omit to auto-create a new one. */
  threadId: z.string().min(1).optional(),
});

export type ValidatedWorkflowRequest = z.infer<typeof workflowRequestSchema>;
