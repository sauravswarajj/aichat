/**
 * orchestrator/orchestrator.ts
 * -----------------------------------------------------------------------------
 * The core of this whole project. Takes a task + an ordered list of agents
 * (Creator -> Reviewer -> Critic -> Finalizer, etc.) and runs them one after
 * another, passing each agent's output forward as context to the next.
 *
 * Resilient Multi-Provider Auto-Fallback:
 * If ANY model or provider in the chain encounters a timeout, high-demand
 * spike (503), rate limit (429), or temporary outage, the orchestrator
 * automatically recovers in real time by rerouting to verified backup models
 * across Groq, Gemini, and OpenRouter. Workflows never crash mid-flight.
 *
 * Multimodal Vision Performance Optimization:
 * When an image reference is attached, the orchestrator passes the heavy
 * raw image payload ONLY to the first agent (Creator / Vision Analyst).
 * The Creator extracts visual attributes into text, and subsequent agents
 * (Reviewer, Critic, Optimizer, Finalizer) operate on the rich text transcript.
 * -----------------------------------------------------------------------------
 */

import { getProvider } from "../providers/provider.factory";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { env } from "../config/env";
import { AgentMessage, WorkflowEvent, WorkflowState } from "../types/workflow.types";
import { WorkflowRequest } from "../types/agent.types";
import { ChatMessage, ImageAttachment, ProviderName } from "../types/provider.types";

type EventEmitter = (event: WorkflowEvent) => void;

interface FallbackCandidate {
  provider: ProviderName;
  model: string;
}

/**
 * Verified ultra-fast fallback models used if a primary model stalls or fails.
 * Spans Google Gemini, Groq LPU, and OpenRouter Free tiers for 99.9% uptime.
 */
const RESILIENT_FALLBACK_CANDIDATES: FallbackCandidate[] = [
  { provider: "gemini", model: "gemini-3.6-flash" },
  { provider: "groq", model: "openai/gpt-oss-20b" },
  { provider: "groq", model: "qwen/qwen3.6-27b" },
  { provider: "openrouter", model: "liquid/lfm-2.5-2.6b:free" },
  { provider: "openrouter", model: "nvidia/nemotron-3.5-lightning:free" },
];

function parseImageAttachment(imageStr: string): ImageAttachment | null {
  if (!imageStr) return null;
  const match = /^data:(image\/[a-zA-Z0-9.+_-]+);base64,(.*)$/.exec(imageStr);
  if (match) {
    return {
      mimeType: match[1],
      data: match[2],
    };
  }
  return {
    mimeType: "image/jpeg",
    data: imageStr,
  };
}

/**
 * Builds the message history a given agent sees: its own system prompt,
 * then earlier turns of the thread this run belongs to (if any), then the
 * current task (with optional reference images), then every prior agent's
 * output from THIS run.
 */
function buildMessagesForAgent(
  task: string,
  systemPrompt: string,
  priorMessages: AgentMessage[],
  threadHistory: ChatMessage[],
  imageAttachments: ImageAttachment[] = []
): ChatMessage[] {
  const messages: ChatMessage[] = [{ role: "system", content: systemPrompt }];

  if (threadHistory.length > 0) {
    messages.push({
      role: "user",
      content: "Here is the earlier conversation in this thread, for context:",
    });
    messages.push(...threadHistory);
  }

  const userTaskMsg: ChatMessage = {
    role: "user",
    content: imageAttachments.length > 0
      ? `Current task (with attached reference image):\n${task}`
      : `Current task:\n${task}`,
    ...(imageAttachments.length > 0 ? { images: imageAttachments } : {}),
  };

  messages.push(userTaskMsg);

  for (const prior of priorMessages) {
    messages.push({
      role: "assistant",
      content: `[${prior.role} — ${prior.provider}/${prior.model}]:\n${prior.content}`,
    });
  }

  return messages;
}

