import { describe, expect, it, vi } from "vitest";
import type { WebappAuditInput } from "@/lib/schemas/audit";
import { runWebappAuditWorkflow } from "@/lib/workflow/run-webapp-audit-workflow";

vi.mock("@/lib/db", () => ({
  prisma: {
    auditRun: {
      update: vi.fn(),
      findUniqueOrThrow: vi.fn()
    },
    browserRun: {
      create: vi.fn(),
      update: vi.fn()
    },
    browserStep: {
      create: vi.fn()
    },
    mailboxEvent: {
      create: vi.fn()
    },
    pageSnapshot: {
      upsert: vi.fn()
    },
    $transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback({}))
  }
}));

vi.mock("@/lib/workflow/run-audit-workflow", () => ({
  persistArtifacts: vi.fn()
}));

vi.mock("@/lib/ai/generate-audit-artifacts", () => ({
  generateAuditArtifacts: vi.fn(async () => ({
    personas: [],
    sessions: [],
    findings: [],
    recommendations: [],
    copyVariants: [],
    report: { conversionScore: 72 },
    presenterReport: { scenes: [] },
    usedFallback: true,
    fallbackReason: "test fallback"
  }))
}));

describe("webapp audit workflow", () => {
  it("persists browser and mailbox evidence from a successful runner", async () => {
    const { prisma } = await import("@/lib/db");
    const { persistArtifacts } = await import("@/lib/workflow/run-audit-workflow");

    vi.mocked(prisma.browserRun.create).mockResolvedValue({ id: "browser_run_1" } as any);
    vi.mocked(prisma.auditRun.findUniqueOrThrow).mockResolvedValue({ id: "audit_webapp_1" } as any);

    await runWebappAuditWorkflow("audit_webapp_1", buildInput(), {
      browserRunner: async () => ({
        status: "COMPLETED",
        finalUrl: "https://app.example.com/onboarding",
        steps: [
          {
            order: 1,
            actionType: "navigate",
            target: "https://app.example.com/signup",
            url: "https://app.example.com/signup",
            title: "Sign up",
            observation: "Signup form visible.",
            status: "COMPLETED"
          }
        ],
        mailboxEvents: [
          {
            emailAlias: "agent+frictionlab-audit-webapp-1@gmail.com",
            subject: "Confirm your account",
            fromAddress: "noreply@example.com",
            confirmationLink: "https://app.example.com/confirm?token=abc",
            confirmationCode: "483921",
            status: "USED"
          }
        ],
        pageSnapshot: {
          title: "Onboarding",
          description: "Interactive webapp audit",
          visibleText: "Signup form visible.",
          sections: [],
          ctas: [],
          links: [],
          metadata: { auditType: "WEBAPP" }
        }
      })
    });

    expect(prisma.browserStep.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          browserRunId: "browser_run_1",
          actionType: "navigate",
          observation: "Signup form visible."
        })
      })
    );
    expect(prisma.mailboxEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          browserRunId: "browser_run_1",
          status: "USED",
          confirmationLink: "https://app.example.com/[redacted-confirmation-link]",
          confirmationCode: "[redacted]"
        })
      })
    );
    expect(persistArtifacts).toHaveBeenCalled();
    expect(prisma.auditRun.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "PARTIAL",
          conversionScore: 72
        })
      })
    );
  });
});

function buildInput(): WebappAuditInput {
  return {
    auditType: "WEBAPP",
    url: "https://app.example.com/signup",
    targetAudience: "B2B SaaS operators evaluating workflow software",
    conversionGoal: "Create an account and complete onboarding",
    businessType: "saas",
    language: "en",
    personaCount: 4,
    demoMode: false,
    scenarioPrompt: "Sign up, confirm the account and create the first project.",
    signupAllowed: true,
    allowedDomains: ["app.example.com"],
    maxSteps: 8,
    mailboxMode: "GMAIL_IMAP"
  };
}
