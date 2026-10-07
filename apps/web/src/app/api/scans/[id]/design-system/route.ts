import { NextResponse } from "next/server";
import { ensureSpec, ScanServiceError } from "@/lib/service";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const store = await getStore();
  const scan = await store.getScan(id);
  if (!scan) {
    return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  }
  try {
    const spec = await ensureSpec(scan);
    return NextResponse.json({ report: scan.report, designSpec: spec });
  } catch (err) {
    if (err instanceof ScanServiceError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: "Analysis unavailable." }, { status: 500 });
  }
}