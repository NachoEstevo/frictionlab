# FrictionLab — Agent Workflow and Tools

## Principle

Do not build one giant free-form agent.

Build a deterministic workflow that calls specialized AI functions with strict Zod schemas.

The agentic feel comes from:

- Tool calls.
- Workflow state.
- Persona swarm.
- Session timelines.
- Evidence references.
- Fallbacks.
- Report and presenter generation.

## Agent components

| Component | Responsibility | Input | Output | Tools | Risk | Fallback |
|---|---|---|---|---|---|---|
| Supervisor | Orchestrate audit state | Audit input | Step statuses | Workflow, DB | Too abstract | Fixed workflow |
| Page Extractor | Convert page into evidence | URL/HTML | PageSnapshot | fetch, Cheerio | JS/bot blocking | Demo snapshot |
| Screenshot Agent | Capture desktop/mobile | URL | Screenshot records | Browserless, Blob | Timeout | DOM snapshot |
| Persona Generator | Create synthetic users | target, goal, page summary | Personas | AI SDK | Generic personas | templates |
| Session Runner | Simulate persona walkthrough | persona, evidence, goal | PersonaSession | AI SDK | invented feedback | evidence-only prompt |
| Persona Evaluator | Score session | session | scores/verdict | deterministic/AI | inconsistent scoring | formula |
| Finding Aggregator | Merge friction points | sessions, snapshot | Findings | AI SDK | duplicates | dedupe by category/title |
| Recommendation Generator | Generate fixes | findings | Recommendations | AI SDK | vague advice | impact/effort schema |
| Copywriter | Hero/CTA/FAQ variants | findings, tone | CopyVariants | AI SDK | generic copy | templates by goal |
| Report Generator | Final report | all outputs | Report | AI SDK | too long | top 5 summary |
| Presenter Generator | Deck/video script | report, screenshots | PresenterReport | AI SDK, optional Remotion | video complexity | storyboard/deck |

## Workflow

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

## Workflow step table

| Step | Input | Output | Retries | Timeout | Persist | Error handling | Fallback |
|---|---|---|---:|---:|---|---|---|
| startAudit | AuditInput | AuditRun | 0 | short | DB | validate | demo run |
| extractPage | URL | PageSnapshot | 2 | 20s | DB | timeout | demo snapshot |
| captureScreenshots | URL | Screenshot[] | 1 | 60s | Blob/DB | mark failed | DOM snapshot |
| generatePersonas | target + summary | Persona[] | 1 | 30s | DB | schema retry | templates |
| runPersonaSessions | personas + evidence | Session[] | 1/persona | 30s each | DB | isolate failure | default session |
| aggregateFindings | sessions | Finding[] | 1 | 30s | DB | retry | session-derived blockers |
| scoreConversion | scores/findings | score | 0 | short | DB | deterministic | formula |
| generateRecommendations | findings | Recommendation[] | 1 | 30s | DB | retry | templates |
| generateCopyVariants | findings/tone | CopyVariant[] | 1 | 30s | DB | optional skip | basic copy |
| generateReport | all | Report | 1 | 30s | DB | minimal report | top 5 summary |
| generatePresenterReport | report | PresenterReport | 1 | 30s | DB | fallback scenes | storyboard only |
| publishShareableReport | report | shareId | 1 | short | DB | retry | local page |
| finish | auditRunId | completed | 0 | short | DB | mark partial | partial complete |

## Zod schemas

