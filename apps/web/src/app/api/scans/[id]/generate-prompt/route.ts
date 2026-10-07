import { NextRequest, NextResponse } from "next/server";
import { frameworkSchema } from "@nn/shared";
import { generatePrompt, ScanServiceError } from "@/lib/service";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let framework;
  try {
    const body = await req.json();
    framework = frameworkSchema.safeParse(body?.framework).success
      ? (body.framework as "nextjs" | "react" | "html")
      : undefined;
  } catch {
    /* optional body */
  }

  try {
    const prompt = await generatePrompt(id, framework);
    return NextResponse.json({ prompt });
  } catch (err) {
    if (err instanceof ScanServiceError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Prompt generation failed." }, { status: 500 });
  }
}