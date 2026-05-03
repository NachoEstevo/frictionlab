import { nanoid } from "nanoid";
import type { Prisma } from "@prisma/client";
import { generateAuditArtifacts } from "@/lib/ai/generate-audit-artifacts";
import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { extractVisibleContent } from "@/lib/extraction/extract-visible-content";
import { fetchPageHtml } from "@/lib/extraction/fetch-page-html";
import type { AuditInput } from "@/lib/schemas/audit";
import type { PageSnapshot } from "@/lib/schemas/page";
import { shouldCaptureAuditScreenshots } from "@/lib/screenshots/audit-screenshot-policy";
import { captureAuditScreenshots } from "@/lib/screenshots/capture-audit-screenshots";
import { uploadScreenshotToBlob } from "@/lib/screenshots/upload-screenshot-to-blob";
import type { FallbackAuditArtifacts } from "@/lib/workflow/fallbacks";

export async function runAuditWorkflow(auditRunId: string, input: AuditInput) {
  const env = getEnv();

  try {
    await prisma.auditRun.update({
      where: { id: auditRunId },
      data: { status: "RUNNING" }
    });

    const pageSnapshot = await withToolCall(auditRunId, "extractPage", { url: input.url }, async () => {
      try {
        const fetched = await fetchPageHtml({ url: input.url });
        const snapshot = extractVisibleContent({ url: fetched.finalUrl, html: fetched.html });

        await prisma.auditRun.update({
          where: { id: auditRunId },
          data: { finalUrl: fetched.finalUrl }
        });

        return {
          ...snapshot,
          metadata: {
            ...(snapshot.metadata || {}),
            statusCode: fetched.statusCode,
            finalUrl: fetched.finalUrl,
            fallbackUsed: false
          }
        };
      } catch (error) {
        if (!env.demoFallback) throw error;
        return buildFetchFailureSnapshot(input.url, error);
      }
    });

    await prisma.pageSnapshot.upsert({
      where: { auditRunId },
      update: {
        title: pageSnapshot.title,
        description: pageSnapshot.description,
        visibleText: pageSnapshot.visibleText,
        sections: pageSnapshot.sections as Prisma.InputJsonValue,
        ctas: pageSnapshot.ctas as Prisma.InputJsonValue,
        links: pageSnapshot.links as Prisma.InputJsonValue,
        metadata: (pageSnapshot.metadata || {}) as Prisma.InputJsonValue
      },
      create: {
        auditRunId,
        title: pageSnapshot.title,
        description: pageSnapshot.description,
        visibleText: pageSnapshot.visibleText,
        sections: pageSnapshot.sections as Prisma.InputJsonValue,
        ctas: pageSnapshot.ctas as Prisma.InputJsonValue,
        links: pageSnapshot.links as Prisma.InputJsonValue,
        metadata: (pageSnapshot.metadata || {}) as Prisma.InputJsonValue
      }
    });

    await prisma.screenshot.deleteMany({ where: { auditRunId } });

    if (shouldCaptureAuditScreenshots(env)) {
      const screenshotUrl =
        typeof pageSnapshot.metadata?.finalUrl === "string" ? pageSnapshot.metadata.finalUrl : input.url;
      const screenshots = await withToolCall(auditRunId, "captureScreenshots", { url: screenshotUrl }, async () =>
        captureAuditScreenshots({
          auditRunId,
          url: screenshotUrl,
          browserlessToken: env.browserlessToken,
          uploadScreenshot: (uploadInput) =>
            uploadScreenshotToBlob({
              ...uploadInput,
              blobReadWriteToken: env.blobReadWriteToken
            })
        })
      );

      if (screenshots.length > 0) {
        await prisma.screenshot.createMany({
          data: screenshots.map((screenshot) => ({
            auditRunId,
            viewport: screenshot.viewport,
            status: screenshot.status,
            url: screenshot.url,
            blobPath: screenshot.blobPath,
            width: screenshot.width,
            height: screenshot.height,
            fallbackType: screenshot.fallbackType,
            error: screenshot.error
          }))
        });
      }
    }

    const artifacts = await withAgentRun(auditRunId, "audit_synthesis", { input, pageSnapshot }, async () =>
      generateAuditArtifacts({ auditRunId, input, pageSnapshot })
    );

    await persistArtifacts(auditRunId, artifacts);

    const status = artifacts.usedFallback || pageSnapshot.metadata?.fallbackUsed ? "PARTIAL" : "COMPLETED";
    await prisma.auditRun.update({
      where: { id: auditRunId },
      data: {
        status,
        conversionScore: artifacts.report.conversionScore,
        error: artifacts.usedFallback ? artifacts.fallbackReason : null
      }
    });

    return prisma.auditRun.findUniqueOrThrow({ where: { id: auditRunId } });
  } catch (error) {
    await prisma.auditRun.update({
      where: { id: auditRunId },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Audit workflow failed."
      }
    });
    throw error;
  }
}

