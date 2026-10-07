"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Copy, ExternalLink, FolderOpen, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { api } from "@/lib/client";
import { formatDate, hostname } from "@/lib/utils";
import { Badge, Button, EmptyState } from "@/components/ui";

interface ProjectRow {
  id: string;
  name: string;
  url: string;
  scanId?: string;
  status: string;
  createdAt: string;
  similarity?: number;
  thumbnail?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [name, setName] = useState("");

  const load = useCallback(async () => {
    try {
      const { projects } = await api.listProjects();
      setProjects(projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load projects.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(id: string) {
    if (!confirm("Delete this project and its scans?")) return;
    await api.deleteProject(id);
    await load();
  }

  async function rename(id: string) {
    await api.renameProject(id, name);
    setRenaming(null);
    await load();
  }

  if (!projects) {
    return <div className="p-10 text-center text-sm text-muted">Loading…</div>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted">Previous scans and generated code.</p>
        </div>
        <Button onClick={() => void load()}>
          <RefreshCw size={15} /> Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose/30 bg-rose/10 px-4 py-2.5 text-sm text-rose">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          hint="Scan a website to build your first project."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="panel group overflow-hidden">
              <Link href={`/scan/${project.scanId ?? project.id}`} className="block">
                {project.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.thumbnail}
                    alt={project.name}
                    className="h-36 w-full object-cover object-top transition group-hover:opacity-90"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid h-36 w-full place-items-center bg-elevated">
                    <FolderOpen size={28} className="text-muted" />
                  </div>
                )}
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {renaming === project.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          void rename(project.id);
                        }}
                        className="flex gap-1"
                      >
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="input px-2 py-1 text-sm"
                          autoFocus
                        />
                        <Button className="px-2 py-1 text-xs">Save</Button>
                      </form>
                    ) : (
                      <h3 className="truncate text-sm font-semibold text-ink">{project.name}</h3>
                    )}
                    <p className="mt-0.5 truncate font-mono text-[11px] text-muted">
                      {hostname(project.url)}
                    </p>
                  </div>
                  <Badge tone={project.status === "completed" ? "success" : "brand"}>
                    {project.status}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-muted">
                  <span>{formatDate(project.createdAt)}</span>
                  {project.similarity !== undefined && (
                    <span className="font-mono text-emerald">{project.similarity}%</span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-1 border-t border-line pt-3">
                  <Link
                    href={`/scan/${project.scanId ?? project.id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs text-ink transition hover:bg-elevated"
                  >
                    <ExternalLink size={13} /> Open
                  </Link>
                  <button
                    onClick={() => {
                      setRenaming(project.id);
                      setName(project.name);
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs text-muted transition hover:bg-elevated hover:text-ink"
                  >
                    <Pencil size={13} /> Rename
                  </button>
                  <button
                    onClick={() => {
                      void api.duplicateProject(project.id).then(() => load());
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs text-muted transition hover:bg-elevated hover:text-ink"
                  >
                    <Copy size={13} /> Duplicate
                  </button>
                  <button
                    onClick={() => void remove(project.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs text-rose transition hover:bg-rose/10"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

// In the real app the project page routes to its scan; MVP keeps one scan per project.