import { z } from "zod";

export const SensitivitySchema = z.enum(["low", "medium", "high"]);
export const DeviceSchema = z.enum(["desktop", "mobile"]);

export const SyntheticPersonaSchema = z.object({
  id: z.string(),
  name: z.string(),
  segment: z.string(),
  context: z.string(),
  goal: z.string(),
  objections: z.array(z.string()).min(2).max(6),
  trustSensitivity: SensitivitySchema,
  priceSensitivity: SensitivitySchema,
  technicalLevel: SensitivitySchema,
  patience: SensitivitySchema,
  device: DeviceSchema,
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
  ])
});

export type SyntheticPersona = z.infer<typeof SyntheticPersonaSchema>;
