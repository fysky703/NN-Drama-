"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type {
  ComparisonResult,
  DesignSpec,
  Framework,
  GeneratedProject,
  RefineIteration,
  ScanRecord,
} from "@nn/shared";
import {
  Archive,
  Boxes,
  Braces,
  FileText,
  ImageIcon,
  LayoutDashboard,
  MonitorSmartphone,
  Palette,
  RefreshCw,
  Sparkles,
  Tablet,
  Type,
} from "lucide-react";
import { api } from "@/lib/client";
import { cn, formatDate, hostname } from "@/lib/utils";
import { Badge, Button, Spinner, Stat } from "@/components/ui";
import ScanProgress from "@/components/ScanProgress";
import DesignPanel from "@/components/panels/DesignPanel";
import ScreenshotPanel from "@/components/panels/ScreenshotPanel";
import ComponentPanel from "@/components/panels/ComponentPanel";
import AssetPanel from "@/components/panels/AssetPanel";
import PromptPanel from "@/components/panels/PromptPanel";
import CodePanel from "@/components/panels/CodePanel";
import ComparePanel from "@/components/panels/ComparePanel";
import ResponsivePanel from "@/components/panels/ResponsivePanel";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "design", label: "Design System", icon: Palette },
  { id: "screenshots", label: "Screenshots", icon: ImageIcon },
  { id: "components", label: "Components", icon: Boxes },
  { id: "assets", label: "Assets", icon: Archive },
  { id: "responsive", label: "Responsive", icon: Tablet },
  { id: "prompt", label: "AI Prompt", icon: Sparkles },
  { id: "code", label: "Code", icon: Braces },
  { id: "compare", label: "Comparison", icon: MonitorSmartphone },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function Dashboard({ scanId }: { scanId: string }) {
  const [scan, setScan] = useState<ScanRecord | null>(null);
  const [spec, setSpec] = useState<DesignSpec | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [project, setProject] = useState<GeneratedProject | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [iterations, setIterations] = useState<RefineIteration[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    const data = await api.getScan(scanId);
    setScan(data);
    setSpec(data.designSpec ?? null);
    setPrompt(data.prompt ?? null);
    setProject(data.project ?? null);
    setComparison(data.comparison ?? null);
    setIterations(data.refinements ?? []);
    return data;
  }, [scanId]);

  useEffect(() => {
    load().catch((err) =>
      setError(err instanceof Error ? err.message : "Could not load scan."),
    );
  }, [load]);

  useEffect(() => {
    if (scan?.status === "queued" || scan?.status === "running") {
      if (pollRef.current) return;
      pollRef.current = setInterval(() => {
        void load().then((data) => {
          if (data.status === "completed" || data.status === "failed") {
            if (pollRef.current) {
              clearInterval(pollRef.current);
              pollRef.current = null;
            }
          }
        });
      }, 1600);
    } else if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [scan?.status, load]);

  const isLive = scan?.status === "running" || scan?.status === "queued";

  async function run(name: string, fn: () => Promise<void>) {
    setError(null);
    setBusy(name);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  async function generatePrompt(framework?: Framework) {
    await run("prompt", async () => {
      const { prompt: p } = await api.generatePrompt(scanId, framework);
      setPrompt(p);
    });
  }

  async function generateCode(framework?: Framework) {
    await run("code", async () => {
      const { project: proj } = await api.generateCode(scanId, framework);
      setProject(proj);
    });
  }

  async function compare() {
    await run("compare", async () => {
      if (!project) await generateCode();
      const { comparison: c } = await api.compare(scanId);
      setComparison(c);
    });
  }

  async function refine(target: number) {
    await run("refine", async () => {
      const result = await api.refine(scanId, { target });
      setComparison(result.comparison);
      setIterations(result.iterations);
    });
  }

  if (!scan) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted">
        <Spinner className="mr-2 h-5 w-5" /> Loading scan…
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-6">
      <header className="mb-5 flex flex-wrap items-start gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-bold tracking-tight text-ink">
              {scan.report?.title || <Link href={scan.url} className="text-brand">{hostname(scan.url)}</Link>}
            </h1>
            <Badge
              tone={
                scan.status === "completed"
                  ? "success"
                  : scan.status === "failed"
                    ? "error"
                    : "brand"
              }
            >
              {scan.status}
            </Badge>
            <Badge tone="neutral">{scan.framework}</Badge>
            {scan.report?.meta.scannedAt && (
              <span className="text-xs text-muted">{formatDate(scan.report.meta.scannedAt)}</span>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <a
              href={scan.url}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs text-brand hover:underline"
            >
              {scan.url}
            </a>
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select
            className="input w-auto px-2 py-1.5 text-xs"
            value={project?.framework ?? scan.framework}
            onChange={(e) => void generateCode(e.target.value as Framework)}
          >
            <option value="nextjs">Next.js + Tailwind</option>
            <option value="react">React + Tailwind</option>
            <option value="html">HTML + CSS + JS</option>
          </select>
          <Button
            variant="outline"
            disabled={!scan.report}
            loading={busy === "prompt"}
            onClick={() => void generatePrompt(project?.framework)}
          >
            <Sparkles size={15} />
            Generate Prompt
          </Button>
          <Button
            disabled={!scan.report}
            loading={busy === "code"}
            onClick={() => void generateCode(project?.framework)}
          >
            <RefreshCw size={15} />
            Generate Code
          </Button>
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-rose/30 bg-rose/10 px-4 py-2.5 text-sm text-rose">
          {error}
        </div>
      )}

      {scan.status === "failed" ? (
        <div className="panel flex flex-col items-center gap-2 py-16 text-center">
          <div className="text-sm font-medium text-ink">Scan failed</div>
          <p className="text-sm text-muted">{scan.error ?? "Unknown error."}</p>
          <Link href="/" className="text-sm text-brand hover:underline">
            Try another URL
          </Link>
        </div>
      ) : isLive ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScanProgress steps={scan.progress} />
          </div>
          <div className="space-y-4">
            <div className="panel p-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <MonitorSmartphone size={15} className="text-brand" />
                Scanning {scan.url}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted/70">
                Our sandboxed browser is loading the page, capturing screenshots,
                and analysing the DOM, CSS and design system. This can take 30–90 seconds.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[210px_1fr]">
          <nav className="scroll-thin flex gap-1 overflow-x-auto lg:flex-col">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition",
                  tab === t.id
                    ? "bg-elevated text-ink ring-1 ring-inset ring-line"
                    : "text-muted hover:bg-elevated/60 hover:text-ink",
                )}
              >
                <t.icon size={15} />
                {t.label}
              </button>
            ))}
          </nav>

          <section className="min-w-0 animate-fade-in">
            {tab === "overview" && (
              <Overview
                scan={scan}
                iterations={iterations}
                onOpenTab={(t) => setTab(t)}
              />
            )}
            {tab === "design" && <DesignPanel spec={spec ?? undefined} report={scan.report} />}
            {tab === "screenshots" && (
              <ScreenshotPanel screenshots={scan.report?.screenshots ?? []} />
            )}
            {tab === "components" && (
              <ComponentPanel list={scan.report?.componentList ?? []} tree={scan.report?.components} />
            )}
            {tab === "assets" && <AssetPanel assets={scan.report?.assets ?? []} />}
            {tab === "responsive" && (
              <ResponsivePanel changes={scan.report?.responsive ?? []} />
            )}
            {tab === "prompt" && (
              <PromptPanel
                prompt={prompt ?? undefined}
                loading={busy === "prompt"}
                onGenerate={() => void generatePrompt(project?.framework)}
              />
            )}
            {tab === "code" && (
              <CodePanel
                project={project ?? undefined}
                loading={busy === "code"}
                onGenerate={(f) => void generateCode(f)}
              />
            )}
            {tab === "compare" && (
              <ComparePanel
                scanId={scanId}
                comparison={comparison ?? undefined}
                comparing={busy === "compare"}
                refining={busy === "refine"}
                onCompare={() => void compare()}
                onRefine={(target) => void refine(target)}
              />
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function Overview({
  scan,
  iterations,
  onOpenTab,
}: {
  scan: ScanRecord;
  iterations: RefineIteration[];
  onOpenTab: (tab: Tab) => void;
}) {
  const report = scan.report;
  if (!report) {
    return <p className="text-sm text-muted">Report not available.</p>;
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Stat label="Headings" value={report.page.headings.length} />
        <Stat label="Links" value={report.page.links} />
        <Stat label="Forms" value={report.page.forms} />
        <Stat label="Images" value={report.page.images} />
        <Stat label="Sections" value={report.page.sections} />
        <Stat label="Duration" value={`${(report.meta.durationMs / 1000).toFixed(1)}s`} />
        <Stat label="HTML size" value={`${(report.meta.htmlBytes / 1024).toFixed(0)}KB`} />
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold">Page structure</h3>
        <div className="panel p-4">
          {report.page.headings.length === 0 ? (
            <p className="text-sm text-muted">No headings found.</p>
          ) : (
            <ol className="space-y-1">
              {report.page.headings.slice(0, 24).map((h, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm"
                  style={{ paddingLeft: `${(h.level - 1) * 16}px` }}
                >
                  <span className="rounded bg-elevated px-1.5 font-mono text-[10px] text-muted">
                    h{h.level}
                  </span>
                  <span className="truncate text-ink">{h.text || "(empty)"}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold">Typography</h3>
        <div className="flex flex-wrap gap-2">
          {report.designSystem.fonts.slice(0, 6).map((f) => (
            <div key={f.family} className="panel flex items-center gap-2 px-3 py-2">
              <Type size={14} className="text-brand" />
              <span className="text-sm font-medium text-ink" style={{ fontFamily: f.family }}>
                {f.family}
              </span>
              <span className="text-[11px] text-muted">
                w{f.weights.join(", w")} · {f.usageCount} uses
              </span>
            </div>
          ))}
        </div>
      </section>

      {report.screenshots.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold">Captures</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {report.screenshots.map((s) => (
              <button
                key={s.viewport}
                onClick={() => onOpenTab("screenshots")}
                className="group panel overflow-hidden text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.url}
                  alt={`${s.viewport} screenshot`}
                  className="h-36 w-full object-cover object-top transition group-hover:opacity-90"
                  loading="lazy"
                />
                <div className="px-3 py-2 text-xs capitalize text-muted">
                  {s.viewport} · {s.width}×{s.height}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {iterations.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold">Refinement history</h3>
          <div className="panel overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-xs text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Iteration</th>
                  <th className="px-4 py-2 font-medium">Similarity</th>
                  <th className="px-4 py-2 font-medium">Changes</th>
                </tr>
              </thead>
              <tbody>
                {iterations.map((it) => (
                  <tr key={it.iteration} className="border-b border-line/50 last:border-0">
                    <td className="px-4 py-2 font-medium text-ink">#{it.iteration}</td>
                    <td className="px-4 py-2 font-mono text-xs text-emerald">{it.overall}%</td>
                    <td className="px-4 py-2 text-xs text-muted">
                      {it.changes.join(" · ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}