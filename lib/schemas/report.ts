import { z } from "zod";
import { FindingSchema } from "./finding";
import { RecommendationSchema } from "./recommendation";

export const ReportSchema = z.object({
  executiveSummary: z.string(),
  conversionScore: z.number().int().min(0).max(100),
  frictionMap: z.array(
    z.object({
      stage: z.string(),
      score: z.number().int().min(0).max(100),
      risk: z.string()
    })
  ),
  personaOutcomes: z.array(
    z.object({
      personaId: z.string(),
      name: z.string(),
      verdict: z.string(),
      conversionLikelihood: z.number().int().min(0).max(100)
    })
  ),
  topBlockers: z.array(FindingSchema),
  trustGaps: z.array(z.string()),
  copyIssues: z.array(z.string()),
  uiIssues: z.array(z.string()),
  mobileIssues: z.array(z.string()),
  recommendations: z.array(RecommendationSchema),
  checklist: z.array(z.string())
});

export type Report = z.infer<typeof ReportSchema>;
