import { describe, expect, it } from "vitest";
import { AuditInputSchema } from "@/lib/schemas/audit";
import { FindingSchema } from "@/lib/schemas/finding";

describe("audit schemas", () => {
  it("normalizes optional audit input defaults", () => {
    const input = AuditInputSchema.parse({
      url: "https://example.com",
      targetAudience: "B2B SaaS founders evaluating onboarding tools",
      conversionGoal: "Book a demo",
      businessType: "saas"
    });

    expect(input.personaCount).toBe(4);
    expect(input.language).toBe("en");
    expect(input.demoMode).toBe(false);
  });

  it("requires evidence or missing_information category for findings", () => {
    expect(() =>
      FindingSchema.parse({
        id: "finding_1",
        category: "hero",
        problem: "Hero copy is vague",
        evidence: [],
        affectedPersonas: ["persona_1"],
        severity: "high",
        impact: "high",
        effort: "medium",
        confidence: 0.8,
        suggestedFix: "Rewrite the hero around the concrete outcome."
      })
    ).toThrow(/evidence/i);

    const missingInfoFinding = FindingSchema.parse({
      id: "finding_2",
      category: "missing_information",
      problem: "Pricing is not stated on the page",
      evidence: [],
      affectedPersonas: ["persona_2"],
      severity: "medium",
      impact: "medium",
      effort: "low",
      confidence: 0.7,
      suggestedFix: "Add a pricing range or buying-process note."
    });

    expect(missingInfoFinding.category).toBe("missing_information");
  });
});
