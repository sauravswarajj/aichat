/**
 * utils/threadStore.ts
 * -----------------------------------------------------------------------------
 * Everything the sidebar and the chat continuation feature need:
 *
 *  - createThread()        "New Chat" button — makes an empty thread, shows
 *                            up in the sidebar immediately.
 *  - listThreads()          Sidebar list — lightweight summaries only, sorted
 *                            most-recently-updated first, like Claude's own UI.
 *  - getThread(id)           Reopening an old chat — full turn history, used
 *                            both to render it and to feed prior context back
 *                            to the AI when the user continues it.
 *  - appendTurn(id, turn)    Called after a workflow run completes, to save
 *                            that exchange into the thread.
 *  - buildThreadHistory(id)  Converts a thread's past turns into the ChatMessage[]
 *                            fed to the orchestrator so agents can see
 *                            "what was discussed earlier in this thread."
 *  - renameThread / deleteThread — sidebar row actions.
 * -----------------------------------------------------------------------------
 */

import crypto from "crypto";
import { ThreadModel, ThreadTurnSubdoc } from "../models/thread.model";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";
import { Thread, ThreadSummary, ThreadTurn } from "../types/thread.types";
import { ChatMessage } from "../types/provider.types";

/** Turns a Mongo document into the plain Thread shape the API returns. */
function toThread(doc: {
  _id: unknown;
  title: string;
  createdAt: string;
  updatedAt: string;
  turns: ThreadTurnSubdoc[];
}): Thread {
  return {
    id: String(doc._id),
    title: doc.title,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    turns: doc.turns as ThreadTurn[],
  };
}

/** Short preview text for the sidebar row — last turn's final result, trimmed. */
function previewFor(turns: ThreadTurnSubdoc[]): string {
  const last = turns[turns.length - 1];
  if (!last) return "";
  const oneLine = last.finalResult.replace(/\s+/g, " ").trim();
  return oneLine.length > 100 ? `${oneLine.slice(0, 100)}…` : oneLine;
}

/** Auto-generated title from the first task, like Claude does for unnamed chats. */
function titleFromTask(task: string): string {
  const oneLine = task.replace(/\s+/g, " ").trim();
  return oneLine.length > 60 ? `${oneLine.slice(0, 60)}…` : oneLine || "New Chat";
}

/** Creates a brand-new, empty thread (the "New Chat" action) and returns it. */
export async function createThread(initialTitle?: string): Promise<Thread> {
  const now = new Date().toISOString();
  const doc = await ThreadModel.create({
    title: initialTitle?.trim() || "New Chat",
    createdAt: now,
    updatedAt: now,
    turns: [],
  });
  return toThread(doc);
}

/** Sidebar list — most recently updated first, no full message bodies. */
export async function listThreads(): Promise<ThreadSummary[]> {
  const docs = await ThreadModel.find({}).sort({ updatedAt: -1 }).lean();
  return docs.map((doc) => ({
    id: String(doc._id),
    title: doc.title,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    turnCount: doc.turns.length,
    preview: previewFor(doc.turns),
  }));
}

/** Full thread — used to reopen a chat and to build context when continuing it. */
export async function getThread(id: string): Promise<Thread> {
  const doc = await ThreadModel.findById(id).lean().catch(() => null);
  if (!doc) {
    throw new AppError(`Thread "${id}" not found`, 404);
  }
  return toThread(doc);
}

/**
 * Converts a thread's past turns into ChatMessage[] context — a simple
 * (task -> finalResult) pair per turn — so the agent chain can see "what was
 * discussed earlier" when the user continues an existing thread. Capped to
 * the most recent THREAD_HISTORY_LIMIT turns so a long-running thread's
 * prompt doesn't grow without bound.
 */
export async function buildThreadHistory(id: string): Promise<ChatMessage[]> {
  const thread = await getThread(id);
  const recentTurns = thread.turns.slice(-env.THREAD_HISTORY_LIMIT);

  const history: ChatMessage[] = [];
  for (const turn of recentTurns) {
    history.push({ role: "user", content: turn.task });
    history.push({ role: "assistant", content: turn.finalResult });
  }
  return history;
}

/** Appends one completed turn to a thread, updates its title (if still "New Chat") and updatedAt. */
export async function appendTurn(
  id: string,
  turn: Omit<ThreadTurn, "id">
): Promise<Thread> {
  const doc = await ThreadModel.findById(id);
  if (!doc) {
    throw new AppError(`Thread "${id}" not found`, 404);
  }

  const fullTurn: ThreadTurnSubdoc = { id: crypto.randomUUID(), ...turn };
  doc.turns.push(fullTurn);
  doc.updatedAt = new Date().toISOString();

  // Auto-title the thread from its first message, same as Claude does for new chats.
  if (doc.turns.length === 1 && doc.title === "New Chat") {
    doc.title = titleFromTask(turn.task);
  }

  await doc.save();
  return toThread(doc);
}

/** Sidebar rename action. */
export async function renameThread(id: string, title: string): Promise<Thread> {
  const doc = await ThreadModel.findByIdAndUpdate(
    id,
    { title: title.trim() || "New Chat", updatedAt: new Date().toISOString() },
    { new: true }
  ).lean();
  if (!doc) {
    throw new AppError(`Thread "${id}" not found`, 404);
  }
  return toThread(doc);
}

/** Sidebar delete action. */
export async function deleteThread(id: string): Promise<void> {
  const result = await ThreadModel.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(`Thread "${id}" not found`, 404);
  }
}
