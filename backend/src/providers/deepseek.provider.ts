/**
 * providers/deepseek.provider.ts
 * -----------------------------------------------------------------------------
 * Adapter for DeepSeek's API (https://api-docs.deepseek.com).
 * OpenAI-compatible request/response shape, so this mirrors nvidia.provider.ts.
 *
 * Free-tier note (checked Aug 2026): new accounts get a ONE-TIME 5-million-token
 * grant on sign-up, usable across all models — there is no ongoing/permanent
 * free tier. Once that grant is used up, calls will fail with a billing error
 * until you add a payment method. Current model names are `deepseek-chat`
 * (general) and `deepseek-reasoner` (thinking mode) — check DeepSeek's docs
 * if those return a 404, since older/newer aliases do get retired.
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

    const call = () =>
      httpClient.post(
        DEEPSEEK_BASE_URL,
        {
          model: request.model,
          messages: request.messages,
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
