import type { AuditInput } from "@/lib/schemas/audit";
import type { EvidenceRef } from "@/lib/schemas/evidence";
import type { Finding } from "@/lib/schemas/finding";
import type { PageSnapshot } from "@/lib/schemas/page";
import type { SyntheticPersona } from "@/lib/schemas/persona";
import type { Recommendation } from "@/lib/schemas/recommendation";
import type { Report } from "@/lib/schemas/report";
import type { PersonaSession } from "@/lib/schemas/session";
import type { CopyVariant } from "@/lib/schemas/copy";
import type { PresenterReport } from "@/lib/schemas/presenter";

type BuildFallbackAuditArtifactsInput = {
  auditRunId: string;
  input: AuditInput;
  pageSnapshot: PageSnapshot;
};

export type FallbackAuditArtifacts = {
  personas: SyntheticPersona[];
  sessions: PersonaSession[];
  findings: Finding[];
  recommendations: Recommendation[];
  copyVariants: CopyVariant[];
  report: Report;
  presenterReport: PresenterReport;
};

export function buildFallbackAuditArtifacts({
  auditRunId,
  input,
  pageSnapshot
}: BuildFallbackAuditArtifactsInput): FallbackAuditArtifacts {
  const evidence = firstEvidence(pageSnapshot);
  const personas = buildPersonas(input).slice(0, input.personaCount);
  const sessions = personas.map((persona, index) => buildSession(auditRunId, persona, evidence, index));
  const findings = buildFindings(personas, evidence);
  const recommendations = buildRecommendations(findings);
  const copyVariants = buildCopyVariants(input, pageSnapshot, findings);
  const report = buildReport(sessions, findings, recommendations);
  const presenterReport = buildPresenterReport(input, report, copyVariants);

  return { personas, sessions, findings, recommendations, copyVariants, report, presenterReport };
}

function firstEvidence(pageSnapshot: PageSnapshot): EvidenceRef {
  const section = pageSnapshot.sections[0];
  const quote = section?.heading || section?.text || pageSnapshot.visibleText || "No visible page text was extracted.";

  return {
    sectionId: section?.id || "missing_information",
    sectionType: section?.type || "missing_information",
    quote: quote.slice(0, 220),
    interpretation: section
      ? "This is the first meaningful page evidence available to synthetic evaluators."
      : "The page did not expose enough extractable DOM evidence."
  };
}

function buildPersonas(input: AuditInput): SyntheticPersona[] {
  return [
    {
      id: "persona_maya",
      name: "Maya Chen",
      segment: "Busy founder",
      context: `Evaluating whether this can help ${input.targetAudience}.`,
      goal: input.conversionGoal,
      objections: ["Needs value in seconds", "Will abandon if the offer stays abstract"],
      trustSensitivity: "medium",
      priceSensitivity: "medium",
      technicalLevel: "medium",
      patience: "low",
      device: "mobile",
      likelyQuestions: ["What does this do?", "Why should I act now?"],
      conversionTriggers: ["Clear outcome", "Low-friction CTA"],
      abandonmentTriggers: ["Vague hero", "Too much reading before proof"],
      decisionStyle: "busy_executive"
    },
    {
      id: "persona_diego",
      name: "Diego Alvarez",
      segment: "Technical evaluator",
      context: "Checks implementation depth and integration risk before engaging.",
      goal: input.conversionGoal,
      objections: ["Needs technical specifics", "Worries about workflow fit"],
      trustSensitivity: "high",
      priceSensitivity: "low",
      technicalLevel: "high",
      patience: "medium",
      device: "desktop",
      likelyQuestions: ["How does it integrate?", "What proof supports the claim?"],
      conversionTriggers: ["Concrete workflow detail", "Technical credibility"],
      abandonmentTriggers: ["Missing implementation detail", "No proof"],
      decisionStyle: "technical_evaluator"
    },
    {
      id: "persona_priya",
      name: "Priya Shah",
      segment: "Price-sensitive buyer",
      context: "Compares options and wants to understand buying friction early.",
      goal: input.conversionGoal,
      objections: ["Needs pricing signal", "Needs scope clarity"],
      trustSensitivity: "medium",
      priceSensitivity: "high",
      technicalLevel: "medium",
      patience: "medium",
      device: "desktop",
      likelyQuestions: ["What does this cost?", "What happens after I click?"],
      conversionTriggers: ["Pricing/process clarity", "Risk reduction"],
      abandonmentTriggers: ["No pricing clue", "Unclear next step"],
      decisionStyle: "price_comparer"
    },
    {
      id: "persona_amara",
      name: "Amara Okafor",
      segment: "Trust-first operator",
      context: "Needs confidence that the product is credible and operationally safe.",
      goal: input.conversionGoal,
      objections: ["Needs social proof", "Needs evidence of reliability"],
      trustSensitivity: "high",
      priceSensitivity: "medium",
      technicalLevel: "medium",
      patience: "high",
      device: "mobile",
      likelyQuestions: ["Who trusts this?", "What risk does it remove?"],
      conversionTriggers: ["Proof", "Specific claims grounded in evidence"],
      abandonmentTriggers: ["Unsubstantiated claims", "No FAQ or proof"],
      decisionStyle: "trust_first_buyer"
    }
  ];
}

