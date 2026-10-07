import { promises as dns } from "node:dns";
import type { Browser, BrowserContext, Page } from "playwright";
import { chromium } from "playwright";
import {
  isBlockedResolvedAddress,
  validateScanUrl,
  type ViewportSize,
} from "@nn/shared";

export interface LaunchOptions {
  headless?: boolean;
  navigationTimeoutMs?: number;
}

export async function launchBrowser(options: LaunchOptions = {}): Promise<Browser> {
  return chromium.launch({
    headless: options.headless ?? true,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-background-networking",
      "--disable-features=Translate,BackForwardCache",
    ],
  });
}

export async function createSafeContext(
  browser: Browser,
  viewport: ViewportSize,
): Promise<BrowserContext> {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    userAgent:
      "Mozilla/5.0 (compatible; NNDramaBot/1.0; +https://example.com/bot) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    javaScriptEnabled: true,
    ignoreHTTPSErrors: true,
  });

  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = request.url();
    const validated = validateScanUrl(url);
    if (!validated.ok) {
      await route.abort();
      return;
    }
    const type = request.resourceType();
    if (type === "media" || type === "websocket" || type === "manifest") {
      await route.abort();
      return;
    }
    await route.continue();
  });

  return context;
}

/** Resolve the target host and ensure no resolved address is internal. */
export async function assertSafeTarget(rawUrl: string): Promise<string> {
  const validated = validateScanUrl(rawUrl);
  if (!validated.ok) {
    throw new ScanError(validated.code === "malformed" ? "invalid_url" : "invalid_url", validated.reason);
  }

  const { hostname } = validated.url;
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) && !hostname.includes(":")) {
    try {
      const addresses = await dns.lookup(hostname, { all: true });
      for (const addr of addresses) {
        if (isBlockedResolvedAddress(addr.address)) {
          throw new ScanError("invalid_url", "Target resolves to a private network address.");
        }
      }
    } catch (err) {
      if (err instanceof ScanError) throw err;
      throw new ScanError("unreachable", `Could not resolve host: ${hostname}`);
    }
  }

  return validated.url.toString();
}

export async function gotoPage(
  page: Page,
  url: string,
  navigationTimeoutMs: number,
): Promise<void> {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: navigationTimeoutMs });
    await page
      .waitForLoadState("networkidle", { timeout: Math.min(navigationTimeoutMs, 12000) })
      .catch(() => undefined);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/timeout/i.test(message)) throw new ScanError("timeout", message);
    if (/net::ERR|NS_ERROR|ECONN|ENOTFOUND/i.test(message)) throw new ScanError("unreachable", message);
    throw new ScanError("unreachable", message);
  }
}

export class ScanError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ScanError";
  }
}
