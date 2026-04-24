import { z } from "zod";
import { EvidenceRefSchema } from "./evidence";

export const FindingSchema = z
  .object({
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
    suggestedCopy: z.string().optional()
  })
  .superRefine((finding, ctx) => {
    if (finding.category !== "missing_information" && finding.evidence.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Findings require evidence unless category is missing_information.",
        path: ["evidence"]
      });
    }
  });

export type Finding = z.infer<typeof FindingSchema>;