function buildSession(
  auditRunId: string,
  persona: SyntheticPersona,
  evidence: EvidenceRef,
  index: number
): PersonaSession {
  const baseScore = Math.max(38, 72 - index * 7);

  return {
    id: `session_${persona.id}`,
    auditRunId,
    personaId: persona.id,
    timeline: [
      {
        order: 1,
        stage: "arrival",
        personaThought: `${persona.name} scans the page for immediate relevance.`,
        observedEvidence: [evidence],
        emotion: "curious",
        decision: "continue"
      },
      {
        order: 2,
        stage: "hero_scan",
        personaThought: "The first screen creates interest but still needs sharper conversion context.",
        observedEvidence: [evidence],
        friction: "The page needs to connect the main claim to the visitor's exact next step faster.",
        emotion: "skeptical",
        decision: "hesitate"
      },
      {
        order: 3,
        stage: "proof_check",
        personaThought: "They look for proof or specificity before trusting the CTA.",
        observedEvidence: [evidence],
        friction: "Proof and risk reducers are not prominent in the extracted first-page evidence.",
        emotion: "confused",
        decision: "hesitate"
      },
      {
        order: 4,
        stage: "final_decision",
        personaThought: "They may continue if the CTA is low-commitment, but confidence is not complete.",
        observedEvidence: [evidence],
        emotion: "skeptical",
        decision: baseScore > 58 ? "continue" : "bounce"
      }
    ],
    heroClarity: baseScore,
    offerUnderstanding: baseScore - 4,
    relevance: baseScore + 5,
    trust: baseScore - 12,
    pricingClarity: 35,
    processClarity: 48,
    ctaReadiness: baseScore - 8,
    objections: persona.objections,
    missingInformation: ["Pricing or buying-process detail", "Specific proof near the first CTA"],
    likelyBouncePoint: "Before committing to the primary CTA",
    conversionLikelihood: baseScore - 10,
    frictionPoints: [
      {
        problem: "The page needs stronger proof and next-step clarity before the CTA.",
        severity: "medium",
        evidenceRefs: [evidence]
      }
    ],
    quotes: [`I understand the direction, but I need more proof before I ${persona.goal.toLowerCase()}.`],
    finalVerdict: baseScore > 62 ? "hesitate" : "bounce"
  };
}

