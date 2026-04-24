# FrictionLab MVP Design

Date: 2026-04-24

## Decision Summary

FrictionLab will be built as a fresh Vercel-first Next.js App Router application at the repository root: `/Users/estevito/Desktop/frictionLab`.

The existing Codex pack remains reference material and should be moved or copied into `docs/source-pack/` during implementation setup. The deployable app root should contain the Next.js project folders directly:

```txt
app/
components/
lib/
prisma/
docs/
  source-pack/
```

This keeps the Vercel deployment path simple, avoids monorepo overhead, and makes the hackathon demo easier to harden.

## Product Scope

FrictionLab is an AI conversion research agent. A user enters a public landing page URL, target audience, and conversion goal. The product runs a synthetic user swarm through the page, extracts evidence, simulates persona sessions, aggregates friction findings, generates prioritized recommendations and copy variants, then publishes a shareable report plus a Presenter Report storyboard.

The MVP is real-first and must run a live vertical slice against public URLs. Demo and mock behavior are fallbacks for blocked pages, missing credentials, and presentation safety, not the primary product path.

P0 user flow:

1. Enter URL, target audience, conversion goal, business type, language or market, tone, and persona count.
2. Start a real audit against a public URL, or load a demo audit as fallback.
3. Watch a workflow timeline with extraction, screenshot, persona, session, findings, report, and presenter steps.
4. Review four persona cards and open persona session timelines.
5. Inspect evidence-backed findings and conversion score.
6. Review prioritized fixes, hero rewrites, CTA variants, FAQs, and implementation checklist.
7. Open a shareable report.
8. Open a Presenter Report with scenes, narration, captions, and disabled/fallback video render state.

Non-goals:

- Auth, billing, teams, workspaces, full crawler, analytics integrations, Slack or Notion integrations.
- Mandatory video rendering.
- Real browser click automation.
- A chatbot-style interface.

## Architecture

Use Next.js App Router, Tailwind, shadcn/ui, TypeScript, Prisma, Postgres-compatible schema, Vercel AI SDK with direct OpenAI/Anthropic keys for structured outputs, Vercel Blob for optional screenshot/video assets, and Vercel Workflow when stable.

Vercel Workflow is the preferred hackathon-track architecture, but the first implementation should include a sequential runner with the same persisted step/status contract. This protects the demo while keeping the system ready to switch to Workflow.

Current Vercel docs describe Workflow as a beta managed platform built on WDK, so it should be integrated after the real extraction, AI audit, API contracts, persistence, and report flow are reliable.

Primary runtime shape:

```txt
POST /api/audits
  -> validate input
  -> create AuditRun
  -> if demoMode or MOCK_MODE, create seeded LaunchPilot run
  -> otherwise start runAuditWorkflow or sequential fallback

runAuditWorkflow
  -> extractPage
  -> captureScreenshots
  -> generatePersonas
  -> runPersonaSessions
  -> aggregateFindings
  -> scoreConversion
  -> generateRecommendations
  -> generateCopyVariants
  -> generateReport
  -> generatePresenterReport
  -> publishShareableReport
```

The UI should not depend on whether the backend uses Vercel Workflow or the sequential fallback. It reads run state, events, and report data from stable API routes.

## Components And Boundaries

Controllers/API routes stay thin. Validation, seeding, workflow execution, extraction, AI calls, and report assembly belong in `lib/`.

Proposed folders:

```txt
app/
  page.tsx
  audit/new/page.tsx
  audit/[id]/page.tsx
  audit/[id]/report/page.tsx
  r/[shareId]/page.tsx
  api/audits/route.ts
  api/audits/[id]/route.ts
  api/audits/[id]/events/route.ts
  api/reports/[shareId]/route.ts
  api/presenter/[auditRunId]/route.ts
  api/presenter/[auditRunId]/render/route.ts

components/
  workflow-timeline.tsx
  persona-card.tsx
  swarm-dashboard.tsx
  snapshot-viewer.tsx
  finding-card.tsx
  evidence-drawer.tsx
  score-ring.tsx
  impact-effort-matrix.tsx
  report/
  presenter/

lib/
  db.ts
  env.ts
  mock-mode.ts
  schemas/
  extraction/
  screenshots/
  ai/
  workflow/
  demo/

prisma/
  schema.prisma
```

