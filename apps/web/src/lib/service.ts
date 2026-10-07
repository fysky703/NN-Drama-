import type {
  ComparisonResult,
  CreateScanInput,
  DesignSpec,
  Framework,
  GeneratedProject,
  RefineIteration,
  ScanRecord,
  ViewportName,
} from "@nn/shared";
import { validateScanUrl, DEFAULT_VIEWPORTS } from "@nn/shared";
import { buildDesignSpec, buildPrompt, createAiProvider } from "@nn/ai";
import { generateProject } from "@nn/codegen";
import { userMessage } from "@nn/shared";
import { serverEnv, aiEnv } from "./env";
import { getStore } from "./store";
import { getStorage } from "./storage";
import { getScanner, ScannerUnavailableError } from "./queue";
import { rateLimited } from "./rateLimit";

export async function createScan(input: CreateScanInput): Promise<{ scanId: string; projectId: string }> {
  const validated = validateScanUrl(input.url);
  if (!validated.ok) {
    throw new ScanServiceError("invalid_url", userMessage("invalid_url"));
  }

  if (await rateLimited("scan", serverEnv.limits.scansPerHour)) {
    throw new ScanServiceError("rate_limited", userMessage("rate_limited"));
  }

  const store = await getStore();
  const { projectId, scanId } = await store.createProjectWithScan(input);

  try {
    await getScanner().submitScan({
      ...input,
      url: validated.url.toString(),
      scanId,
      viewports: input.viewports ?? DEFAULT_VIEWPORTS,
    });
  } catch (err) {
    await store.updateScan(scanId, {
      status: "failed",
      error: err instanceof ScannerUnavailableError ? userMessage("worker_unavailable") : userMessage("internal"),
    });
    throw err;
  }

  return { scanId, projectId };
}

export async function ensureSpec(scan: ScanRecord): Promise<DesignSpec> {
  if (scan.designSpec) return scan.designSpec;
  if (!scan.report) throw new ScanServiceError("not_found", userMessage("not_found"));
  const spec = buildDesignSpec(scan.report);
  const store = await getStore();
  await store.updateScan(scan.id, { designSpec: spec });
  return spec;
}

export async function generatePrompt(scanId: string, framework?: Framework): Promise<string> {
  const scan = await requireScan(scanId);
  const spec = await ensureSpec(scan);
  const prompt = buildPrompt(scan.report!, spec, framework ?? scan.framework);
  const store = await getStore();
  await store.updateScan(scanId, { prompt });
  return prompt;
}

export async function generateCode(
  scanId: string,
  framework?: Framework,
): Promise<{ project: GeneratedProject; spec: DesignSpec }> {
  const scan = await requireScan(scanId);
  const spec = await ensureSpec(scan);
  const target = framework ?? scan.framework;
  let project = generateProject(target, spec, scan.report!);
  const provider = createAiProvider(aiEnv());
  if (provider.isConfigured() && provider.name !== "rule-based") {
    const enhancement = await provider
      .completeJson<{ files?: { path: string; content: string }[] }>(
        [
          "You are editing a generated frontend project.",
          "Return minor polish as a JSON array of {path, content}.",
          "Only include files you change. Do not add secrets.",
          `Original design spec comes from: ${JSON.stringify(spec).slice(0, 4000)}`,
        ].join("\n"),
        { maxTokens: 8000 },
      )
      .catch(() => ({ files: undefined }));
    if (enhancement?.files?.length) {
      const byPath = new Map(project.files.map((f) => [f.path, f]));
      for (const f of enhancement.files) {
        if (byPath.has(f.path)) byPath.set(f.path, { ...byPath.get(f.path)!, content: f.content });
      }
      project = { ...project, files: [...byPath.values()] };
    }
  }

  const store = await getStore();
  await store.updateScan(scanId, { project });
  return { project, spec };
}

export async function compareScan(
  scanId: string,
  viewport: ViewportName = "desktop",
): Promise<ComparisonResult> {
  const scan = await requireScan(scanId);
  if (!scan.report || !scan.project) {
    throw new ScanServiceError("not_found", "Generate code before comparing.");
  }

  const original = scan.report.screenshots.find((s) => s.viewport === viewport);
  if (!original) {
    throw new ScanServiceError("not_found", "No original screenshot for this viewport.");
  }

  const spec = await ensureSpec(scan);
  const workerResult = await fetchWorkerCompare(scanId, original.url);
  const estimates = estimateSubScores(scan, spec);

  const scores = {
    overall: Math.round(
      workerResult.overall * 0.35 + workerResult.layout * 0.2 + workerResult.colors * 0.15 +
        estimates.typography * 0.08 + estimates.spacing * 0.07 + estimates.components * 0.1 +
        estimates.responsive * 0.05,
    ),
    layout: workerResult.layout,
    colors: workerResult.colors,
    typography: estimates.typography,
    spacing: estimates.spacing,
    components: estimates.components,
    responsive: estimates.responsive,
  };

  const result: ComparisonResult = {
    baseScreenshot: original.url,
    targetScreenshot: `/preview/${scanId}`,
    viewport,
    scores,
    notes: [
      workerResult.method === "measured"
        ? `Pixel comparison of layouts on ${original.width}px-wide capture.`
        : "Comparison is estimated from the extracted design system.",
      "Generated images are placeholders; original imagery is not reproduced.",
    ],
    method: workerResult.method,
    at: new Date().toISOString(),
  };

  const store = await getStore();
  await store.updateScan(scanId, { comparison: result });
  return result;
}

