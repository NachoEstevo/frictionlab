import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuditInput } from "@/lib/schemas/audit";

const mocks = vi.hoisted(() => {
  const tx = {
    presenterReport: {
      findUnique: vi.fn(async () => null),
      deleteMany: vi.fn(async () => undefined),
      create: vi.fn(async () => undefined)
    },
    presenterScene: {
      deleteMany: vi.fn(async () => undefined)
    },
    sessionEvent: {
      deleteMany: vi.fn(async () => undefined)
    },
    personaSession: {
      deleteMany: vi.fn(async () => undefined),
      create: vi.fn(async () => undefined)
    },
    persona: {
      deleteMany: vi.fn(async () => undefined),
      createMany: vi.fn(async () => undefined)
    },
    finding: {
      deleteMany: vi.fn(async () => undefined),
      createMany: vi.fn(async () => undefined)
    },
    recommendation: {
      deleteMany: vi.fn(async () => undefined),
      createMany: vi.fn(async () => undefined)
    },
    copyVariant: {
      deleteMany: vi.fn(async () => undefined),
      createMany: vi.fn(async () => undefined)
    },
    report: {
      deleteMany: vi.fn(async () => undefined),
      create: vi.fn(async () => undefined)
    },
    shareableReport: {
      deleteMany: vi.fn(async () => undefined),
      create: vi.fn(async () => undefined)
    },
    auditRun: {
      update: vi.fn(async () => undefined)
    }
  };

  return {
    env: {
      demoFallback: true,
      enableScreenshotCapture: false,
      browserlessToken: "browserless_test_token",
      blobReadWriteToken: "blob_test_token"
    },
    prisma: {
      auditRun: {
        update: vi.fn(async () => undefined),
        findUniqueOrThrow: vi.fn(async () => ({ id: "audit_123", status: "COMPLETED" }))
      },
      pageSnapshot: {
        upsert: vi.fn(async () => undefined)
      },
      screenshot: {
        deleteMany: vi.fn(async () => undefined),
        createMany: vi.fn(async () => undefined)
      },
      toolCall: {
        create: vi.fn(async () => ({ id: "tool_call_1" })),
        update: vi.fn(async () => undefined)
      },
      agentRun: {
        create: vi.fn(async () => ({ id: "agent_run_1" })),
        update: vi.fn(async () => undefined)
      },
      $transaction: vi.fn(async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx))
    },
    snapshot: {
      title: "Example",
      description: "Example page",
      visibleText: "Launch faster. Book a demo.",
      sections: [
        {
          id: "section_hero",
          order: 1,
          type: "hero",
          heading: "Launch faster",
          text: "Launch faster. Book a demo.",
          ctas: ["Book a demo"]
        }
      ],
      ctas: ["Book a demo"],
      links: [],
      metadata: {}
    },
    artifacts: {
      usedFallback: false,
      personas: [],
      sessions: [],
      findings: [],
      recommendations: [],
      copyVariants: [],
      report: {
        executiveSummary: "Summary",
        conversionScore: 71,
        frictionMap: [],
        personaOutcomes: [],
        topBlockers: [],
        trustGaps: [],
        copyIssues: [],
        uiIssues: [],
        mobileIssues: [],
        recommendations: [],
        checklist: []
      },
      presenterReport: {
        title: "Presenter",
        subtitle: "Summary",
        durationSeconds: 0,
        voiceoverScript: "",
        executiveScript: "",
        captions: [],
        renderStatus: "DISABLED",
        scenes: []
      }
    }
  };
});

vi.mock("@/lib/db", () => ({
  prisma: mocks.prisma
}));

vi.mock("@/lib/env", () => ({
  getEnv: vi.fn(() => mocks.env)
}));

vi.mock("@/lib/extraction/fetch-page-html", () => ({
  fetchPageHtml: vi.fn(async () => ({
    finalUrl: "https://example.com",
    html: "<html><body>Launch faster. Book a demo.</body></html>",
    statusCode: 200
  }))
}));

vi.mock("@/lib/extraction/extract-visible-content", () => ({
  extractVisibleContent: vi.fn(() => mocks.snapshot)
}));

vi.mock("@/lib/ai/generate-audit-artifacts", () => ({
  generateAuditArtifacts: vi.fn(async () => mocks.artifacts)
}));

vi.mock("@/lib/screenshots/capture-audit-screenshots", () => ({
  captureAuditScreenshots: vi.fn()
}));

describe("runAuditWorkflow screenshot behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.env.enableScreenshotCapture = false;
  });

  it("does not create screenshot tool calls or screenshot records when capture is disabled", async () => {
    const { captureAuditScreenshots } = await import("@/lib/screenshots/capture-audit-screenshots");
    const { runAuditWorkflow } = await import("@/lib/workflow/run-audit-workflow");

    await runAuditWorkflow("audit_123", buildInput());

    expect(captureAuditScreenshots).not.toHaveBeenCalled();
    expect(mocks.prisma.screenshot.deleteMany).toHaveBeenCalledWith({ where: { auditRunId: "audit_123" } });
    expect(mocks.prisma.screenshot.createMany).not.toHaveBeenCalled();
    expect(mocks.prisma.toolCall.create).toHaveBeenCalledTimes(1);
    expect(mocks.prisma.toolCall.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ toolName: "extractPage" })
      })
    );
  });
});

function buildInput(): AuditInput {
  return {
    auditType: "LANDING",
    url: "https://example.com",
    targetAudience: "B2B SaaS founders",
    conversionGoal: "Book a demo",
    businessType: "saas",
    language: "en",
    personaCount: 3,
    demoMode: false
  };
}
