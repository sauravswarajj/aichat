/**
 * providers/openrouter.provider.ts
 * -----------------------------------------------------------------------------
 * Adapter for OpenRouter (https://openrouter.ai) — a single API that proxies
 * many underlying models. Treat the specific `:free` model you configure here
 * as a MOVING TARGET: OpenRouter's free model roster changes often, so a
 * model id that works today may be delisted later. If a call starts failing
 * with a 404/400, check openrouter.ai/models for current free options.
 * -----------------------------------------------------------------------------
 */

import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { withRetry } from "../utils/retry";
import { httpClient, normalizeProviderError } from "./base.provider";
import { AIProvider, ProviderRequest, ProviderResponse } from "../types/provider.types";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

export const openrouterProvider: AIProvider = {
  name: "openrouter",

  async sendMessage(request: ProviderRequest): Promise<ProviderResponse> {
    if (!env.OPENROUTER_API_KEY) {
      throw new AppError("OPENROUTER_API_KEY is not set in .env", 500);
    }

    const call = () =>
      httpClient.post(
        OPENROUTER_BASE_URL,
        {
          model: request.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 2048,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
            // OpenRouter asks for these two headers for analytics/rate-limit purposes.
            "HTTP-Referer": "http://localhost",
            "X-Title": "Multi-AI Orchestrator",
          },
          timeout: env.PROVIDER_TIMEOUT_MS,
        }
      );

    try {
      const response = await withRetry(call, {
        retries: env.PROVIDER_MAX_RETRIES,
        label: `openrouter:${request.model}`,
      });

      const content: string = response.data?.choices?.[0]?.message?.content ?? "";

      if (!content) {
        throw new AppError(
          "OpenRouter returned an empty response (the free model may be rate-limited or delisted)",
          502
        );
      }

      return {
        provider: "openrouter",
        model: request.model,
        content,
        usage: {
          inputTokens: response.data?.usage?.prompt_tokens,
          outputTokens: response.data?.usage?.completion_tokens,
        },
        raw: response.data,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw normalizeProviderError(err, "openrouter");
    }
  },
};
