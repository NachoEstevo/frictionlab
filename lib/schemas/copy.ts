import { z } from "zod";

export const CopyVariantSchema = z.object({
  id: z.string(),
  type: z.enum(["hero", "cta", "faq", "trust_section"]),
  label: z.string(),
  content: z.record(z.string(), z.unknown()),
  rationale: z.string().optional()
});

export type CopyVariant = z.infer<typeof CopyVariantSchema>;
