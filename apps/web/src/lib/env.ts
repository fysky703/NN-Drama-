const env = process.env;

export const serverEnv = {
  appUrl: env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  storeDriver: (env.STORE_DRIVER ?? "file").toLowerCase(),
  databaseUrl: env.DATABASE_URL ?? "",

  storageDriver: (env.STORAGE_DRIVER ?? "local").toLowerCase(),
  storagePublicBaseUrl: env.STORAGE_PUBLIC_BASE_URL ?? "",
  s3: {
    endpoint: env.S3_ENDPOINT ?? "",
    region: env.S3_REGION ?? "auto",
    bucket: env.S3_BUCKET ?? "",
    accessKeyId: env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? "",
    forcePathStyle: (env.S3_FORCE_PATH_STYLE ?? "true") === "true",
  },

  queueDriver: (env.QUEUE_DRIVER ?? "inline").toLowerCase(),
  redisUrl: env.REDIS_URL ?? "",
  queueName: env.QUEUE_NAME ?? "nn-drama-scan",

  workerUrl: env.WORKER_URL ?? "http://localhost:8787",
  workerSecret: env.WORKER_SHARED_SECRET ?? "change-me-in-production",
  internalCallbackUrl: env.INTERNAL_CALLBACK_URL ?? env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  ai: {
    provider: env.AI_PROVIDER ?? "none",
    timeoutMs: Number(env.AI_REQUEST_TIMEOUT_MS ?? "60000"),
    openaiApiKey: env.OPENAI_API_KEY ?? "",
    openaiModel: env.OPENAI_MODEL ?? "gpt-4o-mini",
    openaiBaseUrl: env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    anthropicApiKey: env.ANTHROPIC_API_KEY ?? "",
    anthropicModel: env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest",
    anthropicBaseUrl: env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com/v1",
    geminiApiKey: env.GEMINI_API_KEY ?? "",
    geminiModel: env.GEMINI_MODEL ?? "gemini-1.5-flash",
    geminiBaseUrl: env.GEMINI_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta",
  },

  limits: {
    scansPerHour: Number(env.RATE_LIMIT_SCANS_PER_HOUR ?? "10"),
    concurrentScans: Number(env.RATE_LIMIT_CONCURRENT_SCANS ?? "2"),
    maxPages: Number(env.MAX_PAGES_PER_SCAN ?? "1"),
    maxScreenshots: Number(env.MAX_SCREENSHOTS_PER_SCAN ?? "6"),
    maxAiRequestsPerDay: Number(env.MAX_AI_REQUESTS_PER_DAY ?? "100"),
    refineMaxIterations: Number(env.REFINE_MAX_ITERATIONS ?? "4"),
    refineTargetSimilarity: Number(env.REFINE_TARGET_SIMILARITY ?? "90"),
    navigationTimeoutMs: Number(env.SCAN_NAVIGATION_TIMEOUT_MS ?? "30000"),
    maxHtmlBytes: Number(env.SCAN_MAX_HTML_BYTES ?? "5242880"),
    maxRedirects: Number(env.SCAN_MAX_REDIRECTS ?? "5"),
    maxAssets: Number(env.SCAN_MAX_ASSETS ?? "200"),
  },
} as const;

export function aiEnv() {
  return {
    AI_PROVIDER: serverEnv.ai.provider,
    AI_REQUEST_TIMEOUT_MS: String(serverEnv.ai.timeoutMs),
    OPENAI_API_KEY: serverEnv.ai.openaiApiKey,
    OPENAI_MODEL: serverEnv.ai.openaiModel,
    OPENAI_BASE_URL: serverEnv.ai.openaiBaseUrl,
    ANTHROPIC_API_KEY: serverEnv.ai.anthropicApiKey,
    ANTHROPIC_MODEL: serverEnv.ai.anthropicModel,
    ANTHROPIC_BASE_URL: serverEnv.ai.anthropicBaseUrl,
    GEMINI_API_KEY: serverEnv.ai.geminiApiKey,
    GEMINI_MODEL: serverEnv.ai.geminiModel,
    GEMINI_BASE_URL: serverEnv.ai.geminiBaseUrl,
  };
}
