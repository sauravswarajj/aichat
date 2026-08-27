/**
 * providers/groq.provider.ts
 * -----------------------------------------------------------------------------
 * Adapter for GroqCloud (https://console.groq.com).
 * -----------------------------------------------------------------------------
 */

import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { withRetry } from "../utils/retry";
import { httpClient, normalizeProviderError } from "./base.provider";
import { AIProvider, ProviderRequest, ProviderResponse } from "../types/provider.types";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions";

export const groqProvider: AIProvider = {
  name: "groq",

  async sendMessage(request: ProviderRequest): Promise<ProviderResponse> {
    if (!env.GROQ_API_KEY) {
      throw new AppError("GROQ_API_KEY is not set in .env", 500);
    }

    // Strip provider-agnostic custom properties (like images) for standard OpenAI-compatible text endpoint
    const cleanMessages = request.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const call = () =>
      httpClient.post(
        GROQ_BASE_URL,
        {
          model: request.model,
          messages: cleanMessages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 2048,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.GROQ_API_KEY}`,
          },
          timeout: env.PROVIDER_TIMEOUT_MS,
        }
      );

    try {
      const response = await withRetry(call, {
        retries: env.PROVIDER_MAX_RETRIES,
        label: `groq:${request.model}`,
      });

      const content: string = response.data?.choices?.[0]?.message?.content ?? "";

      if (!content) {
        throw new AppError("Groq returned an empty response", 502);
      }

      return {
        provider: "groq",
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
      throw normalizeProviderError(err, "groq");
    }
  },
};
