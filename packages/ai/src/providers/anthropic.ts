import {
  type AiCompleteOptions,
  type AiProvider,
  extractJson,
  fetchWithTimeout,
} from "../provider";

export class AnthropicProvider implements AiProvider {
  readonly name = "anthropic";

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly baseUrl = "https://api.anthropic.com/v1",
    private readonly defaultTimeout = 60000,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(prompt: string, options: AiCompleteOptions = {}): Promise<string> {
    const res = await fetchWithTimeout(
      `${this.baseUrl}/messages`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: options.maxTokens ?? 4096,
          temperature: options.temperature ?? 0.2,
          system: options.system,
          messages: [{ role: "user", content: prompt }],
        }),
      },
      options.timeoutMs ?? this.defaultTimeout,
    );

    if (!res.ok) {
      throw new Error(`Anthropic request failed (${res.status}): ${await safeText(res)}`);
    }
    const data = (await res.json()) as { content?: { text?: string }[] };
    return (data.content ?? []).map((c) => c.text ?? "").join("");
  }

  async completeJson<T>(prompt: string, options: AiCompleteOptions = {}): Promise<T> {
    const text = await this.complete(prompt, options);
    return extractJson<T>(text);
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500);
  } catch {
    return "";
  }
}
