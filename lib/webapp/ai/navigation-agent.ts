import { Output, generateText } from "ai";
import { z } from "zod";
import { getLanguageModel, hasProviderKey } from "@/lib/ai/model";
import { getEnv } from "@/lib/env";
import type { WebappAuditInput } from "@/lib/schemas/audit";
import type { WebappAgentAction, WebappStepEvidence } from "@/lib/webapp/types";

const WebappAgentActionSchema = z.object({
  actionType: z.enum(["click", "fill", "select", "press", "navigate", "wait_for_email", "stop", "blocked"]),
  target: z.string().optional(),
  value: z.string().optional(),
  reason: z.string().min(1)
});

type BrowserObservation = {
  url: string;
  title: string;
  text: string;
  controls: string[];
};

export async function generateNextWebappAction(input: {
  audit: WebappAuditInput;
  emailAlias?: string;
  observation: BrowserObservation;
  steps: WebappStepEvidence[];
}): Promise<WebappAgentAction> {
  const env = getEnv();
  const model = env.fastModel;

  if (env.mockMode || !hasProviderKey(model)) {
    return fallbackAction(input.observation, input.steps);
  }

  try {
    const result = await generateText({
      model: getLanguageModel(model),
      output: Output.object({ schema: WebappAgentActionSchema }),
      temperature: 0,
      system: [
        "You control a browser for a permitted UX audit.",
        "Return one safe action only.",
        "Do not bypass captcha, 2FA, payments, paywalls, or destructive actions.",
        "Prefer visible labels, button text, link text, placeholder text, input names, or URLs as targets.",
        "Use wait_for_email only after submitting a signup form that needs email confirmation.",
        "Use blocked when the next step would violate the guardrails."
      ].join("\n"),
      prompt: JSON.stringify({
        scenario: input.audit.scenarioPrompt,
        conversionGoal: input.audit.conversionGoal,
        signupAllowed: input.audit.signupAllowed,
        allowedDomains: input.audit.allowedDomains,
        emailAlias: input.emailAlias,
        observation: input.observation,
        recentSteps: input.steps.slice(-6)
      })
    });

    return result.output;
  } catch {
    return fallbackAction(input.observation, input.steps);
  }
}

function fallbackAction(observation: BrowserObservation, steps: WebappStepEvidence[]): WebappAgentAction {
  const lastAction = steps.at(-1)?.actionType;
  if (lastAction === "navigate") {
    return { actionType: "stop", reason: "AI unavailable after initial page observation." };
  }

  if (/sign up|signup|create account|get started/i.test(observation.text)) {
    return { actionType: "click", target: "Sign up", reason: "Start the signup flow from visible page text." };
  }

  return { actionType: "stop", reason: "No safe deterministic next action is available." };
}
