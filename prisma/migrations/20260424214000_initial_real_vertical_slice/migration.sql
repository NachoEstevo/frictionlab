-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "AuditRun" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "finalUrl" TEXT,
    "targetAudience" TEXT NOT NULL,
    "conversionGoal" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "market" TEXT,
    "brandTone" TEXT,
    "personaCount" INTEGER NOT NULL DEFAULT 4,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "mode" TEXT NOT NULL DEFAULT 'LIVE',
    "conversionScore" INTEGER,
    "error" TEXT,
    "shareId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Screenshot" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "viewport" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "url" TEXT,
    "blobPath" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "fallbackType" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Screenshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageSnapshot" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "rawHtmlHash" TEXT,
    "visibleText" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "ctas" JSONB NOT NULL,
    "links" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Persona" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "objections" JSONB NOT NULL,
    "trustSensitivity" TEXT NOT NULL,
    "priceSensitivity" TEXT NOT NULL,
    "technicalLevel" TEXT NOT NULL,
    "patience" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "likelyQuestions" JSONB NOT NULL,
    "conversionTriggers" JSONB NOT NULL,
    "abandonmentTriggers" JSONB NOT NULL,
    "decisionStyle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonaSession" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "heroClarity" INTEGER,
    "offerUnderstanding" INTEGER,
    "relevance" INTEGER,
    "trust" INTEGER,
    "pricingClarity" INTEGER,
    "processClarity" INTEGER,
    "ctaReadiness" INTEGER,
    "conversionLikelihood" INTEGER,
    "likelyBouncePoint" TEXT,
    "finalVerdict" TEXT,
    "objections" JSONB,
    "missingInformation" JSONB,
    "frictionPoints" JSONB,
    "quotes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonaSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionEvent" (
    "id" TEXT NOT NULL,
    "personaSessionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "stage" TEXT NOT NULL,
    "personaThought" TEXT NOT NULL,
    "observedEvidence" JSONB NOT NULL,
    "friction" TEXT,
    "emotion" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "evidence" JSONB NOT NULL,
    "affectedPersonas" JSONB NOT NULL,
    "severity" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "effort" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "suggestedFix" TEXT NOT NULL,
    "suggestedCopy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "findingIds" JSONB NOT NULL,
    "title" TEXT NOT NULL,
    "whyItMatters" TEXT NOT NULL,
    "implementation" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "effort" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "checklist" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopyVariant" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "rationale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CopyVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "executiveSummary" TEXT NOT NULL,
    "conversionScore" INTEGER NOT NULL,
    "frictionMap" JSONB NOT NULL,
    "personaOutcomes" JSONB NOT NULL,
    "topBlockers" JSONB NOT NULL,
    "trustGaps" JSONB NOT NULL,
    "copyIssues" JSONB NOT NULL,
    "uiIssues" JSONB NOT NULL,
    "mobileIssues" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "checklist" JSONB NOT NULL,
    "fullJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresenterReport" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "durationSeconds" INTEGER NOT NULL DEFAULT 60,
    "voiceoverScript" TEXT NOT NULL,
    "executiveScript" TEXT,
    "captions" JSONB NOT NULL,
    "storyboardJson" JSONB NOT NULL,
    "renderStatus" TEXT NOT NULL DEFAULT 'DISABLED',
    "videoUrl" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PresenterReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresenterScene" (
    "id" TEXT NOT NULL,
    "presenterReportId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "narration" TEXT NOT NULL,
    "visualType" TEXT NOT NULL,
    "visualPayload" JSONB NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "caption" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresenterScene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolCall" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ToolCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareableReport" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "shareId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareableReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Screenshot_auditRunId_idx" ON "Screenshot"("auditRunId");

-- CreateIndex
CREATE UNIQUE INDEX "PageSnapshot_auditRunId_key" ON "PageSnapshot"("auditRunId");

-- CreateIndex
CREATE INDEX "Persona_auditRunId_idx" ON "Persona"("auditRunId");

-- CreateIndex
CREATE INDEX "PersonaSession_auditRunId_idx" ON "PersonaSession"("auditRunId");

-- CreateIndex
CREATE INDEX "PersonaSession_personaId_idx" ON "PersonaSession"("personaId");

-- CreateIndex
CREATE INDEX "SessionEvent_personaSessionId_idx" ON "SessionEvent"("personaSessionId");

-- CreateIndex
CREATE INDEX "Finding_auditRunId_idx" ON "Finding"("auditRunId");

-- CreateIndex
CREATE INDEX "Recommendation_auditRunId_idx" ON "Recommendation"("auditRunId");

-- CreateIndex
CREATE INDEX "CopyVariant_auditRunId_idx" ON "CopyVariant"("auditRunId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_auditRunId_key" ON "Report"("auditRunId");

-- CreateIndex
CREATE UNIQUE INDEX "PresenterReport_auditRunId_key" ON "PresenterReport"("auditRunId");

-- CreateIndex
CREATE INDEX "PresenterScene_presenterReportId_idx" ON "PresenterScene"("presenterReportId");

-- CreateIndex
CREATE INDEX "AgentRun_auditRunId_idx" ON "AgentRun"("auditRunId");

-- CreateIndex
CREATE INDEX "ToolCall_auditRunId_idx" ON "ToolCall"("auditRunId");

-- CreateIndex
CREATE UNIQUE INDEX "ShareableReport_auditRunId_key" ON "ShareableReport"("auditRunId");

-- CreateIndex
CREATE UNIQUE INDEX "ShareableReport_shareId_key" ON "ShareableReport"("shareId");

-- AddForeignKey
ALTER TABLE "Screenshot" ADD CONSTRAINT "Screenshot_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "AuditRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageSnapshot" ADD CONSTRAINT "PageSnapshot_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "AuditRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "AuditRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonaSession" ADD CONSTRAINT "PersonaSession_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "AuditRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonaSession" ADD CONSTRAINT "PersonaSession_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionEvent" ADD CONSTRAINT "SessionEvent_personaSessionId_fkey" FOREIGN KEY ("personaSessionId") REFERENCES "PersonaSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "AuditRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "AuditRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopyVariant" ADD CONSTRAINT "CopyVariant_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "AuditRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "AuditRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresenterReport" ADD CONSTRAINT "PresenterReport_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "AuditRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresenterScene" ADD CONSTRAINT "PresenterScene_presenterReportId_fkey" FOREIGN KEY ("presenterReportId") REFERENCES "PresenterReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "AuditRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolCall" ADD CONSTRAINT "ToolCall_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "AuditRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareableReport" ADD CONSTRAINT "ShareableReport_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "AuditRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

