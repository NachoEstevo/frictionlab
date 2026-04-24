# FrictionLab — Architecture and Data Model

## Stack

- Next.js App Router.
- Tailwind + shadcn/ui.
- v0 for UI generation.
- Vercel AI SDK.
- AI Gateway.
- Vercel Workflow / WDK preferred, sequential runner fallback.
- Prisma.
- Postgres: Neon, Supabase or Prisma Postgres.
- Vercel Blob for screenshots/video assets.
- Browserless Screenshot API optional.
- Cheerio + Readability.
- Remotion optional.

## Architecture diagram

```txt
[User Browser]
   ↓
[Next.js App Router UI]
   ├─ /audit/new
   ├─ /audit/[id]
   ├─ /audit/[id]/report
   ├─ /audit/[id]/presenter
   └─ /r/[shareId]

   ↓ POST /api/audits

[Audit API]
   ├─ validate input
   ├─ create AuditRun
   ├─ if MOCK_MODE → seed demo run
   └─ start workflow / sequential runner

   ↓

[Workflow / Sequential Runner]
   ├─ extractPage
   ├─ captureScreenshots
   ├─ generatePersonas
   ├─ runPersonaSessions
   ├─ aggregateFindings
   ├─ scoreConversion
   ├─ generateRecommendations
   ├─ generateCopyVariants
   ├─ generateReport
   ├─ generatePresenterReport
   └─ publishShareableReport

[Postgres]
   ├─ AuditRun
   ├─ PageSnapshot
   ├─ Screenshot
   ├─ Persona
   ├─ PersonaSession
   ├─ SessionEvent
   ├─ Finding
   ├─ Recommendation
   ├─ CopyVariant
   ├─ Report
   ├─ PresenterReport
   ├─ PresenterScene
   ├─ AgentRun
   ├─ ToolCall
   └─ ShareableReport

[Vercel Blob]
   ├─ screenshots
   ├─ report assets
   └─ optional video renders

[AI Gateway]
   ├─ fast model
   └─ strong model
```

## API routes

### `POST /api/audits`

Creates an audit run and starts workflow.

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

Output:

```ts
{
  auditRunId: string;
  status: "CREATED" | "RUNNING" | "COMPLETED" | "FAILED" | "DEMO";
}
```

### `GET /api/audits/[id]`

Returns the full audit state for dashboard/report.

### `GET /api/audits/[id]/events`

Returns recent ToolCall/AgentRun events for polling.

### `GET /api/reports/[shareId]`

Returns shareable report.

### `POST /api/presenter/[auditRunId]`

Generates Presenter Report.

### `POST /api/presenter/[auditRunId]/render`

Optional Remotion render. Must degrade safely.

## Prisma schema

