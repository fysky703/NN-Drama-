import fsp from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import type {
  CreateScanInput,
  ProgressStep,
  ProjectRecord,
  ScanRecord,
} from "@nn/shared";
import { DEFAULT_VIEWPORTS, normalizeUrl } from "@nn/shared";
import type { ProjectPatch, ScanPatch, Store } from "./types";

/**
 * Zero-config JSON file store used when DATABASE_URL is not set (dev / local).
 * Not for production: use the Prisma + PostgreSQL store instead.
 */
export class FileStore implements Store {
  private readonly dir: string;
  private projectsPath: string;
  private scansPath: string;
  private chain: Promise<unknown> = Promise.resolve();

  constructor(dir: string) {
    this.dir = dir;
    this.projectsPath = path.join(dir, "projects.json");
    this.scansPath = path.join(dir, "scans.json");
  }

  private async init(): Promise<void> {
    await fsp.mkdir(this.dir, { recursive: true });
    await Promise.all([
      ensure(this.projectsPath, []),
      ensure(this.scansPath, []),
    ]);
  }

  private async withLock<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.chain.then(fn, fn);
    this.chain = run.catch(() => undefined);
    return run;
  }

  async createProjectWithScan(
    input: CreateScanInput,
  ): Promise<{ projectId: string; scanId: string }> {
    await this.init();
    return this.withLock(async () => {
      const now = new Date().toISOString();
      const projectId = nanoid(12);
      const scanId = nanoid(12);
      const url = normalizeUrl(input.url);

      const project: ProjectRecord = {
        id: projectId,
        name: hostLabel(url),
        url,
        scanId,
        createdAt: now,
        updatedAt: now,
        status: "queued",
        framework: input.framework ?? "nextjs",
      };

      const scan: ScanRecord = {
        id: scanId,
        projectId,
        url,
        status: "queued",
        framework: input.framework ?? "nextjs",
        createdAt: now,
        updatedAt: now,
        progress: [],
        refinements: [],
        aiProvider: input.aiProvider ?? "rule-based",
      };

      await writeJson(this.projectsPath, [project, ...(await readJson<ProjectRecord[]>(this.projectsPath))]);
      await writeJson(this.scansPath, [scan, ...(await readJson<ScanRecord[]>(this.scansPath))]);
      return { projectId, scanId };
    });
  }

  async getScan(id: string): Promise<ScanRecord | null> {
    await this.init();
    const scans = await readJson<ScanRecord[]>(this.scansPath);
    return scans.find((s) => s.id === id) ?? null;
  }

  async listScans(): Promise<ScanRecord[]> {
    await this.init();
    return readJson<ScanRecord[]>(this.scansPath);
  }

  async updateScan(id: string, patch: ScanPatch): Promise<ScanRecord> {
    await this.init();
    return this.withLock(async () => {
      const scans = await readJson<ScanRecord[]>(this.scansPath);
      const idx = scans.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error("scan not found");
      const current = scans[idx]!;
      const updated: ScanRecord = {
        ...current,
        ...patch,
        progress: patch.progress ?? current.progress,
        refinements: patch.refinements ?? current.refinements,
        updatedAt: new Date().toISOString(),
      };
      scans[idx] = updated;
      await writeJson(this.scansPath, scans);
      this.applyProjectFromScan(updated).catch(() => undefined);
      return updated;
    });
  }

  async patchProgress(id: string, steps: ProgressStep[]): Promise<ScanRecord> {
    return this.updateScan(id, { progress: steps });
  }

  async listProjects(): Promise<ProjectRecord[]> {
    await this.init();
    return readJson<ProjectRecord[]>(this.projectsPath);
  }

  async getProject(id: string): Promise<ProjectRecord | null> {
    await this.init();
    const projects = await readJson<ProjectRecord[]>(this.projectsPath);
    return projects.find((p) => p.id === id) ?? null;
  }

  async updateProject(id: string, patch: ProjectPatch): Promise<ProjectRecord | null> {
    await this.init();
    return this.withLock(async () => {
      const projects = await readJson<ProjectRecord[]>(this.projectsPath);
      const idx = projects.findIndex((p) => p.id === id);
      if (idx === -1) return null;
      projects[idx] = { ...projects[idx]!, ...patch, updatedAt: new Date().toISOString() };
      await writeJson(this.projectsPath, projects);
      return projects[idx]!;
    });
  }

  async deleteProject(id: string): Promise<boolean> {
    await this.init();
    return this.withLock(async () => {
      const projects = await readJson<ProjectRecord[]>(this.projectsPath);
      const remaining = projects.filter((p) => p.id !== id);
      if (remaining.length === projects.length) return false;
      const scans = await readJson<ScanRecord[]>(this.scansPath);
      await writeJson(this.projectsPath, remaining);
      await writeJson(
        this.scansPath,
        scans.filter((s) => s.projectId !== id),
      );
      return true;
    });
  }

  private async applyProjectFromScan(scan: ScanRecord): Promise<void> {
    await this.withLock(async () => {
      const projects = await readJson<ProjectRecord[]>(this.projectsPath);
      const idx = projects.findIndex((p) => p.id === scan.projectId);
      if (idx === -1) return;
      const project = projects[idx]!;
      projects[idx] = {
        ...project,
        status: scan.status,
        similarity: scan.comparison?.scores.overall ?? project.similarity,
        thumbnail: scan.report?.screenshots.find((s) => s.viewport === "desktop")?.url ?? project.thumbnail,
        updatedAt: new Date().toISOString(),
      };
      await writeJson(this.projectsPath, projects);
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

async function ensure(file: string, fallback: unknown): Promise<void> {
  try {
    await fsp.access(file);
  } catch {
    await writeJson(file, fallback);
  }
}

async function readJson<T>(file: string): Promise<T> {
  try {
    const raw = await fsp.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return [] as unknown as T;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  const tmp = `${file}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
  await fsp.writeFile(tmp, JSON.stringify(value, null, 2));
  await fsp.rename(tmp, file);
}

export function jsonStore(): Store {
  const dir = process.env.STORE_DIR ?? path.join(process.cwd(), ".data");
  return new FileStore(dir);
}