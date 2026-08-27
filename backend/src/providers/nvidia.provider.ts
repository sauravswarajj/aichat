/**
 * providers/nvidia.provider.ts
 * -----------------------------------------------------------------------------
 * Adapter for NVIDIA NIM / build.nvidia.com hosted models.
 * -----------------------------------------------------------------------------
 */

import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { withRetry } from "../utils/retry";
import { httpClient, normalizeProviderError } from "./base.provider";
import { AIProvider, ProviderRequest, ProviderResponse } from "../types/provider.types";

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export const nvidiaProvider: AIProvider = {
  name: "nvidia",

  async sendMessage(request: ProviderRequest): Promise<ProviderResponse> {
    if (!env.NVIDIA_API_KEY) {
      throw new AppError("NVIDIA_API_KEY is not set in .env", 500);
    }

    const cleanMessages = request.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const call = () =>
      httpClient.post(
        NVIDIA_BASE_URL,
        {
          model: request.model,
          messages: cleanMessages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 2048,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.NVIDIA_API_KEY}`,
          },
          timeout: env.PROVIDER_TIMEOUT_MS,
        }
      );

    try {
      const response = await withRetry(call, {
        retries: env.PROVIDER_MAX_RETRIES,
        label: `nvidia:${request.model}`,
      });

      const content: string = response.data?.choices?.[0]?.message?.content ?? "";

      if (!content) {
        throw new AppError("NVIDIA NIM returned an empty response", 502);
      }

      return {
        provider: "nvidia",
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
      throw normalizeProviderError(err, "nvidia");
    }
  },
};
