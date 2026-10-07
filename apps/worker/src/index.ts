import express from "express";
import type { ScreenshotRef, ViewportName, ViewportSize } from "@nn/shared";
import { runScan, type ScanProgress } from "./scan";
import { ScanError } from "./browser";
import { runCompare } from "./compare";

const PORT = Number(process.env.PORT ?? 8787);
const SECRET = process.env.WORKER_SHARED_SECRET ?? "change-me-in-production";
const DEFAULT_CALLBACK = process.env.INTERNAL_CALLBACK_URL ?? "http://localhost:3000";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "nn-drama-worker", uptime: process.uptime() });
});

app.post("/compare", async (req, res) => {
  const secret = req.header("x-worker-secret");
  if (secret !== SECRET) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const body = req.body as { originalUrl?: string; targetUrl?: string };
  if (!body?.originalUrl || !body?.targetUrl) {
    res.status(400).json({ error: "originalUrl and targetUrl are required" });
    return;
  }
  try {
    const result = await runCompare({
      originalUrl: body.originalUrl,
      targetUrl: body.targetUrl,
      navigationTimeoutMs: Number(process.env.SCAN_NAVIGATION_TIMEOUT_MS ?? "30000"),
    });
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

interface ScanRequestBody {
  scanId: string;
  url: string;
  viewports?: ViewportSize[];
  callbackUrl?: string;
}

app.post("/scan", (req, res) => {
  const secret = req.header("x-worker-secret");
  if (secret !== SECRET) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const body = req.body as ScanRequestBody;
  if (!body?.scanId || !body?.url) {
    res.status(400).json({ error: "scanId and url are required" });
    return;
  }

  const callbackUrl = (body.callbackUrl ?? DEFAULT_CALLBACK).replace(/\/$/, "");

  // Respond immediately; process asynchronously (queue-style).
  res.status(202).json({ accepted: true, scanId: body.scanId });

  void processScan(body, callbackUrl).catch((err) => {
    // Errors are reported to the web app via the fail callback.
    console.error(`[scan ${body.scanId}] failed`, err);
  });
});

async function processScan(body: ScanRequestBody, callbackUrl: string): Promise<void> {
  const base = `${callbackUrl}/api/internal/jobs/${body.scanId}`;

  const post = async (path: string, payload: unknown) => {
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-worker-secret": SECRET },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`callback ${path} failed with ${res.status}`);
    }
    return res;
  };

  const progress = async (step: ScanProgress) => {
    await post("/progress", step);
  };

  const storeScreenshot = async (input: {
    viewport: ViewportName;
    png: Buffer;
    width: number;
    height: number;
  }): Promise<ScreenshotRef> => {
    const res = await post("/screenshot", {
      viewport: input.viewport,
      width: input.width,
      height: input.height,
      dataBase64: input.png.toString("base64"),
    });
    const json = (await res.json()) as { screenshot: ScreenshotRef };
    return json.screenshot;
  };

  try {
    const report = await runScan(
      { url: body.url, viewports: body.viewports },
      { progress, storeScreenshot },
    );
    await progress({ key: "report", label: "Report assembled", state: "done" });
    await post("/complete", { report });
  } catch (err) {
    const code = err instanceof ScanError ? err.code : "internal";
    const message = err instanceof Error ? err.message : "Unknown error";
    await post("/fail", { error: code, detail: message }).catch((e) =>
      console.error(`[scan ${body.scanId}] failed to report failure`, e),
    );
  }
}

app.listen(PORT, () => {
  console.log(`NN Drama worker listening on :${PORT}`);
});
