import type { Prisma } from "@prisma/client";
import { generateAuditArtifacts } from "@/lib/ai/generate-audit-artifacts";
import { prisma } from "@/lib/db";
import type { WebappAuditInput } from "@/lib/schemas/audit";
import { createBrowserlessWebappRunner } from "@/lib/webapp/browser/browserless-runner";
import { redactSecrets } from "@/lib/webapp/guards";
import type { WebappBrowserRunner } from "@/lib/webapp/types";
import { persistArtifacts } from "@/lib/workflow/run-audit-workflow";

type RunWebappAuditWorkflowDeps = {
  browserRunner?: WebappBrowserRunner;
};

export async function runWebappAuditWorkflow(
  auditRunId: string,
  input: WebappAuditInput,
  deps: RunWebappAuditWorkflowDeps = {}
) {
  let browserRunId: string | undefined;

  try {
    await prisma.auditRun.update({
      where: { id: auditRunId },
      data: { status: "RUNNING", auditType: "WEBAPP", mode: "WEBAPP" }
    });

    const browserRun = await prisma.browserRun.create({
      data: {
        auditRunId,
        provider: "browserless",
        status: "RUNNING",
        startUrl: input.url,
        metadata: redactSecrets({
          allowedDomains: input.allowedDomains,
          maxSteps: input.maxSteps,
          mailboxMode: input.mailboxMode,
          signupAllowed: input.signupAllowed
        }) as Prisma.InputJsonValue
      }
    });
    browserRunId = browserRun.id;

    const runner = deps.browserRunner ?? createBrowserlessWebappRunner({ auditRunId, input });
    const browserResult = await runner();

    for (const step of browserResult.steps) {
      await prisma.browserStep.create({
        data: {
          browserRunId,
          order: step.order,
          actionType: step.actionType,
          target: step.target,
          url: step.url,
          title: step.title,
          observation: step.observation,
          screenshotUrl: step.screenshotUrl,
          status: step.status,
          error: step.error,
          metadata: redactSecrets(step.metadata || {}) as Prisma.InputJsonValue
        }
      });
    }

    for (const event of browserResult.mailboxEvents) {
      await prisma.mailboxEvent.create({
        data: {
          browserRunId,
          emailAlias: event.emailAlias,
          subject: event.subject,
          fromAddress: event.fromAddress,
          confirmationLink: event.confirmationLink,
          confirmationCode: event.confirmationCode,
          status: event.status,
          error: event.error
        }
      });
    }

    await prisma.pageSnapshot.upsert({
      where: { auditRunId },
      update: {
        title: browserResult.pageSnapshot.title,
        description: browserResult.pageSnapshot.description,
        visibleText: browserResult.pageSnapshot.visibleText,
        sections: browserResult.pageSnapshot.sections as Prisma.InputJsonValue,
        ctas: browserResult.pageSnapshot.ctas as Prisma.InputJsonValue,
        links: browserResult.pageSnapshot.links as Prisma.InputJsonValue,
        metadata: redactSecrets(browserResult.pageSnapshot.metadata || {}) as Prisma.InputJsonValue
      },
      create: {
        auditRunId,
        title: browserResult.pageSnapshot.title,
        description: browserResult.pageSnapshot.description,
        visibleText: browserResult.pageSnapshot.visibleText,
        sections: browserResult.pageSnapshot.sections as Prisma.InputJsonValue,
        ctas: browserResult.pageSnapshot.ctas as Prisma.InputJsonValue,
        links: browserResult.pageSnapshot.links as Prisma.InputJsonValue,
        metadata: redactSecrets(browserResult.pageSnapshot.metadata || {}) as Prisma.InputJsonValue
      }
    });

    await prisma.browserRun.update({
      where: { id: browserRunId },
      data: {
        status: browserResult.status,
        finalUrl: browserResult.finalUrl,
        remoteSessionId: browserResult.remoteSessionId,
        error: browserResult.error,
        metadata: redactSecrets(browserResult.metadata || {}) as Prisma.InputJsonValue,
        completedAt: new Date()
      }
    });

    const artifacts = await generateAuditArtifacts({
      auditRunId,
      input,
      pageSnapshot: browserResult.pageSnapshot
    });
    await persistArtifacts(auditRunId, artifacts);

    const status = browserResult.status === "COMPLETED" && !artifacts.usedFallback ? "COMPLETED" : "PARTIAL";
    await prisma.auditRun.update({
      where: { id: auditRunId },
      data: {
        status,
        finalUrl: browserResult.finalUrl,
        conversionScore: artifacts.report.conversionScore,
        error: browserResult.error || artifacts.fallbackReason || null
      }
    });

    return prisma.auditRun.findUniqueOrThrow({ where: { id: auditRunId } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webapp audit workflow failed.";
    if (browserRunId) {
      await prisma.browserRun.update({
        where: { id: browserRunId },
        data: { status: "FAILED", error: message, completedAt: new Date() }
      });
    }
    await prisma.auditRun.update({
      where: { id: auditRunId },
      data: { status: "FAILED", error: message }
    });
    throw error;
  }
}