```ts
import { z } from "zod";

export const AuditInputSchema = z.object({
  url: z.string().url(),
  targetAudience: z.string().min(10),
  conversionGoal: z.string().min(3),
  businessType: z.enum(["saas", "agency", "ecommerce", "devtool", "fintech", "other"]),
  language: z.string().default("en"),
  market: z.string().optional(),
  brandTone: z.string().optional(),
  personaCount: z.number().int().min(2).max(6).default(4),
  demoMode: z.boolean().default(false),
});

export const PageSectionSchema = z.object({
  id: z.string(),
  order: z.number(),
  type: z.enum(["hero", "benefits", "features", "proof", "pricing", "faq", "cta", "footer", "unknown"]),
  heading: z.string().optional(),
  text: z.string(),
  ctas: z.array(z.string()).default([]),
});

export const PageSnapshotSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  visibleText: z.string(),
  sections: z.array(PageSectionSchema),
  ctas: z.array(z.string()),
  links: z.array(z.object({ label: z.string(), href: z.string().optional() })),
});

export const EvidenceRefSchema = z.object({
  sectionId: z.string(),
  sectionType: z.string(),
  quote: z.string().max(280),
  interpretation: z.string(),
});

export const SyntheticPersonaSchema = z.object({
  id: z.string(),
  name: z.string(),
  segment: z.string(),
  context: z.string(),
  goal: z.string(),
  objections: z.array(z.string()).min(2).max(6),
  trustSensitivity: z.enum(["low", "medium", "high"]),
  priceSensitivity: z.enum(["low", "medium", "high"]),
  technicalLevel: z.enum(["low", "medium", "high"]),
  patience: z.enum(["low", "medium", "high"]),
  device: z.enum(["desktop", "mobile"]),
  likelyQuestions: z.array(z.string()).min(2).max(8),
  conversionTriggers: z.array(z.string()).min(2).max(8),
  abandonmentTriggers: z.array(z.string()).min(2).max(8),
  decisionStyle: z.enum([
    "fast_skeptic",
    "methodical_researcher",
    "price_comparer",
    "trust_first_buyer",
    "technical_evaluator",
    "busy_executive"
  ]),
});

export const SessionEventSchema = z.object({
  order: z.number(),
  stage: z.enum([
    "arrival",
    "hero_scan",
    "offer_evaluation",
    "proof_check",
    "pricing_check",
    "cta_evaluation",
    "final_decision"
  ]),
  personaThought: z.string(),
  observedEvidence: z.array(EvidenceRefSchema),
  friction: z.string().optional(),
  emotion: z.enum(["curious", "confused", "skeptical", "reassured", "frustrated", "ready"]),
  decision: z.enum(["continue", "hesitate", "bounce", "convert"]),
});

export const PersonaSessionSchema = z.object({
  id: z.string(),
  auditRunId: z.string(),
  personaId: z.string(),
  timeline: z.array(SessionEventSchema).min(4).max(10),
  heroClarity: z.number().min(0).max(100),
  offerUnderstanding: z.number().min(0).max(100),
  relevance: z.number().min(0).max(100),
  trust: z.number().min(0).max(100),
  pricingClarity: z.number().min(0).max(100),
  processClarity: z.number().min(0).max(100),
  ctaReadiness: z.number().min(0).max(100),
  objections: z.array(z.string()),
  missingInformation: z.array(z.string()),
  likelyBouncePoint: z.string(),
  conversionLikelihood: z.number().min(0).max(100),
  frictionPoints: z.array(z.object({
    problem: z.string(),
    severity: z.enum(["low", "medium", "high", "critical"]),
    evidenceRefs: z.array(EvidenceRefSchema),
  })),
  quotes: z.array(z.string()),
  finalVerdict: z.enum(["convert", "hesitate", "bounce"]),
});

export const FindingSchema = z.object({
  id: z.string(),
  category: z.enum([
    "hero",
    "offer_clarity",
    "trust",
    "pricing",
    "process",
    "cta",
    "copy",
    "ui",
    "mobile",
    "missing_information"
  ]),
  problem: z.string(),
  evidence: z.array(EvidenceRefSchema),
  affectedPersonas: z.array(z.string()),
  severity: z.enum(["low", "medium", "high", "critical"]),
  impact: z.enum(["low", "medium", "high"]),
  effort: z.enum(["low", "medium", "high"]),
  confidence: z.number().min(0).max(1),
  suggestedFix: z.string(),
  suggestedCopy: z.string().optional(),
});

export const RecommendationSchema = z.object({
  id: z.string(),
  findingIds: z.array(z.string()),
  title: z.string(),
  whyItMatters: z.string(),
  implementation: z.string(),
  impact: z.enum(["low", "medium", "high"]),
  effort: z.enum(["low", "medium", "high"]),
  priority: z.number().min(1).max(10),
  checklist: z.array(z.string()),
});

export const PresenterSceneSchema = z.object({
  id: z.string(),
  order: z.number(),
  title: z.string(),
  narration: z.string(),
  visualType: z.enum([
    "intro",
    "score",
    "screenshot",
    "persona",
    "finding",
    "recommendation",
    "copy_before_after",
    "outro"
  ]),
  visualPayload: z.record(z.any()),
  durationSeconds: z.number().min(3).max(15),
  caption: z.string(),
});

export const PresenterReportSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  durationSeconds: z.number().min(30).max(90),
  voiceoverScript: z.string(),
  executiveScript: z.string().optional(),
  scenes: z.array(PresenterSceneSchema).min(5).max(8),
  captions: z.array(z.string()),
});
```

