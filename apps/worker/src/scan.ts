import type {
  ScanReport,
  ScreenshotRef,
  ViewportName,
  ViewportSize,
} from "@nn/shared";
import { DEFAULT_VIEWPORTS } from "@nn/shared";
import type { RawPageData } from "./extract/types";
import { collectPageData } from "./extract/collect";
import { buildReport } from "./report";
import {
  ScanError,
  assertSafeTarget,
  createSafeContext,
  gotoPage,
  launchBrowser,
} from "./browser";

export interface ScanProgress {
  key: string;
  label: string;
  state: "pending" | "active" | "done" | "error";
  detail?: string;
}

export interface ScanCallbacks {
  progress(step: ScanProgress): Promise<void> | void;
  storeScreenshot(input: {
    viewport: ViewportName;
    png: Buffer;
    width: number;
    height: number;
  }): Promise<ScreenshotRef>;
}

export interface ScanInput {
  url: string;
  viewports?: ViewportSize[];
  navigationTimeoutMs?: number;
}

export async function runScan(
  input: ScanInput,
  callbacks: ScanCallbacks,
): Promise<ScanReport> {
  const started = Date.now();
  const viewports = input.viewports?.length ? input.viewports : DEFAULT_VIEWPORTS;
  const navigationTimeoutMs = input.navigationTimeoutMs ?? 30000;

  const report = async (
    key: string,
    label: string,
    state: ScanProgress["state"],
    detail?: string,
  ) => callbacks.progress({ key, label, state, detail });

  await report("url", "URL validated", "active");
  const safeUrl = await assertSafeTarget(input.url);
  await report("url", "URL validated", "done");

  const browser = await launchBrowser();
  await report("browser", "Browser started", "done");

  const rawByViewport: Partial<Record<ViewportName, RawPageData>> = {};
  const screenshots: ScreenshotRef[] = [];
  let finalUrl = safeUrl;

  try {
    for (const viewport of viewports) {
      const label = capitalize(viewport.name);
      await report(`capture-${viewport.name}`, `${label} capture`, "active");

      const context = await createSafeContext(browser, viewport);
      const page = await context.newPage();

      await gotoPage(page, safeUrl, navigationTimeoutMs);
      finalUrl = page.url();

      const raw = (await page.evaluate(collectPageData)) as RawPageData;
      rawByViewport[viewport.name] = raw;

      await page
        .evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => r())))
        .catch(() => undefined);

      const png = await page.screenshot({ fullPage: true, type: "png" });
      const ref = await callbacks.storeScreenshot({
        viewport: viewport.name,
        png,
        width: raw.scrollWidth || viewport.width,
        height: raw.scrollHeight || viewport.height,
      });
      screenshots.push(ref);

      await context.close();
      await report(`capture-${viewport.name}`, `${label} capture`, "done");
    }

    await report("dom", "DOM extracted", "done");
    await report("css", "CSS analyzed", "done");

    const result = buildReport({
      url: input.url,
      finalUrl,
      rawByViewport,
      screenshots,
      viewports,
      durationMs: Date.now() - started,
    });

    await report("colors", "Colors extracted", "done");
    await report("fonts", "Fonts detected", "done");
    await report("components", "Components detected", "done");
    await report("responsive", "Responsive behavior analyzed", "done");

    return result;
  } finally {
    await browser.close().catch(() => undefined);
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export { ScanError };
