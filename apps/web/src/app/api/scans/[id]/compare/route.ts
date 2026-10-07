import { NextRequest, NextResponse } from "next/server";
import type { ViewportName } from "@nn/shared";
import { compareSchema } from "@nn/shared";
import { compareScan, ScanServiceError } from "@/lib/service";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let viewport: ViewportName = "desktop";
  try {
    const parsed = compareSchema.safeParse(await req.json());
    if (parsed.success) viewport = parsed.data.viewport ?? "desktop";
  } catch {
    viewport = "desktop";
  }

  try {
    const comparison = await compareScan(id, viewport);
    return NextResponse.json({ comparison });
  } catch (err) {
    if (err instanceof ScanServiceError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Comparison failed." }, { status: 500 });
  }
}