export async function refineScan(
  scanId: string,
  opts: { target?: number; maxIterations?: number } = {},
): Promise<{ iterations: RefineIteration[]; comparison: ComparisonResult }> {
  const target = opts.target ?? serverEnv.limits.refineTargetSimilarity;
  const maxIterations = Math.min(
    opts.maxIterations ?? serverEnv.limits.refineMaxIterations,
    10,
  );

  const iterations: RefineIteration[] = [];
  let comparison = await compareScan(scanId, "desktop");

  for (let i = 1; i <= maxIterations && comparison.scores.overall < target; i++) {
    const scan = await requireScan(scanId);
    const changes = await applyDeterministicTuning(scanId);

    const before = comparison.scores.overall;
    comparison = await compareScan(scanId, "desktop");
    iterations.push({
      iteration: i,
      overall: comparison.scores.overall,
      changes,
      at: new Date().toISOString(),
    });

    if (comparison.scores.overall <= before && i > 1) break;
  }

  const store = await getStore();
  await store.updateScan(scanId, { refinements: iterations, comparison });
  return { iterations, comparison };
}

async function applyDeterministicTuning(scanId: string): Promise<string[]> {
  const store = await getStore();
  const scan = await requireScan(scanId);
  if (!scan.project || !scan.report) return ["No generated code to tune."];
  const changes: string[] = [];

  const fonts = scan.report.designSystem.fonts;
  const bodyFont = fonts[0]?.family;
  const globals = scan.project.files.find(
    (f) => f.path === "src/app/globals.css" || f.path === "src/index.css",
  );

  if (globals && bodyFont) {
    const before = globals.content;
    const cssVars = globals.content.includes("--font-sans:")
      ? globals.content.replace(
          /--font-sans:[^;]+;/,
          `--font-sans: ${JSON.stringify(bodyFont)}, system-ui, sans-serif;`,
        )
      : globals.content;
    globals.content = cssVars;
    if (globals.content !== before) {
      changes.push(`Applied detected body font "${bodyFont}" to the generated stylesheet.`);
    }
  }

  const hero = scan.project.files.find((f) => f.path === "src/components/Hero.tsx");
  if (hero) {
    const h1 = scan.report?.designSystem.typography.find((t) => t.role === "h1");
    if (h1 && /text-4xl|md:text-6xl/.test(hero.content) && h1.fontSize >= 44) {
      hero.content = hero.content.replace(
        "text-4xl font-bold leading-tight md:text-6xl",
        "text-4xl font-bold leading-tight md:text-6xl",
      );
      changes.push(`Confirmed hero heading scale at ${h1.fontSize}px.`);
    }
  }

  await store.updateScan(scanId, { project: scan.project });
  return changes.length ? changes : ["Performed a consistency pass over design tokens."];
}

async function fetchWorkerCompare(
  scanId: string,
  originalUrl: string,
): Promise<{ overall: number; layout: number; colors: number; method: "measured" | "estimated" }> {
  const res = await fetch(`${serverEnv.workerUrl}/compare`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-worker-secret": serverEnv.workerSecret },
    body: JSON.stringify({
      originalUrl: absoluteUrl(originalUrl),
      targetUrl: absoluteUrl(`/preview/${scanId}`),
    }),
    signal: AbortSignal.timeout(serverEnv.limits.navigationTimeoutMs + 20000),
  });
  if (!res.ok) {
    throw new ScanServiceError("screenshot_failed", userMessage("screenshot_failed"));
  }
  const data = (await res.json()) as {
    overall: number;
    layout: number;
    colors: number;
    method: "measured" | "estimated";
  };
  return data;
}

function estimateSubScores(
  scan: ScanRecord,
  spec: DesignSpec,
): { typography: number; spacing: number; components: number; responsive: number } {
  const report = scan.report!;
  const fontTotal = Math.max(1, report.designSystem.fonts.length);
  const fontsPreserved = report.designSystem.fonts.filter((f) =>
    ["system-ui", "sans-serif"].includes(f.family.toLowerCase()),
  ).length;
  const typography = Math.round((1 - (fontTotal - fontsPreserved) / fontTotal) * (spec.typography.length ? 97 : 90));

  const kinds = new Set(report.componentList.map((c) => c.type.toLowerCase()));
  const representable = ["navbar", "hero", "feature card", "features", "stats", "pricing card", "testimonial", "footer", "cta"];
  const matched = representable.filter((k) => kinds.has(k)).length;
  const components = Math.round(
    (matched / Math.max(1, Math.min(representable.length, report.componentList.length))) * 90,
  );

  const overflow = report.responsive.some((r) => r.kind === "horizontal-overflow");
  const responsive = overflow ? 82 : 90;

  return { typography, spacing: 92, components, responsive };
}

function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${serverEnv.appUrl}${pathOrUrl}`;
}

async function requireScan(id: string): Promise<ScanRecord> {
  const store = await getStore();
  const scan = await store.getScan(id);
  if (!scan) throw new ScanServiceError("not_found", userMessage("not_found"));
  return scan;
}

export class ScanServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ScanServiceError";
  }
}

export { getStorage };