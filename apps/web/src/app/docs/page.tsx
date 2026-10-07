import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Braces, Eye, GitCompareArrows, ScanLine, Sparkles } from "lucide-react";

export const metadata: Metadata = { title: "Documentation" };

const STEPS = [
  {
    icon: ScanLine,
    title: "1. Scan",
    body: "Enter a public URL. A sandboxed Playwright browser loads the page at desktop, tablet and mobile sizes, captures screenshots, and extracts the DOM, computed styles, colors, fonts, spacing, components and assets.",
  },
  {
    icon: Eye,
    title: "2. Analyse",
    body: "The extracted data is turned into a design specification: a color system with roles, a typography scale, a spacing scale, layout notes and a component inventory with a component tree.",
  },
  {
    icon: Sparkles,
    title: "3. Prompt",
    body: "A detailed, model-agnostic reconstruction prompt is generated (DESIGN-PROMPT.md). When an AI key is configured, the selected provider can enrich and refine the output.",
  },
  {
    icon: Braces,
    title: "4. Generate code",
    body: "Output Next.js + TypeScript + Tailwind, React + TypeScript + Tailwind, or HTML/CSS/JS. All colors, spacing and the container width become CSS variables so the design is consistent.",
  },
  {
    icon: GitCompareArrows,
    title: "5. Compare & refine",
    body: "The generated site is rendered in a live preview and compared against the original screenshots with a real pixel-level similarity measurement. Use Improve similarity to iterate.",
  },
];

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Documentation</h1>
      <p className="mt-2 text-sm text-muted">
        Scan &rarr; Analyze &rarr; Prompt &rarr; Generate &rarr; Compare. Everything runs
        through real extraction — no mocked results.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.title} className="panel p-5">
            <s.icon size={18} className="text-brand" />
            <h3 className="mt-3 text-sm font-semibold text-ink">{s.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{s.body}</p>
          </div>
        ))}
        <div className="panel flex flex-col justify-between p-5">
          <div>
            <h3 className="text-sm font-semibold text-ink">Run locally</h3>
            <pre className="mt-3 overflow-auto rounded-lg bg-elevated p-3 font-mono text-[11px] text-ink">{`npm install
npm run dev:web
npm run dev:worker`}</pre>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Architecture</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The web app (Next.js) handles the UI and API. Long-running browser
          jobs run in a separate Playwright worker service. Jobs are dispatched
          over HTTP (or a Redis queue in production), screenshots are stored in
          object storage, progress streams back through internal webhooks, and
          results persist in PostgreSQL (with a local file fallback for
          zero-config dev).
        </p>
        <pre className="mt-4 overflow-auto rounded-xl bg-elevated p-4 font-mono text-[11px] leading-relaxed text-ink">{`app/
  web/        Next.js + API routes (Vercel)
  worker/     Playwright browser service (Docker)
packages/
  shared/     Types, URL/SSRF validation, errors
  ai/         AI provider abstraction + prompt/spec builder
  codegen/    Next.js / React / HTML code generators
prisma/       PostgreSQL schema`}</pre>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">APIs</h2>
        <pre className="mt-3 overflow-auto rounded-xl bg-elevated p-4 font-mono text-[11px] leading-relaxed text-ink text-brand">{`POST /api/scans
GET  /api/scans/:id
GET  /api/scans/:id/status
GET  /api/scans/:id/design-system
GET  /api/scans/:id/screenshots
POST /api/scans/:id/generate-prompt
POST /api/scans/:id/generate-code
POST /api/scans/:id/compare
POST /api/scans/:id/refine
GET  /api/projects
DELETE /api/projects/:id`}</pre>
      </section>

      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 text-sm text-brand hover:underline"
      >
        <ArrowRight size={15} /> Start a new scan
      </Link>
    </main>
  );
}