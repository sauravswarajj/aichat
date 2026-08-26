/**
 * providers/gemini.provider.ts
 * -----------------------------------------------------------------------------
 * Adapter for Google's Gemini API (https://ai.google.dev).
 *
 * Converts our universal ChatMessage[] into Gemini's `contents` + optional
 * `systemInstruction` shape, and converts Gemini's response back into our
 * universal ProviderResponse shape. This is the ONLY file in the codebase
 * that needs to know what Gemini's request/response JSON looks like.
 *
 * Free-tier note (checked Aug 2026): Flash/Flash-Lite models have much higher
 * free rate limits than Pro — prefer them for a multi-agent chain where you
 * make several calls per run.
 * -----------------------------------------------------------------------------
 */

import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { withRetry } from "../utils/retry";
import { httpClient, normalizeProviderError } from "./base.provider";
import { AIProvider, ChatMessage, ProviderRequest, ProviderResponse } from "../types/provider.types";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/** Gemini keeps system instructions separate from the turn-by-turn contents array. */
function splitSystemPrompt(messages: ChatMessage[]) {
  const systemMessages = messages.filter((m) => m.role === "system").map((m) => m.content);
  const conversation = messages.filter((m) => m.role !== "system");
  return {
    systemInstruction: systemMessages.length
      ? { parts: [{ text: systemMessages.join("\n\n") }] }
      : undefined,
    contents: conversation.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  };
}

export const geminiProvider: AIProvider = {
  name: "gemini",

  async sendMessage(request: ProviderRequest): Promise<ProviderResponse> {
    if (!env.GEMINI_API_KEY) {
      throw new AppError("GEMINI_API_KEY is not set in .env", 500);
    }

    const { systemInstruction, contents } = splitSystemPrompt(request.messages);

    const call = () =>
      httpClient.post(
        `${GEMINI_BASE_URL}/${request.model}:generateContent`,
        {
          contents,
          ...(systemInstruction ? { systemInstruction } : {}),
          generationConfig: {
            temperature: request.temperature ?? 0.7,
            maxOutputTokens: request.maxTokens ?? 2048,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY,
          },
          timeout: env.PROVIDER_TIMEOUT_MS,
        }
      );

    try {
      const response = await withRetry(call, {
        retries: env.PROVIDER_MAX_RETRIES,
        label: `gemini:${request.model}`,
      });

      const candidate = response.data?.candidates?.[0];
      const content: string =
        candidate?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";

      if (!content) {
        throw new AppError("Gemini returned an empty response (possibly blocked by safety filters)", 502);
      }

      return {
        provider: "gemini",
        model: request.model,
        content,
        usage: {
          inputTokens: response.data?.usageMetadata?.promptTokenCount,
          outputTokens: response.data?.usageMetadata?.candidatesTokenCount,
        },
        raw: response.data,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw normalizeProviderError(err, "gemini");
    }
  },
};
