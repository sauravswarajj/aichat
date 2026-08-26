/**
 * controllers/auth.controller.ts
 * -----------------------------------------------------------------------------
 * Four endpoints, all wired up in routes/auth.routes.ts:
 *
 *  - login            POST /api/auth/login        Checks email+password against
 *                                                   .env, issues a new session token
 *                                                   for THIS device. No signup, no
 *                                                   forgot-password — the only valid
 *                                                   credentials are AUTH_EMAIL/
 *                                                   AUTH_PASSWORD in .env.
 *
 *  - logout           POST /api/auth/logout        Revokes only the token used to
 *                                                   call this endpoint (this device).
 *
 *  - logoutAllDevices  POST /api/auth/logout-all    Revokes EVERY session, on every
 *                                                   device, immediately.
 *
 *  - me               GET  /api/auth/me            Lets the frontend check "am I
 *                                                   still logged in?" on app load,
 *                                                   without needing to store login
 *                                                   state client-side.
 * -----------------------------------------------------------------------------
 */

import { Request, Response } from "express";
import { env } from "../config/env";
import { safeCompare } from "../utils/safeCompare";
import { AppError } from "../utils/AppError";
import { createSession, revokeSession, revokeAllSessions, activeSessionCount } from "../utils/sessionStore";
import { ValidatedLoginRequest } from "../validators/auth.validator";
import { logger } from "../utils/logger";

export async function login(req: Request, res: Response) {
  const { email, password, label } = req.body as ValidatedLoginRequest;

  const emailMatches = safeCompare(email.toLowerCase(), env.AUTH_EMAIL.toLowerCase());
  const passwordMatches = safeCompare(password, env.AUTH_PASSWORD);

  if (!emailMatches || !passwordMatches) {
    // Deliberately identical error for "wrong email" vs "wrong password" —
    // being specific would tell an attacker which part they got right.
    throw new AppError("Invalid email or password", 401);
  }

  const token = await createSession(label);
  logger.info("Login successful", { activeSessions: await activeSessionCount() });

  res.status(200).json({ token });
}

export async function logout(req: Request, res: Response) {
  // requireAuth already validated this token exists and is valid.
  await revokeSession(req.sessionToken as string);
  res.status(200).json({ message: "Logged out on this device" });
}

export async function logoutAllDevices(_req: Request, res: Response) {
  await revokeAllSessions();
  logger.info("Logged out on all devices");
  res.status(200).json({ message: "Logged out on all devices" });
}

export async function me(_req: Request, res: Response) {
  // requireAuth already confirmed this token is valid before we get here.
  res.status(200).json({ authenticated: true });
}
