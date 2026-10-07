import { NextRequest, NextResponse } from "next/server";
import { createScanSchema } from "@nn/shared";
import { createScan, ScanServiceError } from "@/lib/service";
import { userMessage } from "@nn/shared";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: userMessage("invalid_url") }, { status: 400 });
  }

  const parsed = createScanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? userMessage("invalid_url") },
      { status: 400 },
    );
  }

  try {
    const { scanId } = await createScan(parsed.data);
    return NextResponse.json({ scanId }, { status: 201 });
  } catch (err) {
    if (err instanceof ScanServiceError) {
      return NextResponse.json({ error: err.message }, { status: statusFor(err.code) });
    }
    return NextResponse.json({ error: userMessage("internal") }, { status: 500 });
  }
}

function statusFor(code: string): number {
  switch (code) {
    case "invalid_url":
      return 400;
    case "rate_limited":
      return 429;
    default:
      return 500;
  }
}