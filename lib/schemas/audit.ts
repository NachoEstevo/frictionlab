import { z } from "zod";

export const BusinessTypeSchema = z.enum([
  "saas",
  "agency",
  "ecommerce",
  "devtool",
  "fintech",
  "other"
]);

export const AuditInputSchema = z.object({
  url: z.string().url(),
  targetAudience: z.string().min(10),
  conversionGoal: z.string().min(3),
  businessType: BusinessTypeSchema,
  language: z.string().default("en"),
  market: z.string().optional(),
  brandTone: z.string().optional(),
  personaCount: z.number().int().min(2).max(6).default(4),
  demoMode: z.boolean().default(false)
});

export type AuditInput = z.infer<typeof AuditInputSchema>;

export const AuditStatusSchema = z.enum([
  "CREATED",
  "RUNNING",
  "COMPLETED",
  "PARTIAL",
  "FAILED",
  "DEMO"
]);

export type AuditStatus = z.infer<typeof AuditStatusSchema>;
