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
- Avoid generic landing-page advice unless directly tied to evidence.
- Be constructive and direct: help the team improve the page, not defend or attack it.
- Do not roast, insult, moralize, or make the product/team sound incompetent.
- Do not be overly friendly, apologetic, or reassuring when the evidence shows meaningful conversion risk.
- Call out severe blockers plainly when a buyer cannot understand, trust, or complete the conversion path.
- Treat missing evidence as uncertainty first; label it missing_information instead of pretending it is proof of failure.`;

const REVIEWER_CALIBRATION = `Reviewer calibration:
- Act like a senior conversion researcher reviewing a real team's work.
- Be fair before being critical: identify what is already helping conversion, then explain where a specific buyer may hesitate.
- Distinguish observed evidence from inferred hesitation and recommended fixes.
- Do not turn missing evidence into a harsh criticism. If something is absent from PageEvidence, mark it as missing_information or use cautious language.
- Avoid vague praise and vague criticism. Every useful point should connect to a buyer, a page moment, and a next action.`;

const SEVERITY_RUBRIC = `Severity rubric:
- critical: the user likely cannot complete the goal, the primary claim is materially misleading, or the flow creates a severe trust/payment/signup blocker.
- high: the main value proposition, CTA path, proof, pricing, or process clarity is likely blocking serious buyers.
- medium: a meaningful hesitation or ambiguity affects conversion but the path still works.
- low: polish, ordering, or copy clarity improvements that are useful but unlikely to block conversion alone.
Use critical and high sparingly. If evidence is weak, lower severity and lower confidence.`;

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

${REVIEWER_CALIBRATION}

Represent different conversion risks: busy founder, technical evaluator, price-sensitive buyer, trust-first buyer, and mobile-first visitor if count allows.
For each persona, define their skepticism, trust threshold, likely motivation, and what would make them fairly convert without assuming the page is bad.`;
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

${REVIEWER_CALIBRATION}

Each session must use the matching persona id, include 4-7 timeline events and cite PageEvidence in every friction point.
Timeline events should separate observed evidence from inferred hesitation. Include moments where the page is helping the persona as well as moments where it creates risk.`;
}

export function findingsPrompt(pageSnapshot: PageSnapshot, sessions: PersonaSession[]): string {
  return `Aggregate persona sessions into conversion findings.

PageEvidence:
${pageEvidencePrompt(pageSnapshot)}

Sessions:
${JSON.stringify(sessions, null, 2)}

${REVIEWER_CALIBRATION}

${SEVERITY_RUBRIC}

Return the top 3-5 findings. Deduplicate repeated issues.
Each finding should follow this reasoning pattern before you produce the structured object:
- Observation: what the page/session evidence shows.
- positive signal: what is already working or reducing friction.
- Friction risk: where a specific persona may hesitate or misunderstand.
- Evidence: exact PageEvidence refs or missing_information.
- Severity and confidence: choose severity with the rubric and set confidence based on evidence strength.
- Fix: a concrete, respectful next step.
Do not turn missing evidence into a harsh criticism; be specific about what should be added or clarified.`;
}

export function recommendationsPrompt(findings: Finding[]): string {
  return `Generate prioritized recommendations from these findings.

Findings:
${JSON.stringify(findings, null, 2)}

${REVIEWER_CALIBRATION}

Keep the tone practical, not scolding. Preserve what already works and recommend the smallest change that reduces the largest evidence-backed risk.
Return 3-5 concrete recommendations with implementation checklists. Each recommendation should state what to change, where to change it, why it matters, and how to verify it improved the conversion path.`;
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

${REVIEWER_CALIBRATION}

Return hero, CTA, FAQ and trust-section copy. Do not invent facts.
Do not overwrite a strong existing message just to sound clever. Keep useful claims, sharpen weak claims, add proof prompts where evidence is missing, and make the conversion goal feel easier to evaluate.`;
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

Write a balanced report:
- Open with What is already working before listing blockers.
- Explain risks without exaggeration or blame.
- Make the strongest issues easy to act on.
- Preserve uncertainty when evidence is incomplete.
- Do not bury critical blockers if the evidence supports them.

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
