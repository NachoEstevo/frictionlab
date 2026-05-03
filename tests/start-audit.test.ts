import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuditRun } from "@prisma/client";
import type { AuditInput } from "@/lib/schemas/audit";

const scheduledTasks: Array<() => Promise<void> | void> = [];

vi.mock("next/server", () => ({
  after: vi.fn((task: () => Promise<void> | void) => {
    scheduledTasks.push(task);
  })
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    auditRun: {
      create: vi.fn()
    }
  }
}));

vi.mock("@/lib/demo/seed-run", () => ({
  seedDemoRun: vi.fn()
}));

vi.mock("@/lib/workflow/run-audit-workflow", () => ({
  runAuditWorkflow: vi.fn()
}));

vi.mock("@/lib/workflow/run-webapp-audit-workflow", () => ({
  runWebappAuditWorkflow: vi.fn()
}));

describe("startAudit", () => {
  const input: AuditInput = {
    auditType: "LANDING",
    url: "https://example.com",
    targetAudience: "B2B SaaS founders",
    conversionGoal: "Book a demo",
    businessType: "saas",
    language: "en",
    market: "US",
    brandTone: "clear",
    personaCount: 4,
    demoMode: false
  };

  beforeEach(() => {
    process.env.DATABASE_URL = "postgresql://localhost/frictionlab";
    scheduledTasks.length = 0;
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.DATABASE_URL;
  });

  it("creates a live run in RUNNING state and schedules the workflow after the response", async () => {
    const { prisma } = await import("@/lib/db");
    const { runAuditWorkflow } = await import("@/lib/workflow/run-audit-workflow");
    const { startAudit } = await import("@/lib/workflow/start-audit");

    vi.mocked(prisma.auditRun.create).mockResolvedValue(buildAuditRun({ id: "audit_123", status: "RUNNING" }));

    const result = await startAudit(input);

    expect(result).toEqual({ auditRunId: "audit_123", status: "RUNNING" });
    expect(prisma.auditRun.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "RUNNING",
          mode: "LIVE",
          url: input.url
        })
      })
    );
    expect(runAuditWorkflow).not.toHaveBeenCalled();
    expect(scheduledTasks).toHaveLength(1);

    await scheduledTasks[0]?.();
    expect(runAuditWorkflow).toHaveBeenCalledWith("audit_123", input);
  });

  it("creates a webapp run and schedules the webapp workflow", async () => {
    const { prisma } = await import("@/lib/db");
    const { runAuditWorkflow } = await import("@/lib/workflow/run-audit-workflow");
    const { runWebappAuditWorkflow } = await import("@/lib/workflow/run-webapp-audit-workflow");
    const { startAudit } = await import("@/lib/workflow/start-audit");

    const webappInput = {
      ...input,
      auditType: "WEBAPP" as const,
      scenarioPrompt: "Sign up, confirm the account and create the first project.",
      signupAllowed: true,
      allowedDomains: ["example.com"],
      maxSteps: 8,
      mailboxMode: "GMAIL_IMAP" as const
    };

    vi.mocked(prisma.auditRun.create).mockResolvedValue(
      buildAuditRun({ id: "audit_webapp_123", status: "RUNNING", mode: "WEBAPP" })
    );

    const result = await startAudit(webappInput);

    expect(result).toEqual({ auditRunId: "audit_webapp_123", status: "RUNNING" });
    expect(prisma.auditRun.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          mode: "WEBAPP",
          auditType: "WEBAPP"
        })
      })
    );

    await scheduledTasks[0]?.();
    expect(runAuditWorkflow).not.toHaveBeenCalled();
    expect(runWebappAuditWorkflow).toHaveBeenCalledWith("audit_webapp_123", webappInput);
  });
});

function buildAuditRun(overrides: Partial<AuditRun> = {}): AuditRun {
  return {
    id: "audit_123",
    url: "https://example.com",
    finalUrl: null,
    targetAudience: "B2B SaaS founders",
    conversionGoal: "Book a demo",
    businessType: "saas",
    language: "en",
    market: "US",
    brandTone: "clear",
    personaCount: 4,
    status: "RUNNING",
    auditType: "LANDING",
    mode: "LIVE",
    conversionScore: null,
    error: null,
    shareId: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides
  };
}
