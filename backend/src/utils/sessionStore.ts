/**
 * utils/sessionStore.ts
 * -----------------------------------------------------------------------------
 * WHY OPAQUE TOKENS INSTEAD OF A STATELESS JWT:
 * A stateless JWT can't be revoked on demand — once issued, it's valid until
 * it expires, and there's no way to force-invalidate one early without
 * maintaining a server-side blocklist anyway. Since you explicitly want
 * "logout everywhere" to actually work instantly, sessions need to be
 * server-side and revocable. So: login generates a random opaque token, we
 * keep a record of every valid one in MongoDB, and:
 *   - each device gets its own token document (multi-device login)
 *   - logging out one device deletes just that document
 *   - "logout everywhere" deletes every document at once
 *
 * WHY MONGODB (NOT A FILE, NOT IN-MEMORY):
 * You want to stay logged in until you manually log out — a restart or
 * redeploy should never silently log you out. A file on disk only survives
 * restarts if you're deployed somewhere with a persistent disk; MongoDB
 * Atlas survives regardless of where or how the backend itself is hosted
 * (including fully ephemeral/serverless platforms).
 * -----------------------------------------------------------------------------
 */

import crypto from "crypto";
import { SessionModel } from "../models/session.model";

/** Creates a new session (one per login / one per device) and returns its token. */
export async function createSession(label?: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  await SessionModel.create({ token, createdAt: new Date().toISOString(), label });
  return token;
}

/** Returns true if this token belongs to a currently-valid session. */
export async function isValidSession(token: string): Promise<boolean> {
  const found = await SessionModel.exists({ token });
  return found !== null;
}

/** Logs out just the device that owns this one token. */
export async function revokeSession(token: string): Promise<void> {
  await SessionModel.deleteOne({ token });
}

/** Logs out EVERY device — clears every valid session at once. */
export async function revokeAllSessions(): Promise<void> {
  await SessionModel.deleteMany({});
}

/** How many devices are currently logged in — handy for a future settings UI. */
export async function activeSessionCount(): Promise<number> {
  return SessionModel.countDocuments({});
}
