import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { AuditInputSchema, type AuditInput } from "@/lib/schemas/audit";
import { seedDemoRun } from "@/lib/demo/seed-run";
import { runAuditWorkflow } from "@/lib/workflow/run-audit-workflow";
import { runWebappAuditWorkflow } from "@/lib/workflow/run-webapp-audit-workflow";
import { after } from "next/server";

type ScheduleAuditWorkflow = (auditRunId: string, input: AuditInput) => void;

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
      auditType: input.auditType,
      status: "RUNNING",
      mode: input.auditType === "WEBAPP" ? "WEBAPP" : "LIVE"
    }
  });

  scheduleAuditWorkflow(auditRun.id, input);
  return { auditRunId: auditRun.id, status: auditRun.status };
}

export const scheduleAuditWorkflow: ScheduleAuditWorkflow = (auditRunId, input) => {
  after(async () => {
    try {
      if (input.auditType === "WEBAPP") {
        await runWebappAuditWorkflow(auditRunId, input);
      } else {
        await runAuditWorkflow(auditRunId, input);
      }
    } catch (error) {
      console.error("Audit workflow failed after response", {
        auditRunId,
        error: error instanceof Error ? error.message : "Unknown workflow error"
      });
    }
  });
};

export function normalizeAuditInputForDemo(input?: Partial<AuditInput>): AuditInput {
  return AuditInputSchema.parse({
    auditType: input?.auditType || "LANDING",
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