export async function persistArtifacts(
  auditRunId: string,
  artifacts: FallbackAuditArtifacts & { usedFallback?: boolean; fallbackReason?: string }
) {
  const shareId = nanoid(10);
  const persistenceIds = buildPersistenceIdMap(auditRunId, artifacts);
  const report = mapReportForPersistence(artifacts.report, persistenceIds);

  await prisma.$transaction(async (tx) => {
    const existingPresenter = await tx.presenterReport.findUnique({ where: { auditRunId } });
    if (existingPresenter) {
      await tx.presenterScene.deleteMany({ where: { presenterReportId: existingPresenter.id } });
    }

    await tx.sessionEvent.deleteMany({
      where: { personaSession: { auditRunId } }
    });
    await tx.personaSession.deleteMany({ where: { auditRunId } });
    await tx.persona.deleteMany({ where: { auditRunId } });
    await tx.finding.deleteMany({ where: { auditRunId } });
    await tx.recommendation.deleteMany({ where: { auditRunId } });
    await tx.copyVariant.deleteMany({ where: { auditRunId } });
    await tx.report.deleteMany({ where: { auditRunId } });
    await tx.presenterReport.deleteMany({ where: { auditRunId } });
    await tx.shareableReport.deleteMany({ where: { auditRunId } });

    await tx.persona.createMany({
      data: artifacts.personas.map((persona) => ({
        id: persistenceIds.personas.get(persona.id) || namespaceArtifactId(auditRunId, persona.id),
        auditRunId,
        name: persona.name,
        segment: persona.segment,
        context: persona.context,
        goal: persona.goal,
        objections: persona.objections as Prisma.InputJsonValue,
        trustSensitivity: persona.trustSensitivity,
        priceSensitivity: persona.priceSensitivity,
        technicalLevel: persona.technicalLevel,
        patience: persona.patience,
        device: persona.device,
        likelyQuestions: persona.likelyQuestions as Prisma.InputJsonValue,
        conversionTriggers: persona.conversionTriggers as Prisma.InputJsonValue,
        abandonmentTriggers: persona.abandonmentTriggers as Prisma.InputJsonValue,
        decisionStyle: persona.decisionStyle
      }))
    });

    for (const session of artifacts.sessions) {
      await tx.personaSession.create({
        data: {
          id: namespaceArtifactId(auditRunId, session.id),
          auditRunId,
          personaId: persistenceIds.personas.get(session.personaId) || namespaceArtifactId(auditRunId, session.personaId),
          status: "COMPLETED",
          heroClarity: session.heroClarity,
          offerUnderstanding: session.offerUnderstanding,
          relevance: session.relevance,
          trust: session.trust,
          pricingClarity: session.pricingClarity,
          processClarity: session.processClarity,
          ctaReadiness: session.ctaReadiness,
          conversionLikelihood: session.conversionLikelihood,
          likelyBouncePoint: session.likelyBouncePoint,
          finalVerdict: session.finalVerdict,
          objections: session.objections as Prisma.InputJsonValue,
          missingInformation: session.missingInformation as Prisma.InputJsonValue,
          frictionPoints: session.frictionPoints as Prisma.InputJsonValue,
          quotes: session.quotes as Prisma.InputJsonValue,
          events: {
            create: session.timeline.map((event) => ({
              order: event.order,
              stage: event.stage,
              personaThought: event.personaThought,
              observedEvidence: event.observedEvidence as Prisma.InputJsonValue,
              friction: event.friction,
              emotion: event.emotion,
              decision: event.decision
            }))
          }
        }
      });
    }

    await tx.finding.createMany({
      data: artifacts.findings.map((finding) => ({
        id: persistenceIds.findings.get(finding.id) || namespaceArtifactId(auditRunId, finding.id),
        auditRunId,
        category: finding.category,
        problem: finding.problem,
        evidence: finding.evidence as Prisma.InputJsonValue,
        affectedPersonas: finding.affectedPersonas.map((personaId) =>
          persistenceIds.personas.get(personaId) || namespaceArtifactId(auditRunId, personaId)
        ) as Prisma.InputJsonValue,
        severity: finding.severity,
        impact: finding.impact,
        effort: finding.effort,
        confidence: finding.confidence,
        suggestedFix: finding.suggestedFix,
        suggestedCopy: finding.suggestedCopy
      }))
    });

    await tx.recommendation.createMany({
      data: artifacts.recommendations.map((recommendation) => ({
        id: persistenceIds.recommendations.get(recommendation.id) || namespaceArtifactId(auditRunId, recommendation.id),
        auditRunId,
        findingIds: recommendation.findingIds.map((findingId) =>
          persistenceIds.findings.get(findingId) || namespaceArtifactId(auditRunId, findingId)
        ) as Prisma.InputJsonValue,
        title: recommendation.title,
        whyItMatters: recommendation.whyItMatters,
        implementation: recommendation.implementation,
        impact: recommendation.impact,
        effort: recommendation.effort,
        priority: recommendation.priority,
        checklist: recommendation.checklist as Prisma.InputJsonValue
      }))
    });

    await tx.copyVariant.createMany({
      data: artifacts.copyVariants.map((copyVariant) => ({
        id: namespaceArtifactId(auditRunId, copyVariant.id),
        auditRunId,
        type: copyVariant.type,
        label: copyVariant.label,
        content: copyVariant.content as Prisma.InputJsonValue,
        rationale: copyVariant.rationale
      }))
    });

    await tx.report.create({
      data: {
        auditRunId,
        executiveSummary: report.executiveSummary,
        conversionScore: report.conversionScore,
        frictionMap: report.frictionMap as Prisma.InputJsonValue,
        personaOutcomes: report.personaOutcomes as Prisma.InputJsonValue,
        topBlockers: report.topBlockers as Prisma.InputJsonValue,
        trustGaps: report.trustGaps as Prisma.InputJsonValue,
        copyIssues: report.copyIssues as Prisma.InputJsonValue,
        uiIssues: report.uiIssues as Prisma.InputJsonValue,
        mobileIssues: report.mobileIssues as Prisma.InputJsonValue,
        recommendations: report.recommendations as Prisma.InputJsonValue,
        checklist: report.checklist as Prisma.InputJsonValue,
        fullJson: report as Prisma.InputJsonValue
      }
    });

    await tx.presenterReport.create({
      data: {
        auditRunId,
        title: artifacts.presenterReport.title,
        subtitle: artifacts.presenterReport.subtitle,
        durationSeconds: artifacts.presenterReport.durationSeconds,
        voiceoverScript: artifacts.presenterReport.voiceoverScript,
        executiveScript: artifacts.presenterReport.executiveScript,
        captions: artifacts.presenterReport.captions as Prisma.InputJsonValue,
        storyboardJson: artifacts.presenterReport as Prisma.InputJsonValue,
        renderStatus: artifacts.presenterReport.renderStatus,
        scenes: {
          create: artifacts.presenterReport.scenes.map((scene) => ({
            order: scene.order,
            title: scene.title,
            narration: scene.narration,
            visualType: scene.visualType,
            visualPayload: scene.visualPayload as Prisma.InputJsonValue,
            durationSeconds: scene.durationSeconds,
            caption: scene.caption
          }))
        }
      }
    });

    await tx.shareableReport.create({
      data: {
        auditRunId,
        shareId,
        isPublic: true
      }
    });

    await tx.auditRun.update({
      where: { id: auditRunId },
      data: { shareId }
    });
  }, { timeout: 20_000 });
}

