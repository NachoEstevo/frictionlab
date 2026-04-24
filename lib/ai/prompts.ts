import type { AuditInput } from "@/lib/schemas/audit";
import type { PageSnapshot } from "@/lib/schemas/page";
import type { SyntheticPersona } from "@/lib/schemas/persona";
import type { PersonaSession } from "@/lib/schemas/session";
import type { Finding } from "@/lib/schemas/finding";
import type { Recommendation } from "@/lib/schemas/recommendation";
import type { CopyVariant } from "@/lib/schemas/copy";
import type { Report } from "@/lib/schemas/report";

export const AI_GUARDRAILS = `You are FrictionLab, an evidence-backed conversion research workflow.

Rules:
- Use only the provided PageEvidence.
- Every friction point must include evidence refs or be categorized as missing_information.
- Do not invent pricing, testimonials, integrations, guarantees, customer logos, metrics or product claims.
- Separate observed evidence from inferred risk and suggested fixes.
- Use cautious language such as likely, may, risk and could.
- Avoid generic landing-page advice unless directly tied to evidence.`;

export function pageEvidencePrompt(pageSnapshot: PageSnapshot): string {
  return JSON.stringify(
    {
      title: pageSnapshot.title,
      description: pageSnapshot.description,
      ctas: pageSnapshot.ctas,
      links: pageSnapshot.links.slice(0, 20),
      sections: pageSnapshot.sections.slice(0, 10).map((section) => ({
        id: section.id,
        order: section.order,
        type: section.type,
        heading: section.heading,
        text: section.text.slice(0, 1200),
        ctas: section.ctas
      }))
    },
    null,
    2
  );
}

export function personasPrompt(input: AuditInput, pageSnapshot: PageSnapshot): string {
  return `Generate ${input.personaCount} synthetic personas for a conversion audit.

Target audience: ${input.targetAudience}
Conversion goal: ${input.conversionGoal}
Business type: ${input.businessType}
Language: ${input.language}
Market: ${input.market || "not specified"}
Brand tone: ${input.brandTone || "not specified"}

PageEvidence:
${pageEvidencePrompt(pageSnapshot)}

Represent different conversion risks: busy founder, technical evaluator, price-sensitive buyer, trust-first buyer, and mobile-first visitor if count allows.`;
}

export function sessionsPrompt(
  input: AuditInput,
  pageSnapshot: PageSnapshot,
  personas: SyntheticPersona[],
  auditRunId: string
): string {
  return `Simulate one evidence-backed landing-page evaluation session per persona.

AuditRunId: ${auditRunId}
Conversion goal: ${input.conversionGoal}
Personas:
${JSON.stringify(personas, null, 2)}

PageEvidence:
${pageEvidencePrompt(pageSnapshot)}

Each session must use the matching persona id, include 4-7 timeline events and cite PageEvidence in every friction point.`;
}

export function findingsPrompt(pageSnapshot: PageSnapshot, sessions: PersonaSession[]): string {
  return `Aggregate persona sessions into conversion findings.

PageEvidence:
${pageEvidencePrompt(pageSnapshot)}

Sessions:
${JSON.stringify(sessions, null, 2)}

Return the top 3-5 findings. Deduplicate repeated issues.`;
}

export function recommendationsPrompt(findings: Finding[]): string {
  return `Generate prioritized recommendations from these findings.

Findings:
${JSON.stringify(findings, null, 2)}

Return 3-5 concrete recommendations with implementation checklists.`;
}

export function copyPrompt(input: AuditInput, pageSnapshot: PageSnapshot, findings: Finding[]): string {
  return `Generate copy variants from evidence-backed findings.

Target audience: ${input.targetAudience}
Conversion goal: ${input.conversionGoal}
Brand tone: ${input.brandTone || "clear and premium"}

PageEvidence:
${pageEvidencePrompt(pageSnapshot)}

Findings:
${JSON.stringify(findings, null, 2)}

Return hero, CTA, FAQ and trust-section copy. Do not invent facts.`;
}

export function reportPrompt(
  sessions: PersonaSession[],
  findings: Finding[],
  recommendations: Recommendation[],
  copyVariants: CopyVariant[]
): string {
  return `Create a client-ready conversion audit report from the structured research below.

Sessions:
${JSON.stringify(sessions, null, 2)}

Findings:
${JSON.stringify(findings, null, 2)}

Recommendations:
${JSON.stringify(recommendations, null, 2)}

Copy variants:
${JSON.stringify(copyVariants, null, 2)}

Keep it concise and action-oriented.`;
}

export function presenterPrompt(report: Report, copyVariants: CopyVariant[]): string {
  return `Create a 45-60 second Presenter Report storyboard from this audit report.

Report:
${JSON.stringify(report, null, 2)}

Copy variants:
${JSON.stringify(copyVariants, null, 2)}

Create 5-7 scenes with captions and narration. Video render is disabled, so the storyboard must stand alone.`;
}
