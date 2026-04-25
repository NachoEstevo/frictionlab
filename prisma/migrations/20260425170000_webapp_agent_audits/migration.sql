ALTER TABLE "AuditRun" ADD COLUMN "auditType" TEXT NOT NULL DEFAULT 'LANDING';

CREATE TABLE "BrowserRun" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "remoteSessionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "startUrl" TEXT NOT NULL,
    "finalUrl" TEXT,
    "metadata" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BrowserRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BrowserStep" (
    "id" TEXT NOT NULL,
    "browserRunId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "target" TEXT,
    "url" TEXT,
    "title" TEXT,
    "observation" TEXT NOT NULL,
    "screenshotUrl" TEXT,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrowserStep_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MailboxEvent" (
    "id" TEXT NOT NULL,
    "browserRunId" TEXT NOT NULL,
    "emailAlias" TEXT NOT NULL,
    "subject" TEXT,
    "fromAddress" TEXT,
    "confirmationLink" TEXT,
    "confirmationCode" TEXT,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MailboxEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BrowserRun_auditRunId_key" ON "BrowserRun"("auditRunId");
CREATE INDEX "BrowserStep_browserRunId_idx" ON "BrowserStep"("browserRunId");
CREATE INDEX "MailboxEvent_browserRunId_idx" ON "MailboxEvent"("browserRunId");
CREATE INDEX "MailboxEvent_emailAlias_idx" ON "MailboxEvent"("emailAlias");

ALTER TABLE "BrowserRun" ADD CONSTRAINT "BrowserRun_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "AuditRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BrowserStep" ADD CONSTRAINT "BrowserStep_browserRunId_fkey" FOREIGN KEY ("browserRunId") REFERENCES "BrowserRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MailboxEvent" ADD CONSTRAINT "MailboxEvent_browserRunId_fkey" FOREIGN KEY ("browserRunId") REFERENCES "BrowserRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
