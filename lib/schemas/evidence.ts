import { z } from "zod";

export const EvidenceRefSchema = z.object({
  sectionId: z.string(),
  sectionType: z.string(),
  quote: z.string().max(280),
  interpretation: z.string()
});

export type EvidenceRef = z.infer<typeof EvidenceRefSchema>;
