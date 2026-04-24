# Codex Master Prompt — FrictionLab

Usá este prompt como instrucción base para Codex.

---

You are implementing **FrictionLab**, a Vercel hackathon project.

Act as a senior full-stack engineer, senior AI engineer and product-minded builder. The priority is to ship a stable, polished, demoable product in one week. Do not overbuild.

## Product

FrictionLab is an AI conversion research agent. A user pastes a public landing page URL, describes the target audience and conversion goal, and FrictionLab runs a synthetic user swarm through the page before real users bounce.

The system must feel like a real agentic workflow, not a chatbot. It should:

1. Capture/parse a landing page.
2. Extract evidence.
3. Generate synthetic personas.
4. Simulate separate evaluation sessions.
5. Aggregate friction findings.
6. Prioritize fixes.
7. Generate copy variants.
8. Produce a shareable report.
9. Generate a Presenter Report with storyboard/deck and optional video render.

## Hackathon strategy

Primary track: **Vercel Workflow / WDK**.

Supporting stack:

- Next.js App Router.
- v0-generated UI.
- Tailwind + shadcn/ui.
- Vercel AI SDK.
- AI Gateway.
- Prisma + Postgres.
- Vercel Blob.
- Browserless Screenshot API optional.
- Cheerio + Readability.
- Remotion optional only for video; React storyboard/deck is mandatory fallback.

## Hard constraints

- Demo stability is more important than completeness.
- Every external failure must have a fallback.
- The app must work entirely with `MOCK_MODE=true`.
- Use structured outputs with Zod.
- Every finding must cite evidence refs or be marked as `missing_information`.
- Never invent pricing, testimonials, integrations, guarantees or product claims.
- Avoid generic landing-page advice.
- Do not build auth, billing, team accounts, full crawler, Slack bot, analytics integrations or mandatory video rendering.
- The UI must not look like a chatbot.

## Minimum winning product

A deployed Vercel app where a user can:

1. Enter URL, target audience and conversion goal.
2. See a live workflow timeline.
3. See 4 synthetic persona cards in a swarm dashboard.
4. Open each persona session timeline.
5. See findings with evidence.
6. See conversion score and friction map.
7. See prioritized fixes, hero rewrites, CTA variants and FAQs.
8. Open a shareable report.
9. Open a Presenter Report: a deck/storyboard with a 45–60s script, scene cards, captions and optional video render status.

## Required folder structure

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
    presenter-report.tsx
    presenter-storyboard.tsx
    scene-card.tsx
    video-preview.tsx
    render-status.tsx
lib/
  db.ts
  env.ts
  mock-mode.ts
  schemas/
    audit.ts
    page.ts
    persona.ts
    session.ts
    finding.ts
    report.ts
    presenter.ts
  extraction/
    fetch-page-html.ts
    extract-visible-content.ts
    detect-page-sections.ts
  screenshots/
    capture-browserless.ts
    capture-local-playwright.ts
    screenshot-fallback.ts
  ai/
    model.ts
    prompts.ts
    generate-personas.ts
    run-persona-session.ts
    aggregate-findings.ts
    generate-recommendations.ts
    generate-copy-variants.ts
    generate-report.ts
    generate-presenter-report.ts
  workflow/
    run-audit-workflow.ts
    start-audit.ts
  demo/
    seed-run.ts
    mock-data.ts
prisma/
  schema.prisma
