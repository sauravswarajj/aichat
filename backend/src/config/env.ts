/**
 * config/env.ts
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS:
 * Every other file in this backend should import config from HERE instead of
 * touching `process.env` directly. That gives us one place that:
 *   1. Loads the .env file (via dotenv)
 *   2. Validates that required values exist and are the right shape (via zod)
 *   3. Fails fast with a clear error message at startup if something is missing,
 *      instead of failing confusingly later when a provider call is made.
 *
 * If you add a new provider or a new setting, add it to the schema below —
 * do not read process.env anywhere else in the codebase.
 * -----------------------------------------------------------------------------
 */

import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadDotenv();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:2000,http://localhost:3000"),

  // Provider keys are intentionally optional at the schema level — you may only
  // have signed up for some providers yet. Each provider adapter checks for its
  // own key and throws a clear error only when that specific provider is used.
  GEMINI_API_KEY: z.string().optional(),
  NVIDIA_API_KEY: z.string().optional(),
  DASHSCOPE_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),

  // ---- Auth (single-owner login — see utils/sessionStore.ts) ----
  AUTH_EMAIL: z.string().email(),
  AUTH_PASSWORD: z.string().min(1),

  // ---- Database — everything persistent (login sessions, chat threads) lives here ----
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required — paste your MongoDB Atlas connection string"),

  MAX_WORKFLOW_ROUNDS: z.coerce.number().default(6),
  PROVIDER_TIMEOUT_MS: z.coerce.number().default(30000),
  PROVIDER_MAX_RETRIES: z.coerce.number().default(2),

  // How many previous turns of a thread get fed back to the AI as context
  // when you continue an existing conversation. Keeps old threads from
  // growing the prompt unboundedly the longer a conversation gets.
  THREAD_HISTORY_LIMIT: z.coerce.number().default(10),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast and loud — a misconfigured server should never limp along.
  console.error("❌ Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === "production";