type PersistenceIdMap = {
  personas: Map<string, string>;
  findings: Map<string, string>;
  recommendations: Map<string, string>;
};

function buildPersistenceIdMap(auditRunId: string, artifacts: FallbackAuditArtifacts): PersistenceIdMap {
  return {
    personas: new Map(artifacts.personas.map((persona) => [persona.id, namespaceArtifactId(auditRunId, persona.id)])),
    findings: new Map(artifacts.findings.map((finding) => [finding.id, namespaceArtifactId(auditRunId, finding.id)])),
    recommendations: new Map(
      artifacts.recommendations.map((recommendation) => [
        recommendation.id,
        namespaceArtifactId(auditRunId, recommendation.id)
      ])
    )
  };
}

function mapReportForPersistence(report: FallbackAuditArtifacts["report"], ids: PersistenceIdMap) {
  return {
    ...report,
    personaOutcomes: report.personaOutcomes.map((outcome) => ({
      ...outcome,
      personaId: ids.personas.get(outcome.personaId) || outcome.personaId
    })),
    topBlockers: report.topBlockers.map((finding) => ({
      ...finding,
      id: ids.findings.get(finding.id) || finding.id,
      affectedPersonas: finding.affectedPersonas.map((personaId) => ids.personas.get(personaId) || personaId)
    })),
    recommendations: report.recommendations.map((recommendation) => ({
      ...recommendation,
      id: ids.recommendations.get(recommendation.id) || recommendation.id,
      findingIds: recommendation.findingIds.map((findingId) => ids.findings.get(findingId) || findingId)
    }))
  };
}

