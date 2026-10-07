"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Globe, Loader2, ScanSearch, Settings2 } from "lucide-react";
import { api } from "@/lib/client";
import { EXAMPLE_URLS, LEGAL_NOTICE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "./ui";

const FRAMEWORK_OPTIONS = [
  { id: "nextjs", label: "Next.js + TypeScript + Tailwind" },
  { id: "react", label: "React + TypeScript + Tailwind" },
  { id: "html", label: "HTML + CSS + JavaScript" },
] as const;

const VIEWPORT_PRESETS = [
  { name: "desktop", label: "Desktop 1440×900", width: 1440, height: 900 },
  { name: "tablet", label: "Tablet 768×1024", width: 768, height: 1024 },
  { name: "mobile", label: "Mobile 390×844", width: 390, height: 844 },
] as const;

function saveRecent(scanId: string) {
  try {
    const recent = JSON.parse(localStorage.getItem("nn-drama-recent") ?? "[]") as string[];
    localStorage.setItem(
      "nn-drama-recent",
      JSON.stringify([scanId, ...recent.filter((s) => s !== scanId)].slice(0, 5)),
    );
  } catch {
    /* ignore */
  }
}

export default function ScanForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [framework, setFramework] = useState<"nextjs" | "react" | "html">("nextjs");
  const [viewports, setViewports] = useState<string[]>(["desktop", "mobile"]);
  const [advanced, setAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleViewport = (name: string) =>
    setViewports((prev) =>
      prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name],
    );

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const { scanId } = await api.createScan({
        url,
        framework,
        viewports: VIEWPORT_PRESETS.filter((v) => viewports.includes(v.name)).map((v) => ({
          name: v.name,
          width: v.width,
          height: v.height,
        })),
      });
      saveRecent(scanId);
      router.push(`/scan/${scanId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="panel overflow-hidden"
      >
        <div className="relative">
          <Globe size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a website URL…"
            autoFocus
            className="w-full border-0 bg-transparent px-12 py-4 text-base text-ink outline-none placeholder:text-muted/60"
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-line p-4 sm:flex-row sm:items-center">
          <Button type="submit" loading={loading} className="sm:min-w-[180px]">
            <ScanSearch size={16} />
            Scan Website
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setAdvanced((a) => !a)}
            className="justify-start"
          >
            <Settings2 size={15} />
            Advanced Settings
            <ChevronDown size={15} className={cn("transition-transform", advanced && "rotate-180")} />
          </Button>
        </div>

        {advanced && (
          <div className="grid gap-4 border-t border-line p-4 sm:grid-cols-2">
            <div>
              <label className="label">Output format</label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value as typeof framework)}
                className="input"
              >
                {FRAMEWORK_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Viewports to scan</label>
              <div className="flex flex-wrap gap-1.5">
                {VIEWPORT_PRESETS.map((v) => (
                  <label
                    key={v.name}
                    className={cn(
                      "cursor-pointer rounded-lg border px-3 py-1.5 text-xs transition",
                      viewports.includes(v.name)
                        ? "border-brand/50 bg-brand-soft text-ink"
                        : "border-line text-muted hover:bg-elevated",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={viewports.includes(v.name)}
                      onChange={() => toggleViewport(v.name)}
                    />
                    {v.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 rounded-lg bg-brand-soft/50 px-3 py-2 text-xs text-muted">
              <Loader2 size={13} className="text-brand" />
              Scanning runs in a sandboxed browser. Only publicly accessible
              http(s) URLs are accepted.
            </div>
          </div>
        )}

        {error && (
          <div className="border-t border-rose/30 bg-rose/10 px-4 py-3 text-sm text-rose">
            {error}
          </div>
        )}
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Try:</span>
        {EXAMPLE_URLS.map((u) => (
          <button
            key={u}
            onClick={() => setUrl(u)}
            className="rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-brand/50 hover:text-ink"
          >
            {u.replace("https://", "")}
          </button>
        ))}
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-muted/70">{LEGAL_NOTICE}</p>
    </div>
  );
}