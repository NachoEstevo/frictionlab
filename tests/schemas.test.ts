import { describe, expect, it } from "vitest";
import { AuditInputSchema, WebappAuditInputSchema } from "@/lib/schemas/audit";
import { FindingSchema } from "@/lib/schemas/finding";

describe("audit schemas", () => {
  it("normalizes optional audit input defaults", () => {
    const input = AuditInputSchema.parse({
      url: "https://example.com",
      targetAudience: "B2B SaaS founders evaluating onboarding tools",
      conversionGoal: "Book a demo",
      businessType: "saas"
    });

    expect(input.auditType).toBe("LANDING");
    expect(input.personaCount).toBe(4);
    expect(input.language).toBe("en");
    expect(input.demoMode).toBe(false);
  });

  it("accepts webapp audit input with explicit guardrails", () => {
    const input = WebappAuditInputSchema.parse({
      auditType: "WEBAPP",
      url: "https://app.example.com/signup",
      targetAudience: "B2B SaaS operators evaluating workflow software",
      conversionGoal: "Create an account and complete onboarding",
      businessType: "saas",
      scenarioPrompt: "Sign up, confirm the account, create the first project and identify onboarding friction.",
      signupAllowed: true,
      allowedDomains: ["app.example.com", "example.com"],
      maxSteps: 12,
      mailboxMode: "GMAIL_IMAP",
      testUserProfile: {
        firstName: "Maya",
        lastName: "Rivera",
        company: "FrictionLab Test",
        role: "Growth lead"
      }
    });

    expect(input.auditType).toBe("WEBAPP");
    expect(input.mailboxMode).toBe("GMAIL_IMAP");
    expect(input.maxSteps).toBe(12);
    expect(input.allowedDomains).toEqual(["app.example.com", "example.com"]);
  });

  it("rejects webapp audit input without an allowed domain list", () => {
    expect(() =>
      AuditInputSchema.parse({
        auditType: "WEBAPP",
        url: "https://app.example.com/signup",
        targetAudience: "B2B SaaS operators evaluating workflow software",
        conversionGoal: "Create an account",
        businessType: "saas",
        scenarioPrompt: "Create an account and inspect onboarding.",
        signupAllowed: true,
        allowedDomains: []
      })
    ).toThrow(/allowedDomains/i);
  });

  it("rejects webapp audit input when the initial URL is outside allowedDomains", () => {
    expect(() =>
      AuditInputSchema.parse({
        auditType: "WEBAPP",
        url: "https://evil.example/signup",
        targetAudience: "B2B SaaS operators evaluating workflow software",
        conversionGoal: "Create an account",
        businessType: "saas",
        scenarioPrompt: "Create an account and inspect onboarding.",
        signupAllowed: true,
        allowedDomains: ["app.example.com"]
      })
    ).toThrow(/allowedDomains/i);
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
