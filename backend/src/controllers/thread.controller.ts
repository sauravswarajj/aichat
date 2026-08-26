/**
 * controllers/thread.controller.ts
 * -----------------------------------------------------------------------------
 * Five endpoints, all wired up in routes/thread.routes.ts:
 *
 *  - list     GET    /api/threads       Sidebar list, most recent first.
 *  - get      GET    /api/threads/:id   Full thread — reopen an old chat.
 *  - create   POST   /api/threads       "New Chat" button.
 *  - rename   PATCH  /api/threads/:id   Sidebar rename action.
 *  - remove   DELETE /api/threads/:id   Sidebar delete action.
 * -----------------------------------------------------------------------------
 */

import { Request, Response } from "express";
import * as threadStore from "../utils/threadStore";
import { ValidatedCreateThreadRequest, ValidatedRenameThreadRequest } from "../validators/thread.validator";

export async function list(_req: Request, res: Response) {
  const threads = await threadStore.listThreads();
  res.status(200).json(threads);
}

export async function get(req: Request, res: Response) {
  const thread = await threadStore.getThread(req.params.id);
  res.status(200).json(thread);
}

export async function create(req: Request, res: Response) {
  const { title } = req.body as ValidatedCreateThreadRequest;
  const thread = await threadStore.createThread(title);
  res.status(201).json(thread);
}

export async function rename(req: Request, res: Response) {
  const { title } = req.body as ValidatedRenameThreadRequest;
  const thread = await threadStore.renameThread(req.params.id, title);
  res.status(200).json(thread);
}

export async function remove(req: Request, res: Response) {
  await threadStore.deleteThread(req.params.id);
  res.status(200).json({ message: "Thread deleted" });
}