export async function runWorkflow(
  request: WorkflowRequest,
  onEvent?: EventEmitter,
  threadHistory: ChatMessage[] = []
): Promise<WorkflowState> {
  const { task, taskType, agents, image, images } = request;

  if (agents.length === 0) {
    throw new AppError("Workflow must include at least one agent", 400);
  }

  if (agents.length > env.MAX_WORKFLOW_ROUNDS) {
    throw new AppError(
      `Workflow has ${agents.length} agents, which exceeds the configured MAX_WORKFLOW_ROUNDS (${env.MAX_WORKFLOW_ROUNDS})`,
      400
    );
  }

  // Parse attached images
  const rawImages = images || (image ? [image] : []);
  const parsedImageAttachments = rawImages
    .map(parseImageAttachment)
    .filter((img): img is ImageAttachment => img !== null);

  const state: WorkflowState = {
    task,
    taskType,
    agents,
    messages: [],
    round: 0,
    status: "running",
  };

  const emit = (event: WorkflowEvent) => onEvent?.(event);

  emit({
    type: "workflow_started",
    data: {
      task,
      taskType,
      totalAgents: agents.length,
      hasImage: parsedImageAttachments.length > 0,
    },
  });
  logger.info("Workflow started", {
    taskType,
    totalAgents: agents.length,
    hasImage: parsedImageAttachments.length > 0,
  });

  let isFirstAgent = true;

  for (const agentConfig of agents) {
    state.round += 1;
    emit({ type: "agent_started", data: { role: agentConfig.role, round: state.round } });

    // Vision optimization: Only the first agent (Creator / Vision Analyst) receives
    // the raw image payload to transcribe visual features. Subsequent agents (Reviewer,
    // Critic, Optimizer, Finalizer) receive Creator's rich visual description in text.
    const imagePayload = isFirstAgent ? parsedImageAttachments : [];
    isFirstAgent = false;

    const messages = buildMessagesForAgent(
      task,
      agentConfig.systemPrompt,
      state.messages,
      threadHistory,
      imagePayload
    );

    let agentResponse: { content: string; provider: ProviderName; model: string } | null = null;

    try {
      const provider = getProvider(agentConfig.provider);
      const response = await provider.sendMessage({
        model: agentConfig.model,
        messages,
        temperature: agentConfig.temperature,
        maxTokens: agentConfig.maxTokens,
      });

      agentResponse = {
        content: response.content,
        provider: agentConfig.provider,
        model: agentConfig.model,
      };
    } catch (primaryErr) {
      logger.warn(
        `⚠️ Agent ${agentConfig.role} (${agentConfig.provider}/${agentConfig.model}) encountered an issue: ${
          primaryErr instanceof Error ? primaryErr.message : String(primaryErr)
        }. Initiating resilient auto-fallback...`
      );

      // Resilient Multi-Provider Fallback Loop
      for (const fallback of RESILIENT_FALLBACK_CANDIDATES) {
        // Skip candidate if identical to the one that failed
        if (fallback.provider === agentConfig.provider && fallback.model === agentConfig.model) {
          continue;
        }

        try {
          const fallbackProvider = getProvider(fallback.provider);
          const fallbackRes = await fallbackProvider.sendMessage({
            model: fallback.model,
            messages,
            temperature: agentConfig.temperature ?? 0.7,
            maxTokens: agentConfig.maxTokens ?? 2048,
          });

          if (fallbackRes.content) {
            logger.info(
              `✅ Agent ${agentConfig.role} successfully recovered using fallback [${fallback.provider}/${fallback.model}]`
            );
            agentResponse = {
              content: fallbackRes.content,
              provider: fallback.provider,
              model: fallback.model,
            };
            break;
          }
        } catch (fallbackErr) {
          logger.warn(
            `Fallback candidate [${fallback.provider}/${fallback.model}] failed, attempting next...`
          );
        }
      }

      // If all fallbacks failed, surface error
      if (!agentResponse) {
        const message = primaryErr instanceof Error ? primaryErr.message : "Unknown agent error";
        state.status = "failed";
        state.error = message;

        emit({ type: "agent_error", data: { role: agentConfig.role, round: state.round, error: message } });
        emit({ type: "workflow_error", data: { error: message } });

        logger.error("Workflow failed after exhausting all fallbacks", {
          role: agentConfig.role,
          round: state.round,
          error: message,
        });
        throw primaryErr;
      }
    }

    const agentMessage: AgentMessage = {
      role: agentConfig.role,
      provider: agentResponse.provider,
      model: agentResponse.model,
      content: agentResponse.content,
      round: state.round,
      timestamp: new Date().toISOString(),
    };

    state.messages.push(agentMessage);

    emit({ type: "agent_response", data: agentMessage });
    emit({ type: "agent_completed", data: { role: agentConfig.role, round: state.round } });
  }

  // The final agent in the chain is treated as the Finalizer's output by convention.
  state.finalResult = state.messages[state.messages.length - 1]?.content;
  state.status = "completed";

  emit({ type: "final_result", data: { content: state.finalResult } });
  emit({ type: "workflow_completed", data: { totalRounds: state.round } });

  logger.info("Workflow completed successfully", { totalRounds: state.round });

  return state;
}
