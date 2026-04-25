# FrictionLab

FrictionLab is an AI conversion research lab for landing pages. It takes a real URL, extracts page evidence, runs synthetic buyer personas through the offer, and turns the results into evidence-backed findings, copy recommendations, a shareable report, and a Presenter Report.

The goal is simple: replace subjective landing-page feedback with a repeatable research workflow teams can inspect, share, and ship against.

![FrictionLab research suite](public/landing/frictionlab-research-suite.png)

## What It Does

- Audits a public landing page URL with server-side extraction.
- Extracts title, meta description, headings, CTAs, links, visible text, and page sections.
- Generates synthetic personas and session timelines with structured AI output.
- Produces prioritized friction findings tied to evidence references or explicit `missing_information`.
- Creates recommendations, copy variants, a shareable report, and a Presenter Report storyboard.
- Persists the entire audit workflow in Postgres with inspectable tool and agent events.
- Captures optional desktop/mobile screenshots with Browserless and stores them in Vercel Blob when both credentials are configured.
- Supports demo/offline operation through `MOCK_MODE=true`.

## Why It Exists

Most AI landing-page feedback is a single generic opinion. FrictionLab is built as a research pipeline:

```mermaid
flowchart LR
  A["Landing URL"] --> B["DOM Evidence Extraction"]
  B --> C["Synthetic Personas"]
  C --> D["Session Simulation"]
  D --> E["Friction Findings"]
  E --> F["Recommendations + Copy Variants"]
  F --> G["Shareable Report"]
  F --> H["Presenter Report"]
```

Every output should be traceable back to page evidence, persona behavior, or a clearly marked information gap.

## Tech Stack

- Next.js App Router
- TypeScript
- Prisma + Postgres
- Vercel AI SDK
- OpenAI and Anthropic provider support
- Tailwind CSS
- GSAP for landing-page motion
- Vitest
- Vercel deployment target

## Architecture

```text
app/
  api/audits                  Create an audit run
  api/audits/[id]             Fetch persisted audit state
  api/audits/[id]/events      Poll workflow/tool events
  api/reports/[shareId]       Public report data
  api/health/readiness        Runtime dependency check
  audit/*                     Audit UI, report and presenter views
  r/[shareId]                 Public share page

lib/
  extraction/                 Server-side page fetch and DOM parsing
  ai/                         Provider routing and structured generation
  workflow/                   Sequential persisted audit runner
  runtime/                    Deploy/runtime readiness checks
  schemas/                    Shared Zod contracts
```

`POST /api/audits` creates a persisted `AuditRun` in `RUNNING` state, responds quickly, and schedules the workflow after the response. The dashboard polls until the run reaches `COMPLETED`, `PARTIAL`, `FAILED`, or `DEMO`.

## Local Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

Required for persisted audits:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

Required for real AI synthesis with direct providers:

```bash
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
FRICTIONLAB_FAST_MODEL="openai:gpt-4.1-mini"
FRICTIONLAB_STRONG_MODEL="anthropic:claude-sonnet-4-5"
```

Optional Vercel AI Gateway routing:

```bash
AI_GATEWAY_API_KEY=""
FRICTIONLAB_FAST_MODEL="openai/gpt-5.4-mini"
FRICTIONLAB_STRONG_MODEL="anthropic/claude-sonnet-4.6"
```

Gateway model ids use `provider/model`. The explicit `gateway:provider/model` prefix is also supported. On Vercel, OIDC-based Gateway auth can satisfy the same readiness check without committing a token.

Runtime behavior:

```bash
MOCK_MODE="false"
DEMO_FALLBACK="true"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Optional integrations:

```bash
BROWSERLESS_TOKEN=""
BLOB_READ_WRITE_TOKEN=""
ENABLE_REMOTION_RENDER="false"
```

## Runtime Readiness

Check whether the deployed app can run real audits:

```bash
curl http://localhost:3000/api/health/readiness
```

Readiness states:

- `ready`: database is configured and the selected mode can run.
- `degraded`: database exists, but the configured model credentials are missing, so audits fall back to template artifacts.
- `blocked`: required runtime dependency is missing, usually `DATABASE_URL`.

## API Surface

```http
POST /api/audits
GET  /api/audits/:id
GET  /api/audits/:id/events
GET  /api/reports/:shareId
POST /api/presenter/:auditRunId
POST /api/presenter/:auditRunId/render
GET  /api/health/readiness
```

Create audit input:

```json
{
  "url": "https://vercel.com",
  "targetAudience": "technical founders evaluating developer platforms",
  "conversionGoal": "Start a trial",
  "businessType": "devtool",
  "language": "en",
  "market": "US",
  "brandTone": "precise, technical and premium",
  "personaCount": 4,
  "demoMode": false
}
```

## Scripts

```bash
npm test
npm run typecheck
npm run build
npm run prisma:migrate
```

## Deployment

The app is built for Vercel.

```bash
npm test
npm run typecheck
npm run build
npx vercel deploy --prod
```

After setting `DATABASE_URL` in Vercel, run production migrations:

```bash
npx prisma migrate deploy
```

More details are in [docs/deployment.md](docs/deployment.md).

## Public Safety

This repository intentionally ignores:

- `.env` and `.env.*`
- `.vercel/`
- `node_modules/`
- `.next/`
- generated local archives and machine metadata

Do not commit provider keys, database URLs, Vercel tokens, or local deployment metadata.

## Current Scope

P0 is a real vertical slice: DOM evidence extraction, structured AI or explicit fallback, optional Browserless screenshot capture with Vercel Blob storage, persisted workflow state, report UI, public share links, and Presenter Report data.

When `BROWSERLESS_TOKEN` and `BLOB_READ_WRITE_TOKEN` are both set, each audit attempts desktop and mobile screenshots. If either credential is missing, FrictionLab records an explicit fallback screenshot event and continues with DOM evidence.

P1 candidates:

- Vercel Workflow / WDK durable execution
- Optional video rendering from Presenter Report scenes