function buildFindings(personas: SyntheticPersona[], evidence: EvidenceRef): Finding[] {
  return [
    {
      id: "finding_offer_clarity",
      category: "offer_clarity",
      problem: "The first extracted section does not fully explain why this offer is the best next action now.",
      evidence: [evidence],
      affectedPersonas: personas.map((persona) => persona.id),
      severity: "high",
      impact: "high",
      effort: "medium",
      confidence: 0.78,
      suggestedFix: "Rewrite the hero around one concrete audience, outcome and next step.",
      suggestedCopy: "Turn landing-page uncertainty into a prioritized action plan before traffic leaks."
    },
    {
      id: "finding_missing_pricing_process",
      category: "missing_information",
      problem: "Pricing or buying-process detail is not visible in the extracted evidence.",
      evidence: [],
      affectedPersonas: ["persona_priya", "persona_diego"],
      severity: "medium",
      impact: "medium",
      effort: "low",
      confidence: 0.7,
      suggestedFix: "Add a short section that explains pricing signal, timeline or what happens after the CTA."
    }
  ];
}

function buildRecommendations(findings: Finding[]): Recommendation[] {
  return [
    {
      id: "rec_hero_specificity",
      findingIds: [findings[0]?.id || "finding_offer_clarity"],
      title: "Make the hero outcome-specific",
      whyItMatters: "Synthetic visitors need to understand the offer before they evaluate proof or pricing.",
      implementation: "Use one audience, one measurable outcome and one low-friction CTA in the first viewport.",
      impact: "high",
      effort: "medium",
      priority: 9,
      checklist: ["Name the target audience", "State the conversion outcome", "Make the CTA describe the next step"]
    },
    {
      id: "rec_trust_process",
      findingIds: findings.map((finding) => finding.id),
      title: "Add trust and process detail before the CTA",
      whyItMatters: "Skeptical and price-sensitive users hesitate when the next step feels opaque.",
      implementation: "Add proof, implementation detail and a brief buying-process note near the primary CTA.",
      impact: "medium",
      effort: "low",
      priority: 7,
      checklist: ["Add one proof point", "Explain what happens after clicking", "Clarify whether pricing is available"]
    }
  ];
}

function buildCopyVariants(input: AuditInput, pageSnapshot: PageSnapshot, findings: Finding[]): CopyVariant[] {
  const productName = pageSnapshot.title || "Your landing page";

  return [
    {
      id: "copy_hero_conservative",
      type: "hero",
      label: "Conservative",
      content: {
        headline: `${productName} for ${input.targetAudience}`,
        subheadline: `Clarify the path to ${input.conversionGoal.toLowerCase()} with evidence-backed improvements.`,
        cta: input.conversionGoal
      },
      rationale: findings[0]?.problem
    },
    {
      id: "copy_cta_low_friction",
      type: "cta",
      label: "Low-friction CTA",
      content: {
        primary: "See the audit plan",
        secondary: "Review proof first"
      },
      rationale: "Makes the next step feel lower risk for skeptical visitors."
    },
    {
      id: "copy_faq",
      type: "faq",
      label: "FAQ prompts",
      content: {
        questions: ["What happens after I submit the form?", "How quickly will I see results?", "What proof supports this offer?"]
      },
      rationale: "Addresses recurring missing-information friction."
    }
  ];
}

function buildReport(sessions: PersonaSession[], findings: Finding[], recommendations: Recommendation[]): Report {
  const conversionScore = scoreSessions(sessions, findings);

  return {
    executiveSummary:
      "The page creates initial interest but loses confidence when visitors look for concrete proof, process and next-step clarity.",
    conversionScore,
    frictionMap: [
      { stage: "First impression", score: average(sessions.map((session) => session.heroClarity)), risk: "Hero needs sharper specificity." },
      {
        stage: "Understanding",
        score: average(sessions.map((session) => session.offerUnderstanding)),
        risk: "Visitors understand the category before they understand the strongest reason to act."
      },
      { stage: "Trust", score: average(sessions.map((session) => session.trust)), risk: "Proof is not prominent enough." },
      { stage: "CTA", score: average(sessions.map((session) => session.ctaReadiness)), risk: "Next step needs less ambiguity." }
    ],
    personaOutcomes: sessions.map((session) => ({
      personaId: session.personaId,
      name: session.personaId.replace("persona_", ""),
      verdict: session.finalVerdict,
      conversionLikelihood: session.conversionLikelihood
    })),
    topBlockers: findings,
    trustGaps: ["Specific proof", "Buying-process clarity"],
    copyIssues: ["Hero could be more outcome-specific"],
    uiIssues: ["Primary CTA context should be clearer"],
    mobileIssues: ["Mobile visitors need proof before deep scrolling"],
    recommendations,
    checklist: recommendations.flatMap((recommendation) => recommendation.checklist)
  };
}