```

## API endpoints

### POST `/api/audits`

Input:

```ts
{
  url: string;
  targetAudience: string;
  conversionGoal: string;
  businessType: "saas" | "agency" | "ecommerce" | "devtool" | "fintech" | "other";
  language?: string;
  market?: string;
  brandTone?: string;
  personaCount?: number;
  demoMode?: boolean;
}
```

Behavior:

- Validate input.
- Create `AuditRun`.
- If `demoMode` or `MOCK_MODE=true`, create a seeded run and return it.
- Otherwise start the audit workflow.
- Return `{ auditRunId, status }`.

### GET `/api/audits/[id]`

Return full run state:

- AuditRun.
- PageSnapshot.
- Screenshots.
- Personas.
- Sessions.
- Findings.
- Recommendations.
- CopyVariants.
- Report.
- PresenterReport.

### GET `/api/audits/[id]/events`

Return recent `AgentRun` and `ToolCall` events for polling.

### GET `/api/reports/[shareId]`

Return public shareable report data.

### POST `/api/presenter/[auditRunId]`

Generate or regenerate Presenter Report from an existing report.

### POST `/api/presenter/[auditRunId]/render`

Optional. Start video render if Remotion is installed/configured. Must be safe to return fallback storyboard if render is disabled.

## Workflow

Implement `runAuditWorkflow(input)`:

```txt
startAudit
→ extractPage
→ captureScreenshots
→ generatePersonas
→ runPersonaSessions
→ aggregateFindings
→ scoreConversion
→ generateRecommendations
→ generateCopyVariants
→ generateReport
→ generatePresenterReport
→ publishShareableReport
→ finish
```

If Workflow SDK is unavailable or hard to wire, implement a sequential fallback runner that updates DB statuses. Keep the UI contract identical.

## AI behavior

Use `generateObject` for structured outputs.

Use model env vars:

```txt
FRICTIONLAB_FAST_MODEL
FRICTIONLAB_STRONG_MODEL
```

Default behavior:

- Fast model: personas and sessions.
- Strong model: aggregation, recommendations, report and presenter.

Every AI call must:

- Use a Zod schema.
- Retry once if schema validation fails.
- Continue with fallback data if AI fails.
- Store AgentRun/ToolCall status.

## Page extraction

- Use server-side fetch with timeout and user-agent.
- Extract title, meta description, headings, buttons/links and visible text.
- Use Cheerio/Readability.
- Convert page into ordered `PageSection[]`.
- If fetch fails, use demo snapshot if `DEMO_FALLBACK=true`.

## Screenshot behavior

- Primary: Browserless Screenshot API if `BROWSERLESS_TOKEN` exists.
- Store image in Vercel Blob if `BLOB_READ_WRITE_TOKEN` exists.
- If screenshot fails, create Screenshot record with status `FAILED` and fallback type `DOM_SNAPSHOT`.
- UI must continue.
- Do not make Playwright mandatory in production.

## Presenter/video layer

Mandatory MVP:

- Generate a Presenter Report from the audit report.
- Produce 5–7 storyboard scenes.
- Produce a 45–60s script.
- Produce captions per scene.
- Produce deck-style React UI.
- Produce a shareable presenter tab/page.

Optional if stable:

- Remotion render to MP4.
- Render status UI.
- Download/share video link.

Required fallback:

- If video render fails or is disabled, show storyboard/deck and script.
- Never block the main audit report on video render.

## Database

Use Prisma. Prefer Json fields where speed matters. Required models:

- AuditRun.
- PageSnapshot.
- Screenshot.
- Persona.
- PersonaSession.
- SessionEvent.
- Finding.
- Recommendation.
- CopyVariant.
- Report.
- PresenterReport.
- PresenterScene.
- AgentRun.
- ToolCall.
- ShareableReport.

## Demo data

Create a realistic seeded run for a fictional B2B SaaS landing page called **LaunchPilot**.

Seeded data must include:

- Page snapshot.
- Desktop/mobile screenshot placeholders.
- 4 personas.
- Session timelines.
- Findings.
- Recommendations.
- Copy variants.
- Report.
- Presenter Report with storyboard and script.

## UI requirements

Style:

- Vercel + Linear + research lab.
- Premium dark mode.
- Cards, timelines, evidence drawers, status badges.
- No generic chatbot UI.

Screens:

- Landing/app intro.
- Audit setup.
- Live swarm dashboard.
- Persona session detail.
- Findings dashboard.
- Final report.
- Copy lab.
- Presenter report/storyboard.
- Shareable report.

## Acceptance criteria

The build passes.

`MOCK_MODE=true` works.

A demo audit can be loaded without external APIs.

A live audit can run best-effort with fallbacks.

The UI shows:

- Workflow status.
- Personas.
- Session timelines.
- Evidence-backed findings.
- Report.
- Presenter deck/storyboard.

Every P0 route must handle errors gracefully.

## Implementation order

1. UI with mock data.
2. Zod schemas.
3. Prisma data model.
4. API routes with mock mode.
5. Seeded demo run.
6. AI functions with structured outputs.
7. Extraction/screenshot with fallbacks.
8. Workflow/sequential runner.
9. Presenter Report.
10. Polish and demo hardening.

Do not proceed to optional Remotion video until all P0 flows are stable.

