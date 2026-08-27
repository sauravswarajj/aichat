/**
 * providers/qwen.provider.ts
 * -----------------------------------------------------------------------------
 * Adapter for Alibaba Cloud Model Studio / DashScope (Qwen models).
 * -----------------------------------------------------------------------------
 */

import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { withRetry } from "../utils/retry";
import { httpClient, normalizeProviderError } from "./base.provider";
import { AIProvider, ProviderRequest, ProviderResponse } from "../types/provider.types";

const DASHSCOPE_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";

export const qwenProvider: AIProvider = {
  name: "qwen",

  async sendMessage(request: ProviderRequest): Promise<ProviderResponse> {
    const apiKey = env.DASHSCOPE_API_KEY || env.QWEN_API_KEY;
    if (!apiKey) {
      throw new AppError("DASHSCOPE_API_KEY / QWEN_API_KEY is not set in .env", 500);
    }

    const call = () =>
      httpClient.post(
        DASHSCOPE_BASE_URL,
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
        label: `qwen:${request.model}`,
      });

      const content: string = response.data?.choices?.[0]?.message?.content ?? "";

      if (!content) {
        throw new AppError("Qwen/DashScope returned an empty response", 502);
      }

      return {
        provider: "qwen",
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
      throw normalizeProviderError(err, "qwen");
    }
  },
};
