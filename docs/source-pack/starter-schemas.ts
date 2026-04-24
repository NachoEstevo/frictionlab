import { z } from "zod";

export const AuditInputSchema = z.object({
  url: z.string().url(),
  targetAudience: z.string().min(10),
  conversionGoal: z.string().min(3),
  businessType: z.enum(["saas", "agency", "ecommerce", "devtool", "fintech", "other"]),
  language: z.string().default("en"),
  market: z.string().optional(),
  brandTone: z.string().optional(),
  personaCount: z.number().int().min(2).max(6).default(4),
  demoMode: z.boolean().default(false),
});

export const PageSectionSchema = z.object({
  id: z.string(),
  order: z.number(),
  type: z.enum(["hero", "benefits", "features", "proof", "pricing", "faq", "cta", "footer", "unknown"]),
  heading: z.string().optional(),
  text: z.string(),
  ctas: z.array(z.string()).default([]),
});

export const PageSnapshotSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  visibleText: z.string(),
  sections: z.array(PageSectionSchema),
  ctas: z.array(z.string()),
  links: z.array(z.object({ label: z.string(), href: z.string().optional() })),
});

export const EvidenceRefSchema = z.object({
  sectionId: z.string(),
  sectionType: z.string(),
  quote: z.string().max(280),
  interpretation: z.string(),
});

export const SyntheticPersonaSchema = z.object({
  id: z.string(),
  name: z.string(),
  segment: z.string(),
  context: z.string(),
  goal: z.string(),
  objections: z.array(z.string()).min(2).max(6),
  trustSensitivity: z.enum(["low", "medium", "high"]),
  priceSensitivity: z.enum(["low", "medium", "high"]),
  technicalLevel: z.enum(["low", "medium", "high"]),
  patience: z.enum(["low", "medium", "high"]),
  device: z.enum(["desktop", "mobile"]),
  likelyQuestions: z.array(z.string()).min(2).max(8),
  conversionTriggers: z.array(z.string()).min(2).max(8),
  abandonmentTriggers: z.array(z.string()).min(2).max(8),
  decisionStyle: z.enum([
    "fast_skeptic",
    "methodical_researcher",
    "price_comparer",
    "trust_first_buyer",
    "technical_evaluator",
    "busy_executive"
  ]),
});

export const SessionEventSchema = z.object({
  order: z.number(),
  stage: z.enum([
    "arrival",
    "hero_scan",
    "offer_evaluation",
    "proof_check",
    "pricing_check",
    "cta_evaluation",
    "final_decision"
  ]),
  personaThought: z.string(),
  observedEvidence: z.array(EvidenceRefSchema),
  friction: z.string().optional(),
  emotion: z.enum(["curious", "confused", "skeptical", "reassured", "frustrated", "ready"]),
  decision: z.enum(["continue", "hesitate", "bounce", "convert"]),
});

export const PersonaSessionSchema = z.object({
  id: z.string(),
  auditRunId: z.string(),
  personaId: z.string(),
  timeline: z.array(SessionEventSchema).min(4).max(10),
  heroClarity: z.number().min(0).max(100),
  offerUnderstanding: z.number().min(0).max(100),
  relevance: z.number().min(0).max(100),
  trust: z.number().min(0).max(100),
  pricingClarity: z.number().min(0).max(100),
  processClarity: z.number().min(0).max(100),
  ctaReadiness: z.number().min(0).max(100),
  objections: z.array(z.string()),
  missingInformation: z.array(z.string()),
  likelyBouncePoint: z.string(),
  conversionLikelihood: z.number().min(0).max(100),
  frictionPoints: z.array(z.object({
    problem: z.string(),
    severity: z.enum(["low", "medium", "high", "critical"]),
    evidenceRefs: z.array(EvidenceRefSchema),
  })),
  quotes: z.array(z.string()),
  finalVerdict: z.enum(["convert", "hesitate", "bounce"]),
});

export const FindingSchema = z.object({
  id: z.string(),
  category: z.enum([
    "hero",
    "offer_clarity",
    "trust",
    "pricing",
    "process",
    "cta",
    "copy",
    "ui",
    "mobile",
    "missing_information"
  ]),
  problem: z.string(),
  evidence: z.array(EvidenceRefSchema),
  affectedPersonas: z.array(z.string()),
  severity: z.enum(["low", "medium", "high", "critical"]),
  impact: z.enum(["low", "medium", "high"]),
  effort: z.enum(["low", "medium", "high"]),
  confidence: z.number().min(0).max(1),
  suggestedFix: z.string(),
  suggestedCopy: z.string().optional(),
});

export const RecommendationSchema = z.object({
  id: z.string(),
  findingIds: z.array(z.string()),
  title: z.string(),
  whyItMatters: z.string(),
  implementation: z.string(),
  impact: z.enum(["low", "medium", "high"]),
  effort: z.enum(["low", "medium", "high"]),
  priority: z.number().min(1).max(10),
  checklist: z.array(z.string()),
});

export const PresenterSceneSchema = z.object({
  id: z.string(),
  order: z.number(),
  title: z.string(),
  narration: z.string(),
  visualType: z.enum([
    "intro",
    "score",
    "screenshot",
    "persona",
    "finding",
    "recommendation",
    "copy_before_after",
    "outro"
  ]),
  visualPayload: z.record(z.any()),
  durationSeconds: z.number().min(3).max(15),
  caption: z.string(),
});

export const PresenterReportSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  durationSeconds: z.number().min(30).max(90),
  voiceoverScript: z.string(),
  executiveScript: z.string().optional(),
  scenes: z.array(PresenterSceneSchema).min(5).max(8),
  captions: z.array(z.string()),
});
