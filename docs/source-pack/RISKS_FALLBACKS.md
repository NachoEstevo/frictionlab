# FrictionLab — Risks and Fallbacks

| Risk | Probability | Impact | Mitigation | Demo fallback |
|---|---:|---:|---|---|
| Screenshot fails | High | High | Browserless + timeout + status record | DOM evidence map |
| Playwright breaks deploy | Medium | High | Do not require Playwright in prod | Browserless or no screenshot |
| URL fetch blocked | High | High | user-agent + timeout + finalUrl handling | Load demo audit |
| JS-heavy page has little HTML | High | Medium | Screenshot + metadata extraction | DOM snapshot / demo |
| Bot protection | Medium | High | Do not fight it | Preseeded run |
| CORS confusion | Medium | Medium | Server-side fetch only | demo mode |
| AI output generic | High | High | evidence-only prompts + schemas | templates |
| AI schema fails | Medium | High | retry once + fallback data | seeded outputs |
| Findings hallucinate | Medium | High | require evidenceRefs | mark missing_information |
| Report too long | Medium | Medium | top 5 first + collapsible sections | executive summary only |
| Workflow integration takes too long | Medium | High | sequential runner with same status model | mock workflow events |
| DB migration fails | Medium | High | Prisma simple + Json fields | mock data file |
| Blob upload fails | Medium | Medium | store remote URL or placeholder | screenshot fallback card |
| Too many personas increases latency | Medium | Medium | default 4, max 6 | reduce to 3 |
| Remotion consumes time | High | High | storyboard first | render disabled state |
| Video render times out | Medium | Medium | async optional | presenter storyboard |
| MCP auth gets complex | High | Medium | MCP own tools only | skip MCP |
| UI/backend mismatch | Medium | High | mock data contract first | use seeded run |
| Deploy fails due heavy deps | Medium | High | avoid mandatory browser/video deps | remove optional packages |
| Cost spikes | Low/Medium | Medium | fast/strong model split | mock mode |
| Demo URL untested | High | High | use known URL or LaunchPilot | demo button |
| Last-minute feature creep | High | Critical | cut rule | freeze scope |

## Hardening checklist

- [ ] Test `MOCK_MODE=true` after deploy.
- [ ] Test “Load demo audit”.
- [ ] Test screenshot disabled.
- [ ] Test Browserless token missing.
- [ ] Test AI key missing.
- [ ] Test DB error path or mock fallback.
- [ ] Test shareable report.
- [ ] Test presenter report with render disabled.
- [ ] Test at least one live URL.
- [ ] Prepare screenshots/video recording backup for presentation.

## Fallback copy snippets

Screenshot failed:

> Screenshot failed, continuing with DOM evidence.

AI failed:

> AI generation failed for this step, using safe fallback output.

Video disabled:

> Video render is disabled. Presenter storyboard and script are ready.

Fetch blocked:

> This page blocked automated fetch. Load a demo audit or try another URL.

Partial audit:

> This audit completed with fallbacks. Findings are based on available evidence.

