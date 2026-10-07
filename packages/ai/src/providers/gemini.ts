import {
  type AiCompleteOptions,
  type AiProvider,
  extractJson,
  fetchWithTimeout,
} from "../provider";

export class GeminiProvider implements AiProvider {
  readonly name = "gemini";

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly baseUrl = "https://generativelanguage.googleapis.com/v1beta",
    private readonly defaultTimeout = 60000,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(prompt: string, options: AiCompleteOptions = {}): Promise<string> {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
    const res = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: options.system
            ? { parts: [{ text: options.system }] }
            : undefined,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.temperature ?? 0.2,
            maxOutputTokens: options.maxTokens ?? 4096,
          },
        }),
      },
      options.timeoutMs ?? this.defaultTimeout,
    );

    if (!res.ok) {
      throw new Error(`Gemini request failed (${res.status}): ${await safeText(res)}`);
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return (data.candidates?.[0]?.content?.parts ?? [])
      .map((p) => p.text ?? "")
      .join("");
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
