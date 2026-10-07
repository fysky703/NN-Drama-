import {
  type AiCompleteOptions,
  type AiProvider,
  extractJson,
  fetchWithTimeout,
} from "../provider";

export class OpenAiProvider implements AiProvider {
  readonly name = "openai";

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly baseUrl = "https://api.openai.com/v1",
    private readonly defaultTimeout = 60000,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(prompt: string, options: AiCompleteOptions = {}): Promise<string> {
    const res = await fetchWithTimeout(
      `${this.baseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          temperature: options.temperature ?? 0.2,
          max_tokens: options.maxTokens ?? 4096,
          messages: [
            ...(options.system ? [{ role: "system", content: options.system }] : []),
            { role: "user", content: prompt },
          ],
        }),
      },
      options.timeoutMs ?? this.defaultTimeout,
    );

    if (!res.ok) {
      throw new Error(`OpenAI request failed (${res.status}): ${await safeText(res)}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content ?? "";
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