## Tools

| Tool | Description | Input | Output | Complexity | Credentials | Mock | Priority |
|---|---|---|---|---:|---|---|---|
| `createAuditRun` | Create run | AuditInput | AuditRun | Low | DB | yes | P0 |
| `fetchPageHtml` | Download HTML | `{ url }` | `{ html, finalUrl, statusCode }` | Medium | no | yes | P0 |
| `extractVisibleContent` | Extract visible content | `{ html, url }` | PageSnapshot | Medium | no | yes | P0 |
| `captureScreenshot` | Capture desktop/mobile | `{ url, viewport }` | Screenshot | Medium | Browserless | yes | P0 |
| `detectPageSections` | Classify sections | PageSnapshot | PageSection[] | Medium | AI optional | yes | P0 |
| `generatePersonas` | Create personas | target, goal, summary | Persona[] | Medium | AI | yes | P0 |
| `runPersonaSession` | Simulate session | persona, evidence, goal | PersonaSession | Medium | AI | yes | P0 |
| `aggregateFindings` | Merge sessions | sessions, snapshot | Finding[] | Medium | AI | yes | P0 |
| `scoreConversion` | Calculate score | sessions/findings | score | Low | no | yes | P0 |
| `generateRecommendations` | Fixes | findings | Recommendation[] | Medium | AI | yes | P0 |
| `generateCopyVariants` | Hero/CTA/FAQ | findings, tone | CopyVariant[] | Medium | AI | yes | P1 |
| `generateReport` | Final report | all data | Report | Medium | AI | yes | P0 |
| `generatePresenterReport` | Storyboard/script | report + assets | PresenterReport | Medium | AI | yes | P1 |
| `renderPresenterVideo` | Optional MP4 | PresenterReport | videoUrl/status | High | Remotion/Blob | yes | P2 |
| `publishShareableReport` | Create shareId | auditRunId | shareId | Low | DB | yes | P0 |

## Prompt guardrails

Use these rules in all prompts:

```txt
You may only reference page content from the provided PageEvidence.
If information is not present, mark it as missing_information.
Every friction point must include at least one evidenceRef or be explicitly categorized as missing_information.
Do not invent claims, pricing, testimonials, integrations, guarantees, customer logos or performance metrics.
Separate observed evidence from inferred risk and suggested fix.
Use cautious language: likely, may, risk, could.
Avoid generic advice unless directly connected to evidence.
```

## Persona prompt skeleton

```txt
Generate synthetic personas for a conversion audit.

Target audience: {{targetAudience}}
Conversion goal: {{conversionGoal}}
Business type: {{businessType}}
Page summary: {{pageSummary}}

Create {{count}} personas representing different conversion risks:
1. high urgency / low patience
2. skeptical evaluator needing proof
3. price-sensitive buyer
4. technical/detail-oriented buyer
5. mobile-first distracted visitor if count allows

Return only structured JSON matching the schema.
```

## Session prompt skeleton

```txt
Simulate a cognitive walkthrough of this landing page by the persona below.

Persona:
{{persona}}

Conversion goal:
{{conversionGoal}}

Page evidence:
{{pageEvidence}}

Rules:
- Use only provided page evidence.
- Evaluate the page in order.
- Every friction point must cite evidence.
- If needed information is not present, mark it as missing_information.
- Do not invent content.

Return a structured PersonaSession.
```

## Conversion score formula

```txt
conversionScore =
  0.25 * average(heroClarity)
+ 0.20 * average(offerUnderstanding)
+ 0.20 * average(trust)
+ 0.15 * average(ctaReadiness)
+ 0.10 * average(processClarity)
+ 0.10 * average(pricingClarity)
- blockerPenalty
```

Keep it deterministic after session scores.

