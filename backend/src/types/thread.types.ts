/**
 * types/thread.types.ts
 * -----------------------------------------------------------------------------
 * A "Thread" = one conversation, exactly like a chat thread in the Claude
 * sidebar. Each time the user sends a task in an existing thread, that
 * produces one "Turn" — the task they sent plus everything the agent chain
 * produced for it. A thread is just an ordered list of turns.
 * -----------------------------------------------------------------------------
 */

import { AgentConfig, TaskType } from "./agent.types";
import { AgentMessage } from "./workflow.types";

/** One user task + the full agent chain output it produced. */
export interface ThreadTurn {
  id: string;
  task: string;
  taskType: TaskType;
  agents: AgentConfig[];
  messages: AgentMessage[];
  finalResult: string;
  image?: string;
  createdAt: string;
}

/** The full stored conversation — what GET /api/threads/:id returns. */
export interface Thread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  turns: ThreadTurn[];
}

/** The lightweight shape used for the sidebar list — no full message bodies. */
export interface ThreadSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  turnCount: number;
  /** Short preview of the most recent final result, for the sidebar row. */
  preview: string;
}
