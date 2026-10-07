import { NextRequest, NextResponse } from "next/server";
import { userMessage } from "@nn/shared";
import { getStore } from "@/lib/store";
import { isTrustedWorker } from "@/lib/internalAuth";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isTrustedWorker(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: { key?: string; label?: string; state?: string; detail?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const store = await getStore();
  const scan = await store.getScan(id);
  if (!scan) return NextResponse.json({ error: "unknown scan" }, { status: 404 });

  const step = {
    key: body.key ?? "unknown",
    label: body.label ?? body.key ?? "Working…",
    state: (["pending", "active", "done", "error"].includes(body.state ?? "") ? body.state : "active") as
      | "pending"
      | "active"
      | "done"
      | "error",
    detail: body.detail,
    at: new Date().toISOString(),
  };

  const progress = [...(scan.progress ?? [])];
  const existing = progress.findIndex((s) => s.key === step.key);
  if (existing >= 0) progress[existing] = step;
  else progress.push(step);

  await store.patchProgress(id, progress);
  return NextResponse.json({ ok: true });
}