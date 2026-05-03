import { describe, expect, it } from "vitest";
import {
  AI_GUARDRAILS,
  copyPrompt,
  findingsPrompt,
  personasPrompt,
  recommendationsPrompt,
  reportPrompt,
  sessionsPrompt
} from "@/lib/ai/prompts";
import type { AuditInput } from "@/lib/schemas/audit";
import type { Finding } from "@/lib/schemas/finding";
import type { PageSnapshot } from "@/lib/schemas/page";
import type { SyntheticPersona } from "@/lib/schemas/persona";
import type { Recommendation } from "@/lib/schemas/recommendation";
import type { PersonaSession } from "@/lib/schemas/session";

describe("AI prompts", () => {
  it("calibrates the reviewer tone around constructive but direct feedback", () => {
    expect(AI_GUARDRAILS).toContain("constructive");
    expect(AI_GUARDRAILS).toContain("Do not roast");
    expect(AI_GUARDRAILS).toContain("Do not be overly friendly");
    expect(AI_GUARDRAILS).toContain("Call out severe blockers plainly");
  });

  it("requires findings to include positive signals, evidence, severity calibration and confidence rationale", () => {
    const prompt = findingsPrompt(buildPageSnapshot(), buildSessions());

    expect(prompt).toContain("positive signal");
    expect(prompt).toContain("Observation");
    expect(prompt).toContain("Friction risk");
    expect(prompt).toContain("Severity rubric");
    expect(prompt).toContain("critical");
    expect(prompt).toContain("Do not turn missing evidence into a harsh criticism");
    expect(prompt).toContain("confidence");
  });

  it("anchors recommendations and reports in the calibrated findings instead of generic advice", () => {
    const findings = buildFindings();
    const recommendations = buildRecommendations();

    expect(recommendationsPrompt(findings)).toContain("Keep the tone practical, not scolding");
    expect(recommendationsPrompt(findings)).toContain("Preserve what already works");
    expect(copyPrompt(buildInput(), buildPageSnapshot(), findings)).toContain("Do not overwrite a strong existing message");
    expect(reportPrompt(buildSessions(), findings, recommendations, [])).toContain("balanced");
    expect(reportPrompt(buildSessions(), findings, recommendations, [])).toContain("What is already working");
  });

  it("asks personas and sessions to distinguish observed behavior from inferred risk", () => {
    const personas = buildPersonas();

    expect(personasPrompt(buildInput(), buildPageSnapshot())).toContain("skepticism");
    expect(sessionsPrompt(buildInput(), buildPageSnapshot(), personas, "audit_123")).toContain("observed evidence");
    expect(sessionsPrompt(buildInput(), buildPageSnapshot(), personas, "audit_123")).toContain("inferred hesitation");
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
    market: "US",
    brandTone: "clear",
    personaCount: 2,
    demoMode: false
  };
}

function buildPageSnapshot(): PageSnapshot {
  return {
    title: "Example",
    description: "Launch faster",
    visibleText: "Launch faster. Book a demo.",
    sections: [
      {
        id: "section_1",
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
}

function buildPersonas(): SyntheticPersona[] {
  return [
    {
      id: "persona_founder",
      name: "Maya Chen",
      segment: "Founder",
      context: "Evaluating a SaaS product",
      goal: "Book a demo",
      objections: ["Needs proof"],
      trustSensitivity: "high",
      priceSensitivity: "medium",
      technicalLevel: "medium",
      patience: "low",
      device: "desktop",
      likelyQuestions: ["Can this solve my current problem?"],
      conversionTriggers: ["Clear proof"],
      abandonmentTriggers: ["Vague claim"],
      decisionStyle: "fast_skeptic"
    }
  ];
}

function buildSessions(): PersonaSession[] {
  return [
    {
      id: "session_1",
      auditRunId: "audit_123",
      personaId: "persona_founder",
      heroClarity: 70,
      offerUnderstanding: 65,
      relevance: 75,
      trust: 55,
      pricingClarity: 40,
      processClarity: 50,
      ctaReadiness: 60,
      conversionLikelihood: 58,
      likelyBouncePoint: "Before CTA",
      finalVerdict: "hesitate",
      objections: ["Needs proof"],
      missingInformation: ["pricing"],
      frictionPoints: [
        {
          problem: "Claim needs support",
          severity: "medium",
          evidenceRefs: [
            {
              sectionId: "section_1",
              sectionType: "hero",
              quote: "Launch faster",
              interpretation: "Strong but unsupported"
            }
          ]
        }
      ],
      quotes: ["I need proof before booking."],
      timeline: []
    }
  ];
}

function buildFindings(): Finding[] {
  return [
    {
      id: "finding_1",
      category: "trust",
      problem: "The hero claim is useful but needs proof near the CTA.",
      evidence: [
        {
          sectionId: "section_1",
          sectionType: "hero",
          quote: "Launch faster",
          interpretation: "Specific claim without nearby proof"
        }
      ],
      affectedPersonas: ["persona_founder"],
      severity: "medium",
      impact: "medium",
      effort: "low",
      confidence: 0.76,
      suggestedFix: "Add proof below the hero CTA."
    }
  ];
}

function buildRecommendations(): Recommendation[] {
  return [
    {
      id: "rec_1",
      findingIds: ["finding_1"],
      title: "Add proof near the CTA",
      whyItMatters: "It reduces hesitation.",
      implementation: "Add one proof point below the CTA.",
      impact: "medium",
      effort: "low",
      priority: 7,
      checklist: ["Add metric", "Add customer quote"]
    }
  ];
}
