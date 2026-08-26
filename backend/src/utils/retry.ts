/**
 * utils/retry.ts
 * -----------------------------------------------------------------------------
 * Generic "retry with exponential backoff" wrapper. Every provider adapter
 * wraps its API call with this instead of implementing its own retry logic,
 * so retry behavior stays consistent across Gemini/NVIDIA/Qwen/OpenRouter.
 *
 * Per blueprint section 9: "Retry failed requests where appropriate" — this
 * is that mechanism, shared in one place.
 * -----------------------------------------------------------------------------
 */

import { logger } from "./logger";

interface RetryOptions {
  retries: number;
  /** Base delay in ms; actual delay doubles each attempt (1x, 2x, 4x, ...). */
  baseDelayMs?: number;
  /** Label used only for log messages, e.g. "gemini:gemini-2.5-flash". */
  label?: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  { retries, baseDelayMs = 1000, label = "provider-call" }: RetryOptions
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isLastAttempt = attempt === retries;

      if (isLastAttempt) break;

      const backoff = baseDelayMs * Math.pow(2, attempt);
      logger.warn(`${label} failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${backoff}ms`, {
        error: err instanceof Error ? err.message : String(err),
      });
      await delay(backoff);
    }
  }

  throw lastError;
}
