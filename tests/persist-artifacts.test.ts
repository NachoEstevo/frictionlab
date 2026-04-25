import { describe, expect, it, vi } from "vitest";
import type { AuditInput } from "@/lib/schemas/audit";
import type { PageSnapshot } from "@/lib/schemas/page";
import { buildFallbackAuditArtifacts } from "@/lib/workflow/fallbacks";

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

vi.mock("@/lib/db", () => ({
  prisma: {
    $transaction: vi.fn(async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx))
  }
}));

describe("persistArtifacts", () => {
  it("uses an extended transaction timeout for artifact persistence", async () => {
    const { prisma } = await import("@/lib/db");
    const { persistArtifacts } = await import("@/lib/workflow/run-audit-workflow");

    await persistArtifacts("audit_123", buildFallbackAuditArtifacts(buildFallbackInput()));

    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ timeout: 20_000 }));
  });
});

function buildFallbackInput() {
  const input: AuditInput = {
    url: "https://example.com",
    targetAudience: "B2B SaaS founders",
    conversionGoal: "Book a demo",
    businessType: "saas",
    language: "en",
    personaCount: 3,
    demoMode: false
  };

  const pageSnapshot: PageSnapshot = {
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
    links: []
  };

  return {
    auditRunId: "audit_123",
    input,
    pageSnapshot
  };
}
