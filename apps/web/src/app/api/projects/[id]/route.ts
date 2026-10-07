import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const store = await getStore();
  const ok = await store.deleteProject(id);
  return NextResponse.json({ ok });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let name = "";
  try {
    const body = await req.json();
    name = String(body?.name ?? "").trim();
  } catch {
    /* ignore */
  }
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  const store = await getStore();
  const project = await store.updateProject(id, { name });
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  return NextResponse.json({ project });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const store = await getStore();
  const project = await store.getProject(id);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const scans = await store.listScans();
  const scan = scans.find((s) => s.projectId === id);
  if (!scan) return NextResponse.json({ error: "No scan for this project." }, { status: 400 });

  const { projectId } = await store.createProjectWithScan({
    url: scan.url,
    framework: scan.framework,
  });

  const dupProject = await store.getProject(projectId);
  const dupScan = await store.getScan(dupProject?.scanId ?? "");
  if (!dupScan || dupScan.id === "") {
    return NextResponse.json({ error: "Could not duplicate." }, { status: 500 });
  }
  if (scan.report) await store.updateScan(dupScan.id, { report: scan.report });
  if (scan.designSpec) await store.updateScan(dupScan.id, { designSpec: scan.designSpec });
  if (scan.project) await store.updateScan(dupScan.id, { project: scan.project });
  if (scan.prompt) await store.updateScan(dupScan.id, { prompt: scan.prompt });
  if (scan.comparison) await store.updateScan(dupScan.id, { comparison: scan.comparison });
  await store.updateScan(dupScan.id, { status: scan.status });

  return NextResponse.json({ projectId }, { status: 201 });
}