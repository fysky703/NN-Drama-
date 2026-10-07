import type { CreateScanInput } from "@nn/shared";
import { serverEnv } from "./env";

export interface ScannerClient {
  submitScan(input: CreateScanInput & { scanId: string }): Promise<void>;
  health(): Promise<boolean>;
}

/**
 * Default driver: forwards scan jobs to the dedicated Playwright worker over
 * HTTP. The worker performs the scan and calls back with progress + result.
 */
export class InlineScannerClient implements ScannerClient {
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async submitScan(input: CreateScanInput & { scanId: string }): Promise<void> {
    const res = await fetch(`${this.url}/scan`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-worker-secret": serverEnv.workerSecret },
      body: JSON.stringify({
        scanId: input.scanId,
        url: input.url,
        viewports: input.viewports,
        callbackUrl: serverEnv.internalCallbackUrl,
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) {
      const code = res.status === 401 ? "worker_unavailable" : "worker_unavailable";
      throw new ScannerUnavailableError(code, `Worker responded with ${res.status}.`);
    }
  }

  async health(): Promise<boolean> {
    try {
      const res = await fetch(`${this.url}/health`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Redis + BullMQ queue driver. Requires the worker to consume jobs from the
 * same queue. Kept behind the queue abstraction; enabled when QUEUE_DRIVER=redis.
 */
export class RedisScannerClient implements ScannerClient {
  constructor() {
    if (!serverEnv.redisUrl) {
      throw new Error("QUEUE_DRIVER=redis requires REDIS_URL.");
    }
  }

  async submitScan(_input: CreateScanInput & { scanId: string }): Promise<void> {
    // Phase 4: enqueue via BullMQ. The worker currently consumes HTTP jobs,
    // so this path stays intentionally un-wired until the queue consumer ships.
    throw new Error("Redis queue driver: worker queue consumer not deployed yet.");
  }

  async health(): Promise<boolean> {
    return true;
  }
}

export class ScannerUnavailableError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ScannerUnavailableError";
  }
}

let scanner: ScannerClient | undefined;

export function getScanner(): ScannerClient {
  if (!scanner) {
    scanner =
      serverEnv.queueDriver === "redis"
        ? new RedisScannerClient()
        : new InlineScannerClient(serverEnv.workerUrl);
  }
  return scanner;
}