Keep abstractions concrete. Do not create generic workflow, agent, or repository frameworks until the project has at least three real uses for them.

## Data Model

Use Prisma with Json fields where speed and flexibility matter. Required models:

- AuditRun
- PageSnapshot
- Screenshot
- Persona
- PersonaSession
- SessionEvent
- Finding
- Recommendation
- CopyVariant
- Report
- PresenterReport
- PresenterScene
- AgentRun
- ToolCall
- ShareableReport

The data contract should be driven by Zod schemas first, then mirrored in Prisma.

Important guardrail: every finding must include evidence references or be categorized as `missing_information`. The app must never invent pricing, testimonials, guarantees, integrations, logos, or product claims.

## AI And Evidence

AI calls should use structured outputs validated by Zod. The first stable implementation should support direct OpenAI and Anthropic provider keys through the Vercel AI SDK:

- Fast model: personas and sessions.
- Strong model: aggregation, recommendations, report, and presenter.
- Retry once on schema validation failure.
- Fall back to deterministic templates or seeded data only when AI is unavailable or schema validation fails after retry.
- Persist AgentRun and ToolCall status for the timeline/event feed.

AI prompts must separate observed evidence from inferred risk and suggested fixes. If information is absent from extracted page evidence, the output marks it as missing instead of fabricating it.

## Extraction And Screenshots

Page extraction:

- Server-side fetch with timeout and user-agent.
- Cheerio/Readability-style visible content extraction.
- Section detection into ordered `PageSection[]`.
- Graceful fallback to demo snapshot when fetch fails and `DEMO_FALLBACK=true`.

Screenshots:

- P0 uses DOM evidence and visible text extraction.
- Browserless Screenshot API if `BROWSERLESS_TOKEN` exists is P1.
- Vercel Blob upload if `BLOB_READ_WRITE_TOKEN` exists is P1.
- Record screenshot failure as data and continue with DOM evidence.
- Do not make local Playwright mandatory in production.

E2B or another sandbox should only be considered later if the product requires real browser agents that Vercel cannot support. The MVP does not require that.

## UI Design

Visual direction: Vercel + Linear + research lab. Premium dark mode, restrained typography, subtle borders, dense command-center layout, workflow and evidence as the agent representation.

Screens:

- App intro / audit setup.
- Live swarm dashboard.
- Persona session detail.
- Findings dashboard.
- Final report.
- Copy Lab.
- Presenter Report.
- Shareable report.

The UI should be real-data-first and responsive. The demo run for LaunchPilot must include realistic data for all major screens, but it is a fallback and demo safety path.

## Error Handling

The product should be designed around partial completion:

- Screenshot failure does not fail audit.
- Fetch failure can use demo fallback.
- AI failure uses safe template outputs.
- Workflow failure still allows displaying a seeded or partial report.
- Remotion/video failure never blocks the Presenter Report.

All P0 routes must return useful errors or fallback states that the UI can render.

## Testing And Verification

Initial verification targets:

- Build passes.
- `MOCK_MODE=true` works without external APIs.
- `MOCK_MODE=false` runs a real URL through extraction and AI when credentials are present.
- Demo audit loads.
- API routes validate input and return stable contracts.
- Mock data validates against Zod schemas.
- Shareable report route renders.
- Presenter Report renders with video disabled.

Once live integrations exist, test at least one public page and one blocked/failing page.

## Implementation Order

1. Scaffold root Next.js app and preserve source pack under docs.
2. Add Zod schemas and Prisma schema.
3. Add extraction for real public URLs.
4. Add AI functions with structured outputs and fallbacks.
5. Add sequential workflow runner with persisted statuses.
6. Add API routes with real mode, mock mode, and demo seed.
7. Build UI and navigation for the real P0 flow plus fallback states.
8. Add Presenter Report generation and render-disabled UI.
9. Validate LaunchPilot seed and real URL flows.
10. Harden demo and deploy to Vercel.

## References Checked

- Vercel Workflow docs, last updated 2026-02-27: https://vercel.com/docs/workflow
- Vercel AI Gateway structured outputs docs, last updated 2026-03-07: https://vercel.com/docs/ai-gateway/sdks-and-apis/anthropic-messages-api/structured-outputs
- Vercel Blob SDK docs: https://vercel.com/docs/vercel-blob/using-blob-sdk
