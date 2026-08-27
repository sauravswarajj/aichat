/**
 * providers/provider.factory.ts
 * -----------------------------------------------------------------------------
 * Maps a ProviderName string (as sent by the frontend, e.g. "gemini") to the
 * matching adapter implementation. This is the ONLY place that needs editing
 * when you add a 5th provider — everything else (orchestrator, routes,
 * validators) already works generically off ProviderName.
 *
 * TO ADD A NEW PROVIDER:
 *   1. Create providers/<name>.provider.ts implementing AIProvider (copy an
 *      existing one as a template).
 *   2. Add its name to the ProviderName union in types/provider.types.ts.
 *   3. Register it in the map below.
 * -----------------------------------------------------------------------------
 */

import { AIProvider, ProviderName } from "../types/provider.types";
import { AppError } from "../utils/AppError";
import { geminiProvider } from "./gemini.provider";
import { nvidiaProvider } from "./nvidia.provider";
import { qwenProvider } from "./qwen.provider";
import { openrouterProvider } from "./openrouter.provider";
import { deepseekProvider } from "./deepseek.provider";
import { grokProvider } from "./grok.provider";
import { groqProvider } from "./groq.provider";

const providerRegistry: Record<ProviderName, AIProvider> = {
  gemini: geminiProvider,
  nvidia: nvidiaProvider,
  qwen: qwenProvider,
  openrouter: openrouterProvider,
  deepseek: deepseekProvider,
  grok: grokProvider,
  groq: groqProvider,
};

export function getProvider(name: ProviderName): AIProvider {
  const provider = providerRegistry[name];
  if (!provider) {
    throw new AppError(`Unknown provider "${name}"`, 400);
  }
  return provider;
}
