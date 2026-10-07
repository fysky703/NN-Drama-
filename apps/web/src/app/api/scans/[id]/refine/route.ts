import { NextRequest, NextResponse } from "next/server";
import { refineSchema } from "@nn/shared";
import { refineScan, ScanServiceError } from "@/lib/service";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let opts: { target?: number; maxIterations?: number } = {};
  try {
    const body = await req.json();
    opts = refineSchema.safeParse(body)?.data ?? {};
  } catch {
    /* optional body */
  }

  try {
    const result = await refineScan(id, opts);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ScanServiceError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Refinement failed." }, { status: 500 });
  }
}