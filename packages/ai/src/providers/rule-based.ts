import type { AiCompleteOptions, AiProvider } from "../provider";

/**
 * Deterministic, offline provider used when AI_PROVIDER=none or a key is
 * missing. It does not call any network service. It exists so the app has a
 * fully working, non-faked path: the design specification and reconstruction
 * prompt are produced programmatically elsewhere, and this provider simply
 * echoes a structured summary rather than inventing data.
 */
export class RuleBasedProvider implements AiProvider {
  readonly name = "rule-based";

  isConfigured(): boolean {
    return true;
  }

  async complete(prompt: string, options: AiCompleteOptions = {}): Promise<string> {
    void options;
    return [
      "# Deterministic analysis",
      "",
      "No AI provider is configured, so this summary was produced by the",
      "built-in rule-based analyser from the extracted design system.",
      "",
      prompt.slice(0, 2000),
    ].join("\n");
  }

  async completeJson<T>(prompt: string, options: AiCompleteOptions = {}): Promise<T> {
    const text = await this.complete(prompt, options);
    return { text } as unknown as T;
  }
}
