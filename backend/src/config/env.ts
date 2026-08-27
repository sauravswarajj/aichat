/**
 * config/env.ts
 * -----------------------------------------------------------------------------
 * Validates process.env at server startup using Zod.
 *
 * If ANY required variable is missing or malformed, the process exits
 * immediately with a descriptive error list — preventing the app from
 * starting in a broken state.
 * -----------------------------------------------------------------------------
 */

import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load .env reliably across all invocation contexts
const candidatePaths = [
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "backend/.env"),
  "d:/Saurav/aichat/backend/.env",
];

for (const p of candidatePaths) {
  dotenv.config({ path: p });
}

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().optional(),
  MONGODB_URI: z.string().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:2000,http://localhost:3000"),

  // Single shared credentials for personal auth (blueprint section 10)
  AUTH_EMAIL: z.string().email("AUTH_EMAIL must be a valid email").default("admin@example.com"),
  AUTH_PASSWORD: z.string().min(8, "AUTH_PASSWORD must be at least 8 chars").default("change_me_strong_password"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars").default("change_this_jwt_secret_key_in_production"),

  // Provider API keys — all optional at startup; individual adapters throw
  // only when a key is needed for a specific request.
  GEMINI_API_KEY: z.string().optional(),
  NVIDIA_API_KEY: z.string().optional(),
  QWEN_API_KEY: z.string().optional(),
  DASHSCOPE_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  GROK_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),

  // Provider call resilience (blueprint section 9)
  PROVIDER_TIMEOUT_MS: z.coerce.number().default(90000),
  PROVIDER_MAX_RETRIES: z.coerce.number().default(2),

  // Safeguards
  MAX_WORKFLOW_ROUNDS: z.coerce.number().default(10),

  // How many prior turns of a thread to feed into the agent chain's prompt
  // when you continue an existing conversation. Keeps old threads from
  // growing the prompt unboundedly the longer a conversation gets.
  THREAD_HISTORY_LIMIT: z.coerce.number().default(10),
});

let validatedEnv: z.infer<typeof envSchema>;

try {
  validatedEnv = envSchema.parse(process.env);
} catch (err) {
  if (err instanceof z.ZodError) {
    console.error("❌ Invalid environment configuration:", err.flatten().fieldErrors);
  } else {
    console.error("❌ Unknown environment configuration error:", err);
  }
  process.exit(1);
}

export const env = validatedEnv;
export const isProduction = env.NODE_ENV === "production";
