# NN Drama

Turn any public webpage into editable code.

NN Drama scans a public website with a sandboxed Playwright browser, extracts
its **design system** (colors, typography, spacing, layout, components,
assets, responsive behavior), generates a structured AI **design
specification** and a detailed **reconstruction prompt**, then generates a
production-ready **Next.js / React / HTML** frontend you can preview, compare
against the original, refine and download.

> Only scan websites you own or have permission to reproduce. You are
> responsible for respecting copyright, trademarks and asset licenses.

## Stack

| Layer      | Technology                                            |
| ---------- | ----------------------------------------------------- |
| Web / API  | Next.js 15 (App Router) + TypeScript + Tailwind       |
| Editor     | Monaco Editor                                         |
| Scanner    | Playwright Chromium worker (separate service / Docker)|
| Queue      | HTTP dispatch (dev) or Redis + BullMQ (production)    |
| Database   | PostgreSQL + Prisma, with a zero-config file fallback |
| Storage    | Local `public/scans` (dev) or S3-compatible (prod)    |
| AI         | Provider abstraction: OpenAI / Anthropic / Gemini / offline rule-based |

## Monorepo layout

```
apps/
  web/        Next.js application + API routes
  worker/     Playwright browser scanner service (Docker)
packages/
  shared/     Shared types, zod schemas, SSRF-safe URL validation, errors
  ai/         AI provider abstraction, design-spec + prompt builders
  codegen/    Next.js / React / HTML code generators
prisma/       PostgreSQL schema
```

## Quick start (local)

```bash
npm install --ignore-scripts   # avoid downloading browsers during web dev
npm run dev:web                # Next.js on :3000
npm run dev:worker             # scanner worker on :8787 (needs Chromium)
```

For the worker to run Playwright locally you also need a Chromium build:

```bash
cd apps/worker && npx playwright install chromium
```

Default configuration needs **no environment variables**:

- Store: file fallback under `.data/`
- Storage: `public/scans/`
- Queue: direct HTTP to the worker
- AI: offline rule-based analyser (design spec + prompt work with zero keys)

## Environment variables

Copy `.env.example` to `.env` and fill in what you need. All private values
are read from environment variables — nothing is hardcoded.

| Variable | Purpose |
| -------- | ------- |
| `DATABASE_URL` | PostgreSQL connection string (empty → file store) |
| `STORE_DRIVER` | `file` or `prisma` |
| `STORAGE_DRIVER` | `local` or `s3` |
| `S3_*` | S3-compatible storage credentials |
| `QUEUE_DRIVER` | `inline` or `redis` |
| `REDIS_URL` | Redis connection for the production queue |
| `WORKER_URL` | Base URL of the Playwright worker |
| `WORKER_SHARED_SECRET` | Secret shared between web + worker |
| `AI_PROVIDER` | `none`, `openai`, `anthropic` or `gemini` |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` | Provider keys |
| `RATE_LIMIT_*`, `MAX_*`, `REFINE_*` | Cost & abuse controls |

## API

```
POST /api/scans                    Create a scan job
GET  /api/scans/:id                Full scan record
GET  /api/scans/:id/status         Progress + status (streamed, not faked)
GET  /api/scans/:id/design-system  Extracted design tokens + AI spec
GET  /api/scans/:id/screenshots    Captured viewport screenshots
POST /api/scans/:id/generate-prompt
POST /api/scans/:id/generate-code
POST /api/scans/:id/compare        Pixel-level similarity vs original
POST /api/scans/:id/refine         Improve-similarity loop
GET  /api/projects
DELETE /api/projects/:id
```

## Deployment (GitHub → Vercel)

The `web` app deploys to Vercel. The Playwright `worker` must run on a
long-lived host (Railway / Fly.io / Render) because browser jobs cannot live
inside Vercel serverless functions.

```bash
# worker image
cd apps/worker
docker build -t nn-drama-worker .
docker run -p 8787:8787 --env-file .env nn-drama-worker
```

Set `WORKER_URL`, `WORKER_SHARED_SECRET`, `INTERNAL_CALLBACK_URL`, `DATABASE_URL`
and storage/AI variables in both deployments.

## Phases

- **Phase 1 (shipped):** scanning pipeline, design extraction, component
  detection, results dashboard, AI prompt generator, Next.js/React/HTML
  codegen, live preview, ZIP download, project history, visual comparison +
  similarity score + refine loop (vs the generated preview), provider
  abstraction with offline fallback, SSRF-safe scanning, rate limiting.
- **Phase 4 (not yet):** authentication, teams, billing, Redis queue consumer.

## License

The generated output belongs to you. NN Drama itself is for educational and
in-house use — respect the original websites you scan.