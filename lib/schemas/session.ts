import { z } from "zod";
import { EvidenceRefSchema } from "./evidence";

export const SessionEventSchema = z.object({
  order: z.number().int().positive(),
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
  decision: z.enum(["continue", "hesitate", "bounce", "convert"])
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
  frictionPoints: z.array(
    z.object({
      problem: z.string(),
      severity: z.enum(["low", "medium", "high", "critical"]),
      evidenceRefs: z.array(EvidenceRefSchema)
    })
  ),
  quotes: z.array(z.string()),
  finalVerdict: z.enum(["convert", "hesitate", "bounce"])
});

export type PersonaSession = z.infer<typeof PersonaSessionSchema>;
export type SessionEvent = z.infer<typeof SessionEventSchema>;
