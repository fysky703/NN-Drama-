import type {
  CreateScanInput,
  ProjectRecord,
  ScanRecord,
} from "@nn/shared";
import type { ProjectPatch, ScanPatch, Store } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
// The @prisma/client package is an optional runtime dependency: the Prisma
// store is only used when STORE_DRIVER=prisma and DATABASE_URL are set
// (production). `any` keeps this module type-checkable without it installed.
type PrismaClient = any;

/**
 * PostgreSQL store via Prisma. Only loaded when STORE_DRIVER=prisma
 * and DATABASE_URL is set (production). Requires `prisma generate`.
 */
export class PrismaStore implements Store {
  private clientPromise?: Promise<PrismaClient>;

  private async client(): Promise<PrismaClient> {
    if (!this.clientPromise) {
      // @ts-ignore optional dependency
      this.clientPromise = import(/* webpackIgnore: true */ "@prisma/client").then(async (mod) => {
        const client = new mod.PrismaClient();
        await client.$connect();
        return client;
      });
    }
    return this.clientPromise;
  }

  async createProjectWithScan(input: CreateScanInput): Promise<{ projectId: string; scanId: string }> {
    const db = await this.client();
    const project = await db.project.create({
      data: {
        name: hostLabel(input.url),
        url: input.url,
        status: "queued",
        framework: input.framework ?? "nextjs",
      },
    });
    const scan = await db.scan.create({
      data: {
        projectId: project.id,
        url: input.url,
        status: "queued",
        framework: input.framework ?? "nextjs",
        aiProvider: input.aiProvider ?? "rule-based",
        data: {},
      },
    });
    return { projectId: project.id, scanId: scan.id };
  }

  async getScan(id: string): Promise<ScanRecord | null> {
    const db = await this.client();
    const scan = await db.scan.findUnique({ where: { id } });
    return scan ? (scan.data as ScanRecord) : null;
  }

  async listScans(): Promise<ScanRecord[]> {
    const db = await this.client();
    const scans = await db.scan.findMany({ orderBy: { createdAt: "desc" } });
    return scans.map((s: { data: unknown }) => s.data as ScanRecord);
  }

  async updateScan(id: string, patch: ScanPatch): Promise<ScanRecord> {
    const db = await this.client();
    const existing = await db.scan.findUnique({ where: { id } });
    if (!existing) throw new Error("scan not found");
    const current = existing.data as ScanRecord;
    const updated: ScanRecord = {
      ...current,
      ...patch,
      progress: patch.progress ?? current.progress,
      refinements: patch.refinements ?? current.refinements,
      updatedAt: new Date().toISOString(),
    };
    await db.scan.update({
      where: { id },
      data: { data: updated, status: updated.status },
    });
    this.applyProjectFromScan(updated).catch(() => undefined);
    return updated;
  }

  async patchProgress(id: string, steps: ScanRecord["progress"]): Promise<ScanRecord> {
    return this.updateScan(id, { progress: steps });
  }

  async listProjects(): Promise<ProjectRecord[]> {
    const db = await this.client();
    const projects = await db.project.findMany({ orderBy: { createdAt: "desc" } });
    return projects.map((p: ProjectRecord) => p);
  }

  async getProject(id: string): Promise<ProjectRecord | null> {
    const db = await this.client();
    const project = await db.project.findUnique({ where: { id } });
    if (!project) return null;
    const scan = await db.scan.findFirst({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });
    return { ...project, scanId: scan?.id };
  }

  async updateProject(id: string, patch: ProjectPatch): Promise<ProjectRecord | null> {
    const db = await this.client();
    return db.project.update({ where: { id }, data: patch });
  }

  async deleteProject(id: string): Promise<boolean> {
    const db = await this.client();
    await db.scan.deleteMany({ where: { projectId: id } });
    await db.project.delete({ where: { id } });
    return true;
  }

  private async applyProjectFromScan(scan: ScanRecord): Promise<void> {
    const db = await this.client();
    await db.project.update({
      where: { id: scan.projectId },
      data: {
        status: scan.status,
        similarity: scan.comparison?.scores.overall,
        thumbnail: scan.report?.screenshots.find((s) => s.viewport === "desktop")?.url,
      },
    });
  }
}

function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").split(".")[0] ?? url;
  } catch {
    return url;
  }
}