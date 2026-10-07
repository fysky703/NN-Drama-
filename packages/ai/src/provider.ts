export interface AiCompleteOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

/**
 * Provider-agnostic interface. Every AI integration implements this so the
 * rest of the app never depends on a specific vendor.
 */
export interface AiProvider {
  readonly name: string;
  /** Whether the provider has the credentials it needs to run. */
  isConfigured(): boolean;
  /** Free-form completion returning text. */
  complete(prompt: string, options?: AiCompleteOptions): Promise<string>;
  /** Completion expected to return JSON; parsed defensively. */
  completeJson<T>(prompt: string, options?: AiCompleteOptions): Promise<T>;
}

export interface AiProviderConfig {
  provider: string;
  timeoutMs: number;
}

export class AiNotConfiguredError extends Error {
  constructor(provider: string) {
    super(`AI provider "${provider}" is not configured (missing API key).`);
    this.name = "AiNotConfiguredError";
  }
}

export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();
  const start = candidate.indexOf("{");
  const startArr = candidate.indexOf("[");
  const from = start === -1 ? startArr : startArr === -1 ? start : Math.min(start, startArr);
  const end = Math.max(candidate.lastIndexOf("}"), candidate.lastIndexOf("]"));
  if (from === -1 || end === -1) {
    throw new Error("AI response did not contain JSON.");
  }
  return JSON.parse(candidate.slice(from, end + 1)) as T;
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
