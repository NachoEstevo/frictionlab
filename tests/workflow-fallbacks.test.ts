import { describe, expect, it } from "vitest";
import { buildFallbackAuditArtifacts } from "@/lib/workflow/fallbacks";
import type { AuditInput } from "@/lib/schemas/audit";

describe("workflow fallbacks", () => {
  it("creates evidence-backed fallback artifacts when AI is unavailable", () => {
    const input: AuditInput = {
      auditType: "LANDING",
      url: "https://example.com",
      targetAudience: "B2B SaaS founders evaluating launch software",
      conversionGoal: "Book a demo",
      businessType: "saas",
      language: "en",
      personaCount: 4,
      demoMode: false
    };

    const artifacts = buildFallbackAuditArtifacts({
      auditRunId: "audit_1",
      input,
      pageSnapshot: {
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
      }
    });

    expect(artifacts.personas).toHaveLength(4);
    expect(artifacts.sessions).toHaveLength(4);
    expect(artifacts.findings[0]?.evidence.length).toBeGreaterThan(0);
    expect(artifacts.report.conversionScore).toBeGreaterThanOrEqual(0);
    expect(artifacts.presenterReport.scenes.length).toBeGreaterThanOrEqual(5);
  });
});