function buildPresenterReport(input: AuditInput, report: Report, copyVariants: CopyVariant[]): PresenterReport {
  const scenes = [
    {
      id: "scene_intro",
      order: 1,
      title: "Audit context",
      narration: `We evaluated this landing page for ${input.targetAudience}, focused on the goal: ${input.conversionGoal}.`,
      visualType: "intro" as const,
      visualPayload: { audience: input.targetAudience, goal: input.conversionGoal },
      durationSeconds: 8,
      caption: "Synthetic conversion research brief"
    },
    {
      id: "scene_score",
      order: 2,
      title: "Conversion score",
      narration: `The current conversion score is ${report.conversionScore} out of 100, with the biggest risk around clarity and trust.`,
      visualType: "score" as const,
      visualPayload: { score: report.conversionScore },
      durationSeconds: 8,
      caption: `${report.conversionScore}/100 conversion readiness`
    },
    {
      id: "scene_personas",
      order: 3,
      title: "Persona reactions",
      narration: "The synthetic swarm hesitated when the page did not answer proof, process and pricing questions fast enough.",
      visualType: "persona" as const,
      visualPayload: { outcomes: report.personaOutcomes },
      durationSeconds: 10,
      caption: "Different visitors hit the same confidence gap"
    },
    {
      id: "scene_friction",
      order: 4,
      title: "Top friction",
      narration: report.topBlockers[0]?.problem || "The top friction is missing information.",
      visualType: "finding" as const,
      visualPayload: { finding: report.topBlockers[0] },
      durationSeconds: 10,
      caption: "The largest blocker is evidence-backed"
    },
    {
      id: "scene_fix",
      order: 5,
      title: "Recommended fix",
      narration: report.recommendations[0]?.implementation || "Clarify the hero and add proof before the main CTA.",
      visualType: "recommendation" as const,
      visualPayload: { recommendation: report.recommendations[0] },
      durationSeconds: 10,
      caption: "Prioritize clarity before polish"
    },
    {
      id: "scene_copy",
      order: 6,
      title: "Copy direction",
      narration: "The strongest copy direction ties the audience, outcome and next step together in the first viewport.",
      visualType: "copy_before_after" as const,
      visualPayload: { copy: copyVariants[0] },
      durationSeconds: 8,
      caption: "Make the next action obvious"
    }
  ];

  return {
    title: "FrictionLab Presenter Report",
    subtitle: "60-second synthetic UX research brief",
    durationSeconds: scenes.reduce((total, scene) => total + scene.durationSeconds, 0),
    voiceoverScript: scenes.map((scene) => scene.narration).join(" "),
    executiveScript: "Use this brief to explain the audit findings and first fixes to a client or team.",
    scenes,
    captions: scenes.map((scene) => scene.caption),
    renderStatus: "DISABLED"
  };
}

function scoreSessions(sessions: PersonaSession[], findings: Finding[]): number {
  const base =
    0.25 * average(sessions.map((session) => session.heroClarity)) +
    0.2 * average(sessions.map((session) => session.offerUnderstanding)) +
    0.2 * average(sessions.map((session) => session.trust)) +
    0.15 * average(sessions.map((session) => session.ctaReadiness)) +
    0.1 * average(sessions.map((session) => session.processClarity)) +
    0.1 * average(sessions.map((session) => session.pricingClarity));

  const penalty = findings.filter((finding) => finding.severity === "high" || finding.severity === "critical").length * 4;
  return Math.max(0, Math.min(100, Math.round(base - penalty)));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
