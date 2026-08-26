/**
 * providers/base.provider.ts
 * -----------------------------------------------------------------------------
 * Shared helpers used by every concrete provider adapter. Not a class to
 * extend — just utility functions, since each provider's request/response
 * shape is different enough that composition is cleaner than inheritance.
 * -----------------------------------------------------------------------------
 */

import axios, { isAxiosError } from "axios";
import { AppError } from "../utils/AppError";
import { ProviderName } from "../types/provider.types";

/**
 * Normalizes any error thrown during a provider HTTP call into an AppError
 * with a useful message and status code, without ever leaking the API key
 * (axios error configs can contain request headers, so we deliberately only
 * pull out status + response body, never the request config).
 */
export function normalizeProviderError(err: unknown, provider: ProviderName): AppError {
  if (isAxiosError(err)) {
    const status = err.response?.status ?? 502;
    const providerMessage =
      (err.response?.data as { error?: { message?: string } } | undefined)?.error?.message ??
      err.message;
    return new AppError(`[${provider}] ${providerMessage}`, status >= 400 && status < 600 ? status : 502);
  }
  if (err instanceof Error) {
    return new AppError(`[${provider}] ${err.message}`, 502);
  }
  return new AppError(`[${provider}] Unknown provider error`, 502);
}

/** Shared axios instance defaults — timeout is enforced per-call by the caller passing `timeout`. */
export const httpClient = axios.create();
