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
 * Multimodal Vision Support:
 * Converts any attached ImageAttachment[] into Gemini's native `inlineData`
 * parts so Gemini can visually inspect uploaded photos and reference images.
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

  // Gemini API rules:
  // 1. Contents must end with a 'user' turn so the model knows it is its turn to speak.
  // 2. Roles cannot be duplicate consecutive 'model' turns.
  const contents = conversation.map((m, idx) => {
    const isLast = idx === conversation.length - 1;
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    // Multimodal Vision Support: Attach images if present
    if (m.images && m.images.length > 0) {
      for (const img of m.images) {
        parts.push({
          inlineData: {
            mimeType: img.mimeType || "image/jpeg",
            data: img.data,
          },
        });
      }
    }

    if (m.content) {
      parts.push({ text: m.content });
    }

    return {
      role: isLast ? "user" : m.role === "assistant" ? "model" : "user",
      parts: parts.length > 0 ? parts : [{ text: " " }],
    };
  });

  return {
    systemInstruction: systemMessages.length
      ? { parts: [{ text: systemMessages.join("\n\n") }] }
      : undefined,
    contents: contents.length > 0 ? contents : [{ role: "user", parts: [{ text: "Hello" }] }],
  };
}

export const geminiProvider: AIProvider = {
  name: "gemini",

  async sendMessage(request: ProviderRequest): Promise<ProviderResponse> {
    if (!env.GEMINI_API_KEY) {
      throw new AppError("GEMINI_API_KEY is not set in .env", 500);
    }

    const { systemInstruction, contents } = splitSystemPrompt(request.messages);

    const makeCall = (modelName: string) => () =>
      httpClient.post(
        `${GEMINI_BASE_URL}/${modelName}:generateContent`,
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

    let activeModel = request.model;
    let response: any;

    try {
      response = await withRetry(makeCall(activeModel), {
        retries: env.PROVIDER_MAX_RETRIES,
        label: `gemini:${activeModel}`,
      });
    } catch (primaryErr: any) {
      // If primary model hits a high demand spike (503/429), fallback to gemini-3.6-flash or gemini-3.5-flash
      const isHighDemand =
        primaryErr?.message?.includes("high demand") ||
        primaryErr?.response?.status === 503 ||
        primaryErr?.response?.status === 429;

      if (isHighDemand && activeModel !== "gemini-3.6-flash") {
        try {
          activeModel = "gemini-3.6-flash";
          response = await withRetry(makeCall(activeModel), {
            retries: 1,
            label: `gemini:fallback:${activeModel}`,
          });
        } catch (fallbackErr) {
          throw normalizeProviderError(primaryErr, "gemini");
        }
      } else {
        if (primaryErr instanceof AppError) throw primaryErr;
        throw normalizeProviderError(primaryErr, "gemini");
      }
    }

    const candidate = response.data?.candidates?.[0];
    const content: string =
      candidate?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";

    if (!content) {
      throw new AppError("Gemini returned an empty response (possibly blocked by safety filters)", 502);
    }

    return {
      provider: "gemini",
      model: activeModel,
      content,
      usage: {
        inputTokens: response.data?.usageMetadata?.promptTokenCount,
        outputTokens: response.data?.usageMetadata?.candidatesTokenCount,
      },
      raw: response.data,
    };
  },
};