function namespaceArtifactId(auditRunId: string, artifactId: string): string {
  return `${auditRunId}__${artifactId}`;
}

async function withToolCall<T>(auditRunId: string, toolName: string, input: unknown, action: () => Promise<T>): Promise<T> {
  const toolCall = await prisma.toolCall.create({
    data: { auditRunId, toolName, status: "RUNNING", input: input as object }
  });

  try {
    const output = await action();
    await prisma.toolCall.update({
      where: { id: toolCall.id },
      data: { status: "COMPLETED", output: output as object, completedAt: new Date() }
    });
    return output;
  } catch (error) {
    await prisma.toolCall.update({
      where: { id: toolCall.id },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Tool call failed.",
        completedAt: new Date()
      }
    });
    throw error;
  }
}

async function withAgentRun<T>(auditRunId: string, agentName: string, input: unknown, action: () => Promise<T>): Promise<T> {
  const agentRun = await prisma.agentRun.create({
    data: { auditRunId, agentName, status: "RUNNING", input: input as object }
  });

  try {
    const output = await action();
    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: { status: "COMPLETED", output: output as object, completedAt: new Date() }
    });
    return output;
  } catch (error) {
    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Agent run failed.",
        completedAt: new Date()
      }
    });
    throw error;
  }
}

function buildFetchFailureSnapshot(url: string, error: unknown): PageSnapshot {
  const hostname = new URL(url).hostname;
  const errorMessage = error instanceof Error ? error.message : "Fetch failed.";

  return {
    title: hostname,
    description: "Automated fetch failed; audit continued with missing-information evidence.",
    visibleText: `The page at ${url} could not be fetched automatically. Missing page evidence should be treated as missing_information.`,
    sections: [
      {
        id: "missing_information",
        order: 1,
        type: "unknown",
        heading: "Page evidence unavailable",
        text: `The page at ${url} blocked or failed automated fetch. Reason: ${errorMessage}`,
        ctas: []
      }
    ],
    ctas: [],
    links: [],
    metadata: {
      fallbackUsed: true,
      fallbackType: "FETCH_FAILED",
      error: errorMessage
    }
  };
}
