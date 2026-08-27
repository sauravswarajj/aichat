/**
 * types/provider.types.ts
 * -----------------------------------------------------------------------------
 * Shared contracts for talking to ANY AI provider.
 *
 * This is the "common language" the orchestrator speaks. Every provider
 * adapter (Gemini, NVIDIA, Qwen, OpenRouter, ...) converts its own API's
 * request/response shape into these types — so the orchestrator never needs
 * to know which provider it's talking to.
 * -----------------------------------------------------------------------------
 */

/** Every provider we support. Add a new value here when you add a new adapter. */
export type ProviderName = "gemini" | "nvidia" | "qwen" | "openrouter" | "deepseek" | "grok" | "groq";

/** Image attachment for multimodal vision models. */
export interface ImageAttachment {
  mimeType: string;
  data: string; // Base64 encoded data string without data:... prefix
}

/** A single message in a conversation, in the universal OpenAI/multimodal shape. */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  images?: ImageAttachment[];
}

/** What the orchestrator passes INTO a provider adapter. */
export interface ProviderRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

/** What every provider adapter must return, regardless of provider. */
export interface ProviderResponse {
  provider: ProviderName;
  model: string;
  content: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
  /** Raw provider payload, kept only for debugging — never sent to the frontend as-is. */
  raw?: unknown;
}

/**
 * The interface every provider adapter implements.
 * The orchestrator only ever depends on this — never on a concrete provider class.
 */
export interface AIProvider {
  name: ProviderName;
  sendMessage(request: ProviderRequest): Promise<ProviderResponse>;
}
