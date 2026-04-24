import { z } from "zod";

export const RecommendationSchema = z.object({
  id: z.string(),
  findingIds: z.array(z.string()),
  title: z.string(),
  whyItMatters: z.string(),
  implementation: z.string(),
  impact: z.enum(["low", "medium", "high"]),
  effort: z.enum(["low", "medium", "high"]),
  priority: z.number().int().min(1).max(10),
  checklist: z.array(z.string())
});

export type Recommendation = z.infer<typeof RecommendationSchema>;
