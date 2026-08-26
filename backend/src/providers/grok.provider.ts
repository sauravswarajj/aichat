/**
 * providers/grok.provider.ts
 * -----------------------------------------------------------------------------
 * Adapter for xAI's Grok API (https://docs.x.ai). OpenAI-compatible request/
 * response shape, so this mirrors nvidia.provider.ts.
 *
 * Free-tier note (checked Aug 2026): new accounts get $25 in one-time trial
 * credits on sign-up (no card required), typically expiring in 30-90 days.
 * xAI also offers an optional data-sharing program for extra monthly credits —
 * that trades away privacy on your prompts/responses, so leave it off for
 * anything you wouldn't want used as training data.
 * -----------------------------------------------------------------------------
 */

import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { withRetry } from "../utils/retry";
import { httpClient, normalizeProviderError } from "./base.provider";
import { AIProvider, ProviderRequest, ProviderResponse } from "../types/provider.types";

const GROK_BASE_URL = "https://api.x.ai/v1/chat/completions";

export const grokProvider: AIProvider = {
  name: "grok",

  async sendMessage(request: ProviderRequest): Promise<ProviderResponse> {
    if (!env.XAI_API_KEY) {
      throw new AppError("XAI_API_KEY is not set in .env", 500);
    }

    const call = () =>
      httpClient.post(
        GROK_BASE_URL,
        {
          model: request.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 2048,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.XAI_API_KEY}`,
          },
          timeout: env.PROVIDER_TIMEOUT_MS,
        }
      );

    try {
      const response = await withRetry(call, {
        retries: env.PROVIDER_MAX_RETRIES,
        label: `grok:${request.model}`,
      });

      const content: string = response.data?.choices?.[0]?.message?.content ?? "";

      if (!content) {
        throw new AppError("Grok returned an empty response", 502);
      }

      return {
        provider: "grok",
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
      throw normalizeProviderError(err, "grok");
    }
  },
};
