/**
 * orchestrator/orchestrator.ts
 * -----------------------------------------------------------------------------
 * The core of this whole project. Takes a task + an ordered list of agents
 * (Creator -> Reviewer -> Critic -> Finalizer, etc.) and runs them one after
 * another, passing each agent's output forward as context to the next.
 *
 * Per blueprint: agents never call each other directly — the orchestrator is
 * the only thing that talks to providers, and it does so through the generic
 * AIProvider interface, so it never needs to know which provider is behind
 * any given agent.
 *
 * `onEvent` is an optional callback — pass it to get real-time progress
 * (used by the streaming controller); omit it for a simple non-streaming run
 * (used by the basic Phase-1 controller).
 *
 * `threadHistory` is optional — pass the prior turns of a chat thread (built
 * by utils/threadStore.ts's buildThreadHistory) to give every agent in this
 * run visibility into what was discussed earlier in that conversation. Omit
 * it for a one-off run with no thread.
 * -----------------------------------------------------------------------------
 */

import { getProvider } from "../providers/provider.factory";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { env } from "../config/env";
import { AgentMessage, WorkflowEvent, WorkflowState } from "../types/workflow.types";
import { WorkflowRequest } from "../types/agent.types";
import { ChatMessage } from "../types/provider.types";

type EventEmitter = (event: WorkflowEvent) => void;

/**
 * Builds the message history a given agent sees: its own system prompt,
 * then earlier turns of the thread this run belongs to (if any), then the
 * current task, then every prior agent's output from THIS run — so each
 * agent can build on both what came before it in this run AND what was
 * discussed earlier in the conversation.
 */
function buildMessagesForAgent(
  task: string,
  systemPrompt: string,
  priorMessages: AgentMessage[],
  threadHistory: ChatMessage[]
): ChatMessage[] {
  const messages: ChatMessage[] = [{ role: "system", content: systemPrompt }];

  if (threadHistory.length > 0) {
    messages.push({
      role: "user",
      content: "Here is the earlier conversation in this thread, for context:",
    });
    messages.push(...threadHistory);
  }

  messages.push({ role: "user", content: `Current task:\n${task}` });

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
  const { task, taskType, agents } = request;

  if (agents.length === 0) {
    throw new AppError("Workflow must include at least one agent", 400);
  }

  if (agents.length > env.MAX_WORKFLOW_ROUNDS) {
    throw new AppError(
      `Workflow has ${agents.length} agents, which exceeds the configured MAX_WORKFLOW_ROUNDS (${env.MAX_WORKFLOW_ROUNDS})`,
      400
    );
  }

  const state: WorkflowState = {
    task,
    taskType,
    agents,
    messages: [],
    round: 0,
    status: "running",
  };

  const emit = (event: WorkflowEvent) => onEvent?.(event);

  emit({ type: "workflow_started", data: { task, taskType, totalAgents: agents.length } });
  logger.info("Workflow started", { taskType, totalAgents: agents.length });

  for (const agentConfig of agents) {
    state.round += 1;
    emit({ type: "agent_started", data: { role: agentConfig.role, round: state.round } });

    try {
      const provider = getProvider(agentConfig.provider);
      const messages = buildMessagesForAgent(task, agentConfig.systemPrompt, state.messages, threadHistory);

      const response = await provider.sendMessage({
        model: agentConfig.model,
        messages,
        temperature: agentConfig.temperature,
        maxTokens: agentConfig.maxTokens,
      });

      const agentMessage: AgentMessage = {
        role: agentConfig.role,
        provider: agentConfig.provider,
        model: agentConfig.model,
        content: response.content,
        round: state.round,
        timestamp: new Date().toISOString(),
      };

      state.messages.push(agentMessage);

      emit({ type: "agent_response", data: agentMessage });
      emit({ type: "agent_completed", data: { role: agentConfig.role, round: state.round } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown agent error";
      state.status = "failed";
      state.error = message;

      emit({ type: "agent_error", data: { role: agentConfig.role, round: state.round, error: message } });
      emit({ type: "workflow_error", data: { error: message } });

      logger.error("Workflow failed", { role: agentConfig.role, round: state.round, error: message });
      throw err;
    }
  }

  // The final agent in the chain is treated as the Finalizer's output by convention.
  state.finalResult = state.messages[state.messages.length - 1]?.content;
  state.status = "completed";

  emit({ type: "final_result", data: { content: state.finalResult } });
  emit({ type: "workflow_completed", data: { totalRounds: state.round } });

  logger.info("Workflow completed", { totalRounds: state.round });

  return state;
}
