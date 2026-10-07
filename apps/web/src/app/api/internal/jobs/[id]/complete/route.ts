import { NextRequest, NextResponse } from "next/server";
import type { ScanReport } from "@nn/shared";
import { getStore } from "@/lib/store";
import { isTrustedWorker } from "@/lib/internalAuth";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isTrustedWorker(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: { report?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  if (!body?.report || typeof body.report !== "object") {
    return NextResponse.json({ error: "missing report" }, { status: 400 });
  }

  const store = await getStore();
  const scan = await store.getScan(id);
  if (!scan) return NextResponse.json({ error: "unknown scan" }, { status: 404 });

  await store.updateScan(id, {
    status: "completed",
    report: body.report as ScanReport,
  });

  return NextResponse.json({ ok: true });
}