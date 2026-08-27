/**
 * providers/deepseek.provider.ts
 * -----------------------------------------------------------------------------
 * Adapter for DeepSeek's API (https://api-docs.deepseek.com).
 * -----------------------------------------------------------------------------
 */

import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { withRetry } from "../utils/retry";
import { httpClient, normalizeProviderError } from "./base.provider";
import { AIProvider, ProviderRequest, ProviderResponse } from "../types/provider.types";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/chat/completions";

export const deepseekProvider: AIProvider = {
  name: "deepseek",

  async sendMessage(request: ProviderRequest): Promise<ProviderResponse> {
    if (!env.DEEPSEEK_API_KEY) {
      throw new AppError("DEEPSEEK_API_KEY is not set in .env", 500);
    }

    const cleanMessages = request.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const call = () =>
      httpClient.post(
        DEEPSEEK_BASE_URL,
        {
          model: request.model,
          messages: cleanMessages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 2048,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
          },
          timeout: env.PROVIDER_TIMEOUT_MS,
        }
      );

    try {
      const response = await withRetry(call, {
        retries: env.PROVIDER_MAX_RETRIES,
        label: `deepseek:${request.model}`,
      });

      const content: string = response.data?.choices?.[0]?.message?.content ?? "";

      if (!content) {
        throw new AppError("DeepSeek returned an empty response", 502);
      }

      return {
        provider: "deepseek",
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
      throw normalizeProviderError(err, "deepseek");
    }
  },
};
