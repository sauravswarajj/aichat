/**
 * providers/grok.provider.ts
 * -----------------------------------------------------------------------------
 * Adapter for xAI's Grok API (https://docs.x.ai). OpenAI-compatible request/
 * response shape, so this mirrors nvidia.provider.ts.
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
    const apiKey = env.GROK_API_KEY || env.XAI_API_KEY;
    if (!apiKey) {
      throw new AppError("GROK_API_KEY / XAI_API_KEY is not set in .env", 500);
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
            Authorization: `Bearer ${apiKey}`,
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