```prisma
model AuditRun {
  id              String   @id @default(cuid())
  url             String
  finalUrl        String?
  targetAudience  String
  conversionGoal  String
  businessType    String
  language        String   @default("en")
  market          String?
  brandTone       String?
  personaCount    Int      @default(4)
  status          String   @default("CREATED")
  mode            String   @default("LIVE") // LIVE | DEMO | FALLBACK
  conversionScore Int?
  error           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  pageSnapshot    PageSnapshot?
  screenshots     Screenshot[]
  personas        Persona[]
  sessions        PersonaSession[]
  findings        Finding[]
  recommendations Recommendation[]
  copyVariants    CopyVariant[]
  report          Report?
  presenterReport PresenterReport?
  agentRuns       AgentRun[]
  toolCalls       ToolCall[]
  shareableReport ShareableReport?
}

model PageSnapshot {
  id          String   @id @default(cuid())
  auditRunId  String   @unique
  auditRun    AuditRun @relation(fields: [auditRunId], references: [id], onDelete: Cascade)
  title       String?
  description String?
  rawHtmlHash String?
  visibleText String?
  sections    Json
  ctas        Json
  links       Json
  metadata    Json?
  createdAt   DateTime @default(now())
}

model Screenshot {
  id          String   @id @default(cuid())
  auditRunId  String
  auditRun    AuditRun @relation(fields: [auditRunId], references: [id], onDelete: Cascade)
  viewport    String // desktop | mobile
  status      String // SUCCESS | FAILED | FALLBACK
  url         String?
  blobPath    String?
  width       Int?
  height      Int?
  fallbackType String?
  error       String?
  createdAt   DateTime @default(now())
}

model Persona {
  id                 String   @id @default(cuid())
  auditRunId          String
  auditRun            AuditRun @relation(fields: [auditRunId], references: [id], onDelete: Cascade)
  name                String
  segment             String
  context             String
  goal                String
  objections          Json
  trustSensitivity    String
  priceSensitivity    String
  technicalLevel      String
  patience            String
  device              String
  likelyQuestions     Json
  conversionTriggers  Json
  abandonmentTriggers Json
  decisionStyle       String?
  createdAt           DateTime @default(now())

  sessions            PersonaSession[]
}

model PersonaSession {
  id                   String   @id @default(cuid())
  auditRunId            String
  personaId             String
  auditRun              AuditRun @relation(fields: [auditRunId], references: [id], onDelete: Cascade)
  persona               Persona  @relation(fields: [personaId], references: [id], onDelete: Cascade)
  status                String   @default("PENDING")
  heroClarity           Int?
  offerUnderstanding    Int?
  relevance             Int?
  trust                 Int?
  pricingClarity        Int?
  processClarity        Int?
  ctaReadiness          Int?
  conversionLikelihood  Int?
  likelyBouncePoint     String?
  finalVerdict          String?
  objections            Json?
  missingInformation    Json?
  frictionPoints        Json?
  quotes                Json?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  events                SessionEvent[]
}

model SessionEvent {
  id               String   @id @default(cuid())
  personaSessionId String
  personaSession   PersonaSession @relation(fields: [personaSessionId], references: [id], onDelete: Cascade)
  order            Int
  stage            String
  personaThought   String
  observedEvidence Json
  friction         String?
  emotion          String
  decision         String
  createdAt        DateTime @default(now())
}

model Finding {
  id               String   @id @default(cuid())
  auditRunId        String
  auditRun          AuditRun @relation(fields: [auditRunId], references: [id], onDelete: Cascade)
  category          String
  problem           String
  evidence          Json
  affectedPersonas  Json
  severity          String
  impact            String
  effort            String
  confidence        Float
  suggestedFix      String
  suggestedCopy     String?
  createdAt         DateTime @default(now())
}

model Recommendation {
  id              String   @id @default(cuid())
  auditRunId       String
  auditRun         AuditRun @relation(fields: [auditRunId], references: [id], onDelete: Cascade)
  findingIds       Json
  title            String
  whyItMatters     String
  implementation   String
  impact           String
  effort           String
  priority         Int
  checklist        Json
  createdAt        DateTime @default(now())
}

model CopyVariant {
  id          String   @id @default(cuid())
  auditRunId  String
  auditRun    AuditRun @relation(fields: [auditRunId], references: [id], onDelete: Cascade)
  type        String // hero | cta | faq | trust_section
  label       String
  content     Json
  rationale   String?
  createdAt   DateTime @default(now())
}

model Report {
  id              String   @id @default(cuid())
  auditRunId       String   @unique
  auditRun         AuditRun @relation(fields: [auditRunId], references: [id], onDelete: Cascade)
  executiveSummary String
  conversionScore  Int
  frictionMap      Json
  personaOutcomes  Json
  topBlockers      Json
  trustGaps        Json
  copyIssues       Json
  uiIssues         Json
  mobileIssues     Json
  recommendations  Json
  checklist        Json
  fullJson         Json
  createdAt        DateTime @default(now())
}

model PresenterReport {
  id              String   @id @default(cuid())
  auditRunId       String   @unique
  auditRun         AuditRun @relation(fields: [auditRunId], references: [id], onDelete: Cascade)
  title           String
  subtitle        String?
  durationSeconds Int      @default(60)
  voiceoverScript String
  executiveScript String?
  scenes          PresenterScene[]
  captions        Json
  storyboardJson  Json
  renderStatus    String   @default("NOT_REQUESTED") // NOT_REQUESTED | QUEUED | RENDERING | READY | FAILED | DISABLED
  videoUrl        String?
  error           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model PresenterScene {
  id                String   @id @default(cuid())
  presenterReportId String
  presenterReport   PresenterReport @relation(fields: [presenterReportId], references: [id], onDelete: Cascade)
  order             Int
  title             String
  narration         String
  visualType        String // score | screenshot | persona | finding | recommendation | copy_before_after
  visualPayload     Json
  durationSeconds   Int
  caption           String
  createdAt         DateTime @default(now())
}

model AgentRun {
  id          String   @id @default(cuid())
  auditRunId  String
  auditRun    AuditRun @relation(fields: [auditRunId], references: [id], onDelete: Cascade)
  agentName   String
  status      String
  input       Json?
  output      Json?
  error       String?
  startedAt   DateTime @default(now())
  completedAt DateTime?
}

model ToolCall {
  id          String   @id @default(cuid())
  auditRunId  String
  auditRun    AuditRun @relation(fields: [auditRunId], references: [id], onDelete: Cascade)
  toolName    String
  status      String
  input       Json?
  output      Json?
  error       String?
  startedAt   DateTime @default(now())
  completedAt DateTime?
}

model ShareableReport {
  id          String   @id @default(cuid())
  auditRunId  String   @unique
  auditRun    AuditRun @relation(fields: [auditRunId], references: [id], onDelete: Cascade)
  shareId     String   @unique
  isPublic    Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

## Env vars

```txt
DATABASE_URL=
AI_GATEWAY_API_KEY=
FRICTIONLAB_FAST_MODEL=
FRICTIONLAB_STRONG_MODEL=
BROWSERLESS_TOKEN=
BLOB_READ_WRITE_TOKEN=
MOCK_MODE=false
DEMO_FALLBACK=true
ENABLE_REMOTION_RENDER=false
```

