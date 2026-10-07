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

  let body: { error?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const store = await getStore();
  await store.updateScan(id, {
    status: "failed",
    error: userMessage(body.error ?? "internal"),
  });

  return NextResponse.json({ ok: true });
}