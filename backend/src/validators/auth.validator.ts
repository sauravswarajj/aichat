/**
 * validators/auth.validator.ts
 * -----------------------------------------------------------------------------
 * Validates the login request body. Note: there is deliberately no signup or
 * "forgot password" schema — this app has exactly one valid account, defined
 * entirely by AUTH_EMAIL/AUTH_PASSWORD in .env. To change the password, edit
 * .env and restart the server.
 * -----------------------------------------------------------------------------
 */

import { z } from "zod";

export const loginRequestSchema = z.object({
  email: z.string().email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
  /** Optional device/browser label, purely cosmetic — shown if you ever build an "active sessions" view. */
  label: z.string().max(100).optional(),
});

export type ValidatedLoginRequest = z.infer<typeof loginRequestSchema>;
