import { prisma } from "@/lib/db";
import { launchPilotInput, launchPilotSnapshot } from "@/lib/demo/mock-data";
import type { Prisma } from "@prisma/client";
import type { AuditInput } from "@/lib/schemas/audit";
import { buildFallbackAuditArtifacts } from "@/lib/workflow/fallbacks";
import { persistArtifacts } from "@/lib/workflow/run-audit-workflow";

export async function seedDemoRun(input: AuditInput = launchPilotInput) {
  const demoInput = {
    ...launchPilotInput,
    ...input,
    demoMode: true
  };

  const auditRun = await prisma.auditRun.create({
    data: {
      url: demoInput.url,
      finalUrl: demoInput.url,
      targetAudience: demoInput.targetAudience,
      conversionGoal: demoInput.conversionGoal,
      businessType: demoInput.businessType,
      language: demoInput.language,
      market: demoInput.market,
      brandTone: demoInput.brandTone,
      personaCount: demoInput.personaCount,
      status: "RUNNING",
      mode: "DEMO"
    }
  });

  await prisma.pageSnapshot.create({
    data: {
      auditRunId: auditRun.id,
      title: launchPilotSnapshot.title,
      description: launchPilotSnapshot.description,
      visibleText: launchPilotSnapshot.visibleText,
      sections: launchPilotSnapshot.sections as Prisma.InputJsonValue,
      ctas: launchPilotSnapshot.ctas as Prisma.InputJsonValue,
      links: launchPilotSnapshot.links as Prisma.InputJsonValue,
      metadata: (launchPilotSnapshot.metadata || {}) as Prisma.InputJsonValue
    }
  });

  await prisma.screenshot.createMany({
    data: [
      {
        auditRunId: auditRun.id,
        viewport: "desktop",
        status: "FALLBACK",
        fallbackType: "DOM_SNAPSHOT",
        error: "Demo run uses DOM evidence in P0."
      }
    ]
  });

  await persistArtifacts(
    auditRun.id,
    buildFallbackAuditArtifacts({
      auditRunId: auditRun.id,
      input: demoInput,
      pageSnapshot: launchPilotSnapshot
    })
  );

  return prisma.auditRun.update({
    where: { id: auditRun.id },
    data: { status: "DEMO", conversionScore: 58 }
  });
}
