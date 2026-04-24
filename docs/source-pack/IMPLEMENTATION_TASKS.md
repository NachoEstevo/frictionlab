# FrictionLab — Implementation Tasks

## Cut rule brutal

Si una tarea no aparece en el demo de 2 minutos, no es P0.

Si una feature amenaza deploy, se corta.

Si una integración externa requiere auth compleja, se corta.

Si video render bloquea el audit report, se corta.

## P0 — Must ship

### Product/core

- [ ] Nombre visible: FrictionLab.
- [ ] One-liner visible.
- [ ] Audit setup: URL, target audience, conversion goal, business type, language/market, tone, persona count.
- [ ] Demo mode button: “Load demo audit”.
- [ ] `MOCK_MODE=true` support.

### UI

- [ ] Landing/app intro.
- [ ] Audit setup screen.
- [ ] Live swarm dashboard.
- [ ] Workflow timeline.
- [ ] Persona cards.
- [ ] Persona session detail.
- [ ] Evidence drawer.
- [ ] Findings dashboard.
- [ ] Final report.
- [ ] Copy lab.
- [ ] Shareable report.
- [ ] Presenter Report storyboard/deck.

### Backend

- [ ] `POST /api/audits`.
- [ ] `GET /api/audits/[id]`.
- [ ] `GET /api/audits/[id]/events`.
- [ ] `GET /api/reports/[shareId]`.
- [ ] `POST /api/presenter/[auditRunId]`.
- [ ] Seeded demo run for LaunchPilot.

### Data/schemas

- [ ] Zod schemas for audit input.
- [ ] Zod schemas for page snapshot.
- [ ] Zod schemas for personas.
- [ ] Zod schemas for sessions.
- [ ] Zod schemas for findings.
- [ ] Zod schemas for recommendations.
- [ ] Zod schemas for report.
- [ ] Zod schemas for presenter scenes/report.
- [ ] Prisma schema.

### Agent workflow

- [ ] Create audit run.
- [ ] Extract page HTML/text.
- [ ] Detect page sections.
- [ ] Capture screenshot or mark fallback.
- [ ] Generate personas.
- [ ] Run synthetic sessions.
- [ ] Aggregate findings.
- [ ] Score conversion.
- [ ] Generate recommendations.
- [ ] Generate copy variants.
- [ ] Generate report.
- [ ] Generate Presenter Report.
- [ ] Publish shareable report.

### Guardrails

- [ ] Every finding has evidence refs or `missing_information`.
- [ ] AI outputs validated with Zod.
- [ ] AI failures fallback to mock/template outputs.
- [ ] Screenshot failure does not fail audit.
- [ ] Fetch failure does not fail demo.
- [ ] Workflow failure does not fail report display.

## P1 — Should ship if stable

- [ ] Browserless screenshot integration.
- [ ] Vercel Blob upload.
- [ ] Mobile + desktop screenshot tabs.
- [ ] Impact/effort matrix.
- [ ] “Emerging findings” during live run.
- [ ] Copy variants: conservative, bold, founder-friendly.
- [ ] Presenter script with scene timings.
- [ ] Presenter share tab inside final report.
- [ ] Markdown export.
- [ ] Better loading/error states.

## P2 — Wow if time remains

- [ ] Animated swarm replay.
- [ ] Remotion video render.
- [ ] Render status polling.
- [ ] MP4 upload to Blob.
- [ ] GitHub Issues export.
- [ ] MCP endpoint exposing report/finding tools.
- [ ] PDF export.

## Do not build

- [ ] Auth.
- [ ] Billing.
- [ ] Teams/workspaces.
- [ ] Complex onboarding.
- [ ] Full site crawler.
- [ ] Real browser click automation.
- [ ] Heatmaps.
- [ ] Analytics integrations.
- [ ] Hotjar/GA integrations.
- [ ] Slack/Discord bot.
- [ ] Linear OAuth.
- [ ] Notion OAuth.
- [ ] Mandatory Remotion render.
- [ ] Perfect PDF export.

---

# Phase plan

## Phase 0 — Product definition

Objective: Freeze the scope and narrative.

Tasks:

- [ ] Confirm final name: FrictionLab.
- [ ] Confirm track: Vercel Workflow / WDK.
- [ ] Confirm MVP and cut list.
- [ ] Define sample company: LaunchPilot.
- [ ] Define happy path demo.

Done:

- A single clear project statement.
- A two-minute demo script.
- A seeded demo scenario.

Risk:

- Overthinking.

Cut if behind:

- Any extra positioning docs.

