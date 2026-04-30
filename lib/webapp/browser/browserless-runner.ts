import type { Page } from "playwright-core";
import { getEnv } from "@/lib/env";
import type { WebappAuditInput } from "@/lib/schemas/audit";
import { generateNextWebappAction } from "@/lib/webapp/ai/navigation-agent";
import { connectBrowserless, type BrowserlessConnection } from "@/lib/webapp/browser/browserless-provider";
import { buildSnapshot, getObservation, observeStep } from "@/lib/webapp/browser/page-evidence";
import {
  buildAgentEmailAlias,
  generateAgentPassword,
  getBlockedActionReason,
  isAllowedNavigationUrl,
  looksBlockedByHumanChallenge,
  redactMailboxEvent
} from "@/lib/webapp/guards";
import { pollGmailForConfirmation, type GmailImapConfig } from "@/lib/webapp/mailbox/gmail-imap";
import type { WebappMailboxEvent, WebappRunResult, WebappStepEvidence } from "@/lib/webapp/types";

type CreateBrowserlessRunnerInput = {
  auditRunId: string;
  input: WebappAuditInput;
};

export function createBrowserlessWebappRunner({ auditRunId, input }: CreateBrowserlessRunnerInput) {
  return async (): Promise<WebappRunResult> => {
    const env = getEnv();
    const maxSteps = Math.min(input.maxSteps, env.webappMaxSteps ?? 20);
    const steps: WebappStepEvidence[] = [];
    const mailboxEvents: WebappMailboxEvent[] = [];
    const emailAlias = env.agentMailboxUser ? buildAgentEmailAlias(env.agentMailboxUser, auditRunId) : undefined;
    const password = generateAgentPassword();

    if (!isAllowedNavigationUrl(input.url, input.allowedDomains)) {
      return blockedResult(input, steps, mailboxEvents, "Initial WEBAPP URL is outside allowedDomains.", "BLOCKED");
    }

    if (!env.browserlessToken && !env.browserlessWsUrl) {
      return blockedResult(input, steps, mailboxEvents, "BROWSERLESS_TOKEN or BROWSERLESS_WS_URL is required for webapp audits.");
    }

    let connection: BrowserlessConnection | undefined;
    try {
      connection = await connectBrowserless({
        token: env.browserlessToken,
        wsUrl: env.browserlessWsUrl,
        sessionTtlMs: env.browserlessSessionTtlMs
      });
      const browser = connection.browser;
      const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
      const observe = (
        order: number,
        actionType: WebappStepEvidence["actionType"],
        target?: string,
        status?: WebappStepEvidence["status"],
        note?: string
      ) => observeStep(page, order, actionType, target, status, note, { auditRunId, blobReadWriteToken: env.blobReadWriteToken });
      page.setDefaultTimeout(12_000);

      await page.goto(input.url, { waitUntil: "domcontentloaded", timeout: 45_000 });
      steps.push(await observe(steps.length + 1, "navigate", input.url));

      for (let index = steps.length + 1; index <= maxSteps; index += 1) {
        const observation = await getObservation(page);
        const blockReason = looksBlockedByHumanChallenge(observation.text);
        if (blockReason) {
          steps.push(await observe(index, "blocked", undefined, "BLOCKED", blockReason));
          return finishResult("BLOCKED", page, steps, mailboxEvents, connection, blockReason);
        }

        const action = await generateNextWebappAction({ audit: input, emailAlias, observation, steps });
        if (action.actionType === "stop") {
          steps.push(await observe(index, "stop", action.target, "COMPLETED", action.reason));
          return finishResult("COMPLETED", page, steps, mailboxEvents, connection);
        }
        if (action.actionType === "blocked") {
          steps.push(await observe(index, "blocked", action.target, "BLOCKED", action.reason));
          return finishResult("BLOCKED", page, steps, mailboxEvents, connection, action.reason);
        }

        const blockedActionReason = getBlockedActionReason(action);
        if (blockedActionReason) {
          steps.push(await observe(index, "blocked", action.target, "BLOCKED", blockedActionReason));
          return finishResult("BLOCKED", page, steps, mailboxEvents, connection, blockedActionReason);
        }

        if (action.actionType === "wait_for_email") {
          const event = await waitForEmailConfirmation({ input, emailAlias, env, page });
          mailboxEvents.push(event);
          if (event.status !== "FOUND" && event.status !== "USED") {
            steps.push(await observe(index, "wait_for_email", action.target, "BLOCKED", event.error || event.status));
            return finishResult("PARTIAL", page, steps, mailboxEvents, connection, event.error);
          }
          steps.push(await observe(index, "wait_for_email", action.target, "COMPLETED", "Confirmation email processed."));
          continue;
        }

        if (action.actionType === "navigate" && action.target && !isAllowedNavigationUrl(action.target, input.allowedDomains)) {
          const reason = "Navigation target is outside allowedDomains.";
          steps.push(await observe(index, "blocked", action.target, "BLOCKED", reason));
          return finishResult("BLOCKED", page, steps, mailboxEvents, connection, reason);
        }

        await executeAction(page, action.actionType, action.target, resolveActionValue(action.target, action.value, {
          emailAlias,
          password,
          profile: input.testUserProfile
        }));

        if (!isAllowedNavigationUrl(page.url(), input.allowedDomains)) {
          const reason = "Browser landed outside allowedDomains after the last action.";
          steps.push(await observe(index, "blocked", page.url(), "BLOCKED", reason));
          return finishResult("BLOCKED", page, steps, mailboxEvents, connection, reason);
        }

        steps.push(await observe(index, action.actionType, action.target, "COMPLETED", action.reason));
      }

      return finishResult("PARTIAL", page, steps, mailboxEvents, connection, "Maximum webapp steps reached.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Browser run failed.";
      return {
        status: "PARTIAL",
        steps: [
          ...steps,
          {
            order: steps.length + 1,
            actionType: "blocked",
            observation: message,
            status: "FAILED",
            error: message
          }
        ],
        mailboxEvents,
        pageSnapshot: buildSnapshot(input.url, steps, message),
        error: message
      };
    } finally {
      await connection?.close();
    }
  };
}

async function executeAction(page: Page, actionType: string, target?: string, value?: string) {
  if (actionType === "navigate") {
    if (!target) throw new Error("navigate action requires target.");
    await page.goto(target, { waitUntil: "domcontentloaded", timeout: 45_000 });
    return;
  }

  if (actionType === "click") {
    if (!target) throw new Error("click action requires target.");
    await findClickable(page, target).click();
    return;
  }

  if (actionType === "fill") {
    if (!target) throw new Error("fill action requires target.");
    await findField(page, target).fill(value || "");
    return;
  }

  if (actionType === "select") {
    if (!target) throw new Error("select action requires target.");
    await findField(page, target).selectOption(value || "");
    return;
  }

  if (actionType === "press") {
    await page.keyboard.press(value || target || "Enter");
  }
}

async function waitForEmailConfirmation(input: {
  input: WebappAuditInput;
  emailAlias?: string;
  env: ReturnType<typeof getEnv>;
  page: Page;
}): Promise<WebappMailboxEvent> {
  if (!input.emailAlias || !input.env.agentMailboxUser || !input.env.agentMailboxAppPassword) {
    return {
      emailAlias: input.emailAlias || "missing-mailbox",
      status: "FAILED",
      error: "AGENT_MAILBOX_USER and AGENT_MAILBOX_APP_PASSWORD are required for email confirmation."
    };
  }

  const event = await pollGmailForConfirmation({
    config: {
      host: input.env.agentMailboxHost || "imap.gmail.com",
      port: input.env.agentMailboxPort || 993,
      secure: input.env.agentMailboxSecure ?? true,
      user: input.env.agentMailboxUser,
      appPassword: input.env.agentMailboxAppPassword
    } satisfies GmailImapConfig,
    emailAlias: input.emailAlias,
    allowedDomains: input.input.allowedDomains
  });

  if (event.confirmationLink) {
    if (!isAllowedNavigationUrl(event.confirmationLink, input.input.allowedDomains)) {
      return redactMailboxEvent({ ...event, status: "BLOCKED", error: "Confirmation link was outside allowedDomains." });
    }
    await input.page.goto(event.confirmationLink, { waitUntil: "domcontentloaded", timeout: 45_000 });
    return redactMailboxEvent({ ...event, status: "USED" });
  }

  return redactMailboxEvent(event);
}

function resolveActionValue(
  target: string | undefined,
  value: string | undefined,
  identity: {
    emailAlias?: string;
    password: string;
    profile?: WebappAuditInput["testUserProfile"];
  }
) {
  if (value) return value.replaceAll("{{email}}", identity.emailAlias || "").replaceAll("{{password}}", identity.password);
  const normalized = (target || "").toLowerCase();
  if (normalized.includes("email")) return identity.emailAlias || "";
  if (normalized.includes("password")) return identity.password;
  if (normalized.includes("first")) return identity.profile?.firstName || "Maya";
  if (normalized.includes("last")) return identity.profile?.lastName || "Rivera";
  if (normalized.includes("company") || normalized.includes("organization")) return identity.profile?.company || "FrictionLab Test";
  if (normalized.includes("role") || normalized.includes("title")) return identity.profile?.role || "Growth lead";
  return "";
}

function findClickable(page: Page, target: string) {
  return page.getByRole("button", { name: target }).or(page.getByRole("link", { name: target })).or(page.getByText(target)).first();
}

function findField(page: Page, target: string) {
  return page.getByLabel(target).or(page.getByPlaceholder(target)).or(page.locator(`[name="${cssEscape(target)}"]`)).first();
}

async function finishResult(
  status: WebappRunResult["status"],
  page: Page,
  steps: WebappStepEvidence[],
  mailboxEvents: WebappMailboxEvent[],
  connection: BrowserlessConnection | undefined,
  error?: string
): Promise<WebappRunResult> {
  return {
    status,
    finalUrl: page.url(),
    remoteSessionId: connection?.remoteSessionId,
    steps,
    mailboxEvents,
    pageSnapshot: buildSnapshot(page.url(), steps, error),
    error,
    metadata: {
      browserConnectionMode: connection?.mode
    }
  };
}

function blockedResult(
  input: WebappAuditInput,
  steps: WebappStepEvidence[],
  mailboxEvents: WebappMailboxEvent[],
  error: string,
  status: WebappRunResult["status"] = "PARTIAL"
): WebappRunResult {
  return {
    status,
    steps: [
      ...steps,
      {
        order: steps.length + 1,
        actionType: "blocked",
        observation: error,
        status: "BLOCKED",
        error
      }
    ],
    mailboxEvents,
    pageSnapshot: buildSnapshot(input.url, steps, error),
    error
  };
}

function cssEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
