/**
 * validators/thread.validator.ts
 * -----------------------------------------------------------------------------
 * Validates request bodies for the thread (sidebar) endpoints.
 * -----------------------------------------------------------------------------
 */

import { z } from "zod";

export const createThreadSchema = z.object({
  /** Optional — if omitted, the thread is titled "New Chat" until its first message. */
  title: z.string().max(200).optional(),
});

export const renameThreadSchema = z.object({
  title: z.string().min(1, "title is required").max(200),
});

export type ValidatedCreateThreadRequest = z.infer<typeof createThreadSchema>;
export type ValidatedRenameThreadRequest = z.infer<typeof renameThreadSchema>;