## Phase 1 — UI with mocks

Objective: Make it look like a winning product before backend.

Tasks:

- [ ] Generate UI with v0.
- [ ] Add mock data file.
- [ ] Wire navigation.
- [ ] Build dashboard screens.
- [ ] Build report screens.
- [ ] Build Presenter Report screen.

Done:

- Full mock demo navigable.

Risk:

- UI looks generic.

Cut if behind:

- Settings page.
- Nonessential filters.

## Phase 2 — Schemas/data model

Objective: Create the contract.

Tasks:

- [ ] Add Zod schemas.
- [ ] Add Prisma models.
- [ ] Validate mock data against schemas.
- [ ] Add `pnpm test:schemas`.

Done:

- Mock data validates.
- Types shared by UI/backend.

Risk:

- Too much normalization.

Cut if behind:

- Use Json fields.

## Phase 3 — Basic backend

Objective: Create and read audit runs.

Tasks:

- [ ] `POST /api/audits`.
- [ ] `GET /api/audits/[id]`.
- [ ] `GET /api/audits/[id]/events`.
- [ ] Demo seed function.
- [ ] Mock mode behavior.

Done:

- UI can create/load a run.

Risk:

- DB/migration issues.

Cut if behind:

- Use mock/in-memory fallback for demo.

## Phase 4 — Agent/tools

Objective: Generate structured AI outputs.

Tasks:

- [ ] `generatePersonas`.
- [ ] `runPersonaSession`.
- [ ] `aggregateFindings`.
- [ ] `generateRecommendations`.
- [ ] `generateCopyVariants`.
- [ ] `generateReport`.
- [ ] Zod retry/fallback wrapper.

Done:

- AI can produce a complete report from page evidence.

Risk:

- Generic output.

Cut if behind:

- Use templates for copy variants.

## Phase 5 — Page extraction/screenshots

Objective: Get real evidence.

Tasks:

- [ ] Fetch HTML with timeout/user-agent.
- [ ] Cheerio/Readability extraction.
- [ ] Detect sections.
- [ ] Browserless screenshot.
- [ ] Blob upload.
- [ ] DOM snapshot fallback.

Done:

- Works on at least 2 tested public pages.

Risk:

- Browser/screenshot flakiness.

Cut if behind:

- Mobile screenshot.
- Blob upload.

## Phase 6 — Synthetic sessions

Objective: Make the swarm believable.

Tasks:

- [ ] 4 personas.
- [ ] Session timeline per persona.
- [ ] Scores per category.
- [ ] Evidence refs.
- [ ] Final verdict.

Done:

- Persona detail pages feel real and evidence-backed.

Risk:

- Sessions repetitive.

Cut if behind:

- Reduce to 3 personas.

## Phase 7 — Report generator

Objective: Client-ready output.

Tasks:

- [ ] Executive summary.
- [ ] Conversion score.
- [ ] Top blockers.
- [ ] Recommendations.
- [ ] Copy variants.
- [ ] Implementation checklist.
- [ ] Share page.

Done:

- Report can be shared and demoed.

Risk:

- Report too long.

Cut if behind:

- Appendices.

## Phase 8 — Workflow/WDK

Objective: Align strongly with Track 1.

Tasks:

- [ ] Implement workflow or sequential fallback.
- [ ] Persist each step.
- [ ] Show step statuses in UI.
- [ ] Retry/fallback failed steps.

Done:

- Demo visibly shows agentic workflow.

Risk:

- SDK integration overhead.

Cut if behind:

- Use sequential runner but keep workflow-shaped status model.

## Phase 9 — Presenter/video layer

Objective: Add wow without risking core.

Tasks:

- [ ] Generate Presenter Report from audit report.
- [ ] Add 5–7 scene storyboard.
- [ ] Add 45–60s script.
- [ ] Add captions and key visuals.
- [ ] Add Presenter tab/page.
- [ ] Optional: Remotion render if stable.

Done:

- Presenter Report works even without video render.

Risk:

- Remotion consumes time.

Cut if behind:

- MP4 render; keep deck/storyboard.

## Phase 10 — Demo hardening

Objective: Make it impossible to embarrass you.

Tasks:

- [ ] Test deploy.
- [ ] Test mock mode.
- [ ] Test demo run.
- [ ] Test screenshot failure.
- [ ] Test AI failure.
- [ ] Prepare exact demo script.
- [ ] Prepare fallback clicks.

Done:

- You can demo with or without external services.

Risk:

- Last-minute changes.

Cut if behind:

- Stop adding features. Polish only.

