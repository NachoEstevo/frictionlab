import { Output, generateText } from "ai";
import { z } from "zod";
import { getEnv } from "@/lib/env";
import { getLanguageModel, hasProviderKey } from "@/lib/ai/model";
import {
  AI_GUARDRAILS,
  copyPrompt,
  findingsPrompt,
  personasPrompt,
  presenterPrompt,
  recommendationsPrompt,
  reportPrompt,
  sessionsPrompt
} from "@/lib/ai/prompts";
import type { AuditInput } from "@/lib/schemas/audit";
import { CopyVariantSchema } from "@/lib/schemas/copy";
import { FindingSchema } from "@/lib/schemas/finding";
import type { PageSnapshot } from "@/lib/schemas/page";
import { SyntheticPersonaSchema } from "@/lib/schemas/persona";
import { PresenterReportSchema } from "@/lib/schemas/presenter";
import { RecommendationSchema } from "@/lib/schemas/recommendation";
import { ReportSchema } from "@/lib/schemas/report";
import { PersonaSessionSchema } from "@/lib/schemas/session";
import { buildFallbackAuditArtifacts, type FallbackAuditArtifacts } from "@/lib/workflow/fallbacks";

type GenerateAuditArtifactsInput = {
  auditRunId: string;
  input: AuditInput;
  pageSnapshot: PageSnapshot;
};

export async function generateAuditArtifacts({
  auditRunId,
  input,
  pageSnapshot
}: GenerateAuditArtifactsInput): Promise<FallbackAuditArtifacts & { usedFallback: boolean; fallbackReason?: string }> {
  const env = getEnv();
  const fastModel = env.fastModel;
  const strongModel = env.strongModel;

  if (env.mockMode || !hasProviderKey(fastModel) || !hasProviderKey(strongModel)) {
    return {
      ...buildFallbackAuditArtifacts({ auditRunId, input, pageSnapshot }),
      usedFallback: true,
      fallbackReason: env.mockMode ? "MOCK_MODE is enabled." : "Missing AI provider key."
    };
  }

  try {
    const personasResult = await generateStructuredObject({
      modelSpecifier: fastModel,
      schema: z.object({
        personas: z.array(SyntheticPersonaSchema).min(2).max(6)
      }),
      prompt: personasPrompt(input, pageSnapshot)
    });

    const personas = personasResult.personas.slice(0, input.personaCount);

    const sessionsResult = await generateStructuredObject({
      modelSpecifier: fastModel,
      schema: z.object({
        sessions: z.array(PersonaSessionSchema).min(2).max(6)
      }),
      prompt: sessionsPrompt(input, pageSnapshot, personas, auditRunId)
    });

    const findingsResult = await generateStructuredObject({
      modelSpecifier: strongModel,
      schema: z.object({
        findings: z.array(FindingSchema).min(1).max(6)
      }),
      prompt: findingsPrompt(pageSnapshot, sessionsResult.sessions)
    });

    const recommendationsResult = await generateStructuredObject({
      modelSpecifier: strongModel,
      schema: z.object({
        recommendations: z.array(RecommendationSchema).min(1).max(6)
      }),
      prompt: recommendationsPrompt(findingsResult.findings)
    });

    const copyResult = await generateStructuredObject({
      modelSpecifier: strongModel,
      schema: z.object({
        copyVariants: z.array(CopyVariantSchema).min(1).max(8)
      }),
      prompt: copyPrompt(input, pageSnapshot, findingsResult.findings)
    });

    const report = await generateStructuredObject({
      modelSpecifier: strongModel,
      schema: ReportSchema,
      prompt: reportPrompt(
        sessionsResult.sessions,
        findingsResult.findings,
        recommendationsResult.recommendations,
        copyResult.copyVariants
      )
    });

    const presenterReport = await generateStructuredObject({
      modelSpecifier: strongModel,
      schema: PresenterReportSchema,
      prompt: presenterPrompt(report, copyResult.copyVariants)
    });

    return {
      personas,
      sessions: sessionsResult.sessions,
      findings: findingsResult.findings,
      recommendations: recommendationsResult.recommendations,
      copyVariants: copyResult.copyVariants,
      report,
      presenterReport,
      usedFallback: false
    };
  } catch (error) {
    return {
      ...buildFallbackAuditArtifacts({ auditRunId, input, pageSnapshot }),
      usedFallback: true,
      fallbackReason: error instanceof Error ? error.message : "AI generation failed."
    };
  }
}

async function generateStructuredObject<T>({
  modelSpecifier,
  schema,
  prompt
}: {
  modelSpecifier: string;
  schema: z.ZodType<T>;
  prompt: string;
}): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const result = await generateText({
        model: getLanguageModel(modelSpecifier),
        system: AI_GUARDRAILS,
        prompt,
        output: Output.object({ schema }),
        temperature: 0.2
      });

      return result.output;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Structured generation failed.");
}
