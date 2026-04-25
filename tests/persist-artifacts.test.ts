import { beforeEach, describe, expect, it, vi } from "vitest";
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses an extended transaction timeout for artifact persistence", async () => {
    const { prisma } = await import("@/lib/db");
    const { persistArtifacts } = await import("@/lib/workflow/run-audit-workflow");

    await persistArtifacts("audit_123", buildFallbackAuditArtifacts(buildFallbackInput()));

    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ timeout: 20_000 }));
  });

  it("namespaces artifact primary keys and relationship references by audit run", async () => {
    const { persistArtifacts } = await import("@/lib/workflow/run-audit-workflow");

    await persistArtifacts("audit_123", buildFallbackAuditArtifacts(buildFallbackInput()));

    const personaCreateManyInput = firstMockArg(tx.persona.createMany);
    expect(personaCreateManyInput?.data[0].id).toBe("audit_123__persona_maya");

    const sessionCreateInput = firstMockArg(tx.personaSession.create);
    expect(sessionCreateInput?.data.id).toBe("audit_123__session_persona_maya");
    expect(sessionCreateInput?.data.personaId).toBe("audit_123__persona_maya");

    const findingCreateManyInput = firstMockArg(tx.finding.createMany);
    expect(findingCreateManyInput?.data[0].id).toBe("audit_123__finding_offer_clarity");
    expect(findingCreateManyInput?.data[0].affectedPersonas).toContain("audit_123__persona_maya");

    const recommendationCreateManyInput = firstMockArg(tx.recommendation.createMany);
    expect(recommendationCreateManyInput?.data[0].id).toBe("audit_123__rec_hero_specificity");
    expect(recommendationCreateManyInput?.data[0].findingIds).toContain("audit_123__finding_offer_clarity");

    const reportCreateInput = firstMockArg(tx.report.create);
    expect(reportCreateInput?.data.personaOutcomes[0].personaId).toBe("audit_123__persona_maya");
  });
});

function firstMockArg(mock: { mock: { calls: unknown[][] } }) {
  return mock.mock.calls[0]?.[0] as any;
}

function buildFallbackInput() {
  const input: AuditInput = {
    auditType: "LANDING",
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
