import type { Page } from "playwright";
import { gotoPage, launchBrowser } from "./browser";

interface Pixel {
  r: number;
  g: number;
  b: number;
}

export interface CompareResult {
  overall: number;
  layout: number;
  colors: number;
  samples: { width: number; height: number };
  method: "measured";
}

const GRID_X = 40;
const GRID_Y = 26;

interface SignatureArg {
  url: string;
  gx: number;
  gy: number;
}

/**
 * Reduce an image (via a data URL inside the page) to a coarse block-colour
 * signature using the browser's own canvas.
 */
async function signatureFromBuffer(page: Page, png: Buffer): Promise<Pixel[]> {
  const url = `data:image/png;base64,${png.toString("base64")}`;
  return page.evaluate<Pixel[], SignatureArg>(
    async ({ url, gx, gy }) => {
      const img = new Image();
      img.src = url;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = gx;
      canvas.height = gy;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("canvas unavailable");
      ctx.drawImage(img, 0, 0, gx, gy);
      const data = ctx.getImageData(0, 0, gx, gy).data;
      const pixels: Pixel[] = [];
      for (let i = 0; i < data.length; i += 4) {
        pixels.push({ r: data[i] as number, g: data[i + 1] as number, b: data[i + 2] as number });
      }
      return pixels;
    },
    { url, gx: GRID_X, gy: GRID_Y },
  );
}

export interface CompareInputs {
  originalUrl: string;
  targetUrl: string;
  navigationTimeoutMs: number;
}

export async function runCompare(inputs: CompareInputs): Promise<CompareResult> {
  const browser = await launchBrowser();
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
    const page = await context.newPage();

    await gotoPage(page, inputs.originalUrl, inputs.navigationTimeoutMs);
    await idleFrame(page);
    const originalPng = await page.screenshot({ fullPage: true });

    await gotoPage(page, inputs.targetUrl, inputs.navigationTimeoutMs);
    await idleFrame(page);
    const targetPng = await page.screenshot({ fullPage: true });

    const [base, target] = await Promise.all([
      signatureFromBuffer(page, originalPng),
      signatureFromBuffer(page, targetPng),
    ]);

    if (base.length !== GRID_X * GRID_Y || target.length !== GRID_X * GRID_Y) {
      throw new Error("Signature mismatch while comparing screenshots.");
    }

    return score(base, target);
  } finally {
    await browser.close().catch(() => undefined);
  }
}

function idleFrame(page: Page): Promise<void> {
  return page
    .evaluate<void>(() => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined))))
    .catch(() => undefined);
}

function score(base: Pixel[], target: Pixel[]): CompareResult {
  const diff: number[] = [];
  for (let i = 0; i < base.length; i++) {
    diff.push(colorDistance(base[i] as Pixel, target[i] as Pixel));
  }

  const overall = 100 - mean(diff) * 100;

  // Layout: compare per-row average colour positionally (structure moves).
  const rows: number[] = [];
  for (let y = 0; y < GRID_Y; y++) {
    let acc = 0;
    for (let x = 0; x < GRID_X; x++) {
      acc += diff[y * GRID_X + x] ?? 0;
    }
    rows.push(acc / GRID_X);
  }
  const layout = 100 - mean(rows) * 100;

  // Colors: compare averaged palette rather than per-pixel.
  const baseAvg = averageColor(base);
  const targetAvg = averageColor(target);
  const colors = 100 - colorDistance(baseAvg, targetAvg) * 100;

  return {
    overall: roundScore(overall),
    layout: roundScore(layout),
    colors: roundScore(colors),
    samples: { width: GRID_X, height: GRID_Y },
    method: "measured",
  };
}

function colorDistance(a: Pixel, b: Pixel): number {
  const d = Math.sqrt(
    Math.pow((a.r ?? 0) - (b.r ?? 0), 2) +
      Math.pow((a.g ?? 0) - (b.g ?? 0), 2) +
      Math.pow((a.b ?? 0) - (b.b ?? 0), 2),
  );
  return d / 441.67;
}

function averageColor(pixels: Pixel[]): Pixel {
  let r = 0;
  let g = 0;
  let b = 0;
  for (const p of pixels) {
    r += p.r as number;
    g += p.g as number;
    b += p.b as number;
  }
  const n = pixels.length;
  return { r: r / n, g: g / n, b: b / n };
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function roundScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n * 10) / 10));
}