import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { AuditInputSchema, type AuditInput } from "@/lib/schemas/audit";
import { seedDemoRun } from "@/lib/demo/seed-run";
import { runAuditWorkflow } from "@/lib/workflow/run-audit-workflow";

export async function startAudit(rawInput: unknown) {
  const input = AuditInputSchema.parse(rawInput);
  const env = getEnv();

  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is required to persist real audits. Configure Postgres before starting an audit.");
  }

  if (input.demoMode || env.mockMode) {
    const demoRun = await seedDemoRun(input);
    return { auditRunId: demoRun.id, status: demoRun.status };
  }

  const auditRun = await prisma.auditRun.create({
    data: {
      url: input.url,
      targetAudience: input.targetAudience,
      conversionGoal: input.conversionGoal,
      businessType: input.businessType,
      language: input.language,
      market: input.market,
      brandTone: input.brandTone,
      personaCount: input.personaCount,
      status: "CREATED",
      mode: "LIVE"
    }
  });

  const completedRun = await runAuditWorkflow(auditRun.id, input);
  return { auditRunId: completedRun.id, status: completedRun.status };
}

export function normalizeAuditInputForDemo(input?: Partial<AuditInput>): AuditInput {
  return AuditInputSchema.parse({
    url: input?.url || "https://launchpilot.example",
    targetAudience: input?.targetAudience || "B2B SaaS founders preparing a product launch",
    conversionGoal: input?.conversionGoal || "Book a demo",
    businessType: input?.businessType || "saas",
    language: input?.language || "en",
    market: input?.market || "US",
    brandTone: input?.brandTone || "clear, sharp and founder-friendly",
    personaCount: input?.personaCount || 4,
    demoMode: true
  });
}
