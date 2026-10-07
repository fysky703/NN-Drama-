import type { AiProvider } from "./provider";
import { OpenAiProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";
import { GeminiProvider } from "./providers/gemini";
import { RuleBasedProvider } from "./providers/rule-based";

export * from "./provider";
export * from "./spec";
export * from "./prompt";
export { OpenAiProvider, AnthropicProvider, GeminiProvider, RuleBasedProvider };

export interface AiEnv {
  AI_PROVIDER?: string;
  AI_REQUEST_TIMEOUT_MS?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  OPENAI_BASE_URL?: string;
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_MODEL?: string;
  ANTHROPIC_BASE_URL?: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  GEMINI_BASE_URL?: string;
}

/**
 * Factory selecting the configured provider. Falls back to the offline
 * rule-based provider when no key is present, so the app never breaks.
 */
export function createAiProvider(env: AiEnv): AiProvider {
  const timeout = Number(env.AI_REQUEST_TIMEOUT_MS ?? "60000") || 60000;
  const provider = (env.AI_PROVIDER ?? "none").toLowerCase();

  switch (provider) {
    case "openai":
      if (env.OPENAI_API_KEY) {
        return new OpenAiProvider(
          env.OPENAI_API_KEY,
          env.OPENAI_MODEL ?? "gpt-4o-mini",
          env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
          timeout,
        );
      }
      break;
    case "anthropic":
      if (env.ANTHROPIC_API_KEY) {
        return new AnthropicProvider(
          env.ANTHROPIC_API_KEY,
          env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest",
          env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com/v1",
          timeout,
        );
      }
      break;
    case "gemini":
      if (env.GEMINI_API_KEY) {
        return new GeminiProvider(
          env.GEMINI_API_KEY,
          env.GEMINI_MODEL ?? "gemini-1.5-flash",
          env.GEMINI_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta",
          timeout,
        );
      }
      break;
  }

  return new RuleBasedProvider();
}

export function availableProviders(env: AiEnv): { id: string; label: string; configured: boolean }[] {
  return [
    { id: "rule-based", label: "Built-in (offline)", configured: true },
    { id: "openai", label: "OpenAI", configured: Boolean(env.OPENAI_API_KEY) },
    { id: "anthropic", label: "Anthropic", configured: Boolean(env.ANTHROPIC_API_KEY) },
    { id: "gemini", label: "Google Gemini", configured: Boolean(env.GEMINI_API_KEY) },
  ];
}
