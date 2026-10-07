import { NextRequest, NextResponse } from "next/server";
import type { ScreenshotRef } from "@nn/shared";
import { getStore } from "@/lib/store";
import { getStorage } from "@/lib/storage";
import { isTrustedWorker } from "@/lib/internalAuth";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isTrustedWorker(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: { viewport?: string; width?: number; height?: number; dataBase64?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const viewport = (["desktop", "tablet", "mobile"].includes(body.viewport ?? "")
    ? body.viewport
    : "desktop") as ScreenshotRef["viewport"];

  if (!body.dataBase64) return NextResponse.json({ error: "missing image" }, { status: 400 });

  const buffer = Buffer.from(body.dataBase64, "base64");
  const stored = await getStorage().saveScreenshot({
    scanId: id,
    viewport,
    buffer,
  });

  const screenshot: ScreenshotRef = {
    viewport,
    url: stored.url,
    storageKey: stored.storageKey,
    width: body.width ?? 0,
    height: body.height ?? 0,
    capturedAt: new Date().toISOString(),
  };

  const store = await getStore();
  const scan = await store.getScan(id);
  if (scan?.report?.screenshots) {
    const existing = scan.report.screenshots.filter((s) => s.viewport !== viewport);
    await store.updateScan(id, {
      report: { ...scan.report, screenshots: [...existing, screenshot] },
    });
  }

  return NextResponse.json({ screenshot });
}