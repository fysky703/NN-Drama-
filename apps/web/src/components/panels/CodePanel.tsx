"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Copy, Download, FileCode2, Search, RefreshCw, FolderTree } from "lucide-react";
import type { GeneratedProject } from "@nn/shared";
import { cn } from "@/lib/utils";
import { downloadText, downloadZip } from "@/lib/client";
import { Button } from "@/components/ui";

const Monaco = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false },
);

function languageFor(path: string): string {
  if (path.endsWith(".tsx")) return "typescript";
  if (path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".js")) return "javascript";
  if (path.endsWith(".mjs")) return "javascript";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".md")) return "markdown";
  return "plaintext";
}

export default function CodePanel({
  project,
  onGenerate,
  loading,
}: {
  project?: GeneratedProject;
  onGenerate: (framework: GeneratedProject["framework"]) => void;
  loading: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const files = useMemo(
    () =>
      (project?.files ?? []).filter((f) =>
        query ? f.path.toLowerCase().includes(query.toLowerCase()) : true,
      ),
    [project, query],
  );

  const active = useMemo(
    () => files.find((f) => f.path === selected) ?? files[0],
    [files, selected],
  );

  const dirName = (path: string) => path.split("/")[0] ?? "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button loading={loading} onClick={() => onGenerate("nextjs")}>
          <RefreshCw size={15} />
          Generate code
        </Button>
        <select
          className="input w-auto"
          defaultValue={project?.framework ?? "nextjs"}
          onChange={(e) => onGenerate(e.target.value as GeneratedProject["framework"])}
        >
          <option value="nextjs">Next.js + TS + Tailwind</option>
          <option value="react">React + TS + Tailwind</option>
          <option value="html">HTML + CSS + JS</option>
        </select>
        <div className="grow" />
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files…"
            className="input w-40 pl-8"
          />
        </div>
        <Button
          variant="outline"
          disabled={!project}
          onClick={() => {
            const current = project?.files.find((f) => f.path === active?.path);
            if (current) {
              void navigator.clipboard.writeText(current.content);
              setCopied(current.path);
              setTimeout(() => setCopied(null), 1500);
            }
          }}
        >
          <Copy size={15} />
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button
          variant="outline"
          disabled={!project}
          onClick={() => project && void downloadZip(project.files, project.entry.split("/").pop() ?? "project")}
        >
          <Download size={15} />
          Download ZIP
        </Button>
      </div>

      {!project ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-20 text-center">
          <FileCode2 size={30} className="mb-2 text-muted" />
          <p className="text-sm text-muted">
            Generate a reusable, typed frontend project from the design system.
          </p>
        </div>
      ) : !active ? (
        <p className="text-sm text-muted">No files match your search.</p>
      ) : (
        <div className="panel grid h-[560px] grid-cols-1 overflow-hidden md:grid-cols-[220px_1fr]">
          <div className="scroll-thin flex max-h-[240px] flex-col overflow-auto border-b border-line md:max-h-none md:border-b-0 md:border-r">
            <div className="flex items-center gap-2 border-b border-line px-3 py-2 text-xs font-medium text-muted">
              <FolderTree size={13} /> Files ({project.files.length})
            </div>
            {files.map((f) => (
              <button
                key={f.path}
                onClick={() => setSelected(f.path)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-left font-mono text-[12px] transition",
                  active.path === f.path
                    ? "bg-brand-soft text-ink ring-1 ring-inset ring-brand/30"
                    : "text-muted hover:bg-elevated hover:text-ink",
                )}
              >
                <span className="shrink-0 text-[9px] uppercase text-muted/60">{dirName(f.path)}</span>
                <span className="truncate">{f.path.split("/").pop()}</span>
              </button>
            ))}
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="flex items-center justify-between border-b border-line px-3 py-2">
              <span className="font-mono text-[12px] text-ink">{active.path}</span>
              <button
                onClick={() => downloadText(active.content, active.path.split("/").pop() ?? "file")}
                className="text-muted transition hover:text-ink"
                title={`Download ${active.path}`}
              >
                <Download size={14} />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <Monaco
                path={active.path}
                language={languageFor(active.path)}
                value={active.content}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 12.5,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}