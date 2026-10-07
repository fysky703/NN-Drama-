import { NextResponse } from "next/server";
import { generateProject } from "@nn/codegen";
import { buildDesignSpec } from "@nn/ai";
import { getStore } from "@/lib/store";
import { userMessage } from "@nn/shared";

export const runtime = "nodejs";

/** Serves a self-contained HTML render of the generated project for preview. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const store = await getStore();
  const scan = await store.getScan(id);
  if (!scan?.report) {
    return new NextResponse(userMessage("not_found"), { status: 404 });
  }

  const spec = buildDesignSpec(scan.report);
  const project = generateProject("html", spec, scan.report);
  const html = project.files.find((f) => f.path === "index.html")?.content;

  if (!html) {
    return new NextResponse("Preview unavailable.", { status: 500 });
  }

  const styles = project.files.find((f) => f.path === "styles.css")?.content ?? "";
  const script = project.files.find((f) => f.path === "script.js")?.content ?? "";

  const inline = html
    .replace(/<link rel="stylesheet" href="styles.css" \/>/, `<style>${styles}</style>`)
    .replace(/<script src="script.js"><\/script>/, `<script>${script}</script>`);

  return new NextResponse(inline, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'self' 'unsafe-inline' data: blob:; img-src * data: blob:; font-src * data:;",
    },
  });
}