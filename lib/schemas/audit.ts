import { z } from "zod";

export const BusinessTypeSchema = z.enum([
  "saas",
  "agency",
  "ecommerce",
  "devtool",
  "fintech",
  "other"
]);

const BaseAuditInputSchema = z.object({
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

export const LandingAuditInputSchema = BaseAuditInputSchema.extend({
  auditType: z.literal("LANDING").default("LANDING")
});

export const TestUserProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  role: z.string().min(1).optional()
});

export const WebappAuditInputSchema = BaseAuditInputSchema.extend({
  auditType: z.literal("WEBAPP"),
  scenarioPrompt: z.string().min(20),
  signupAllowed: z.boolean().default(true),
  allowedDomains: z.array(z.string().min(3)).min(1, "allowedDomains must include at least one domain"),
  maxSteps: z.number().int().min(1).max(30).default(10),
  mailboxMode: z.literal("GMAIL_IMAP").default("GMAIL_IMAP"),
  testUserProfile: TestUserProfileSchema.optional()
});

export const AuditInputSchema = z.union([WebappAuditInputSchema, LandingAuditInputSchema]);

export type AuditInput = z.infer<typeof AuditInputSchema>;
export type LandingAuditInput = z.infer<typeof LandingAuditInputSchema>;
export type WebappAuditInput = z.infer<typeof WebappAuditInputSchema>;

export const AuditStatusSchema = z.enum([
  "CREATED",
  "RUNNING",
  "COMPLETED",
  "PARTIAL",
  "FAILED",
  "BLOCKED",
  "DEMO"
]);

export type AuditStatus = z.infer<typeof AuditStatusSchema>;
