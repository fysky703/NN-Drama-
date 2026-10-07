import type {
  ComparisonResult,
  DesignSpec,
  Framework,
  GeneratedProject,
  RefineIteration,
  ScanRecord,
  ViewportName,
} from "@nn/shared";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      /* no body */
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export const api = {
  createScan(payload: {
    url: string;
    framework?: Framework;
    viewports?: { name: ViewportName; width: number; height: number }[];
    aiProvider?: string;
  }) {
    return request<{ scanId: string }>("/api/scans", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getScan(id: string) {
    return request<ScanRecord>(`/api/scans/${id}`);
  },

  status(id: string) {
    return request<{
      id: string;
      status: string;
      progress: ScanRecord["progress"];
      error: string | null;
    }>(`/api/scans/${id}/status`);
  },

  generatePrompt(id: string, framework?: Framework) {
    return request<{ prompt: string }>(`/api/scans/${id}/generate-prompt`, {
      method: "POST",
      body: JSON.stringify({ framework }),
    });
  },

  generateCode(id: string, framework?: Framework) {
    return request<{ project: GeneratedProject }>(`/api/scans/${id}/generate-code`, {
      method: "POST",
      body: JSON.stringify({ framework }),
    });
  },

  compare(id: string, viewport: ViewportName = "desktop") {
    return request<{ comparison: ComparisonResult }>(`/api/scans/${id}/compare`, {
      method: "POST",
      body: JSON.stringify({ viewport }),
    });
  },

  refine(id: string, opts: { target?: number; maxIterations?: number }) {
    return request<{ iterations: RefineIteration[]; comparison: ComparisonResult }>(
      `/api/scans/${id}/refine`,
      { method: "POST", body: JSON.stringify(opts) },
    );
  },

  designSystem(id: string) {
    return request<{ report: ScanRecord["report"]; designSpec: DesignSpec }>(
      `/api/scans/${id}/design-system`,
    );
  },

  listProjects() {
    return request<{ projects: { id: string; name: string; url: string; status: string; createdAt: string; similarity?: number; thumbnail?: string }[] }>(
      "/api/projects",
    );
  },

  renameProject(id: string, name: string) {
    return request<{ project: unknown }>(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
  },

  deleteProject(id: string) {
    return request<{ ok: boolean }>(`/api/projects/${id}`, { method: "DELETE" });
  },

  duplicateProject(id: string) {
    return request<{ projectId: string }>(`/api/projects/${id}`, { method: "POST" });
  },
};

export async function downloadZip(
  files: { path: string; content: string }[],
  name = "generated-website",
): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  for (const f of files) {
    zip.file(f.path, f.content);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.zip`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadText(content: string, filename: string, mime = "text/plain"): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}