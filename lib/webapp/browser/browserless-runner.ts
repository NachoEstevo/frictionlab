import { chromium, type Browser, type Page } from "playwright-core";
import { getEnv } from "@/lib/env";
import type { WebappAuditInput } from "@/lib/schemas/audit";
import { generateNextWebappAction } from "@/lib/webapp/ai/navigation-agent";
import { buildSnapshot, getObservation, observeStep } from "@/lib/webapp/browser/page-evidence";
import { buildAgentEmailAlias, isAllowedNavigationUrl, looksBlockedByHumanChallenge } from "@/lib/webapp/guards";
import { pollGmailForConfirmation, type GmailImapConfig } from "@/lib/webapp/mailbox/gmail-imap";
import type { WebappMailboxEvent, WebappRunResult, WebappStepEvidence } from "@/lib/webapp/types";

type CreateBrowserlessRunnerInput = {
  auditRunId: string;
  input: WebappAuditInput;
};

const browserlessDefaultWsUrl = "wss://production-sfo.browserless.io";

export function createBrowserlessWebappRunner({ auditRunId, input }: CreateBrowserlessRunnerInput) {
  return async (): Promise<WebappRunResult> => {
    const env = getEnv();
    const maxSteps = Math.min(input.maxSteps, env.webappMaxSteps ?? 20);
    const steps: WebappStepEvidence[] = [];
    const mailboxEvents: WebappMailboxEvent[] = [];
    const emailAlias = env.agentMailboxUser ? buildAgentEmailAlias(env.agentMailboxUser, auditRunId) : undefined;
    const password = `Fr!${auditRunId.replace(/[^a-z0-9]/gi, "").slice(0, 18)}9`;

    if (!env.browserlessToken && !env.browserlessWsUrl) {
      return blockedResult(input, steps, mailboxEvents, "BROWSERLESS_TOKEN or BROWSERLESS_WS_URL is required for webapp audits.");
    }

    let browser: Browser | undefined;
    try {
      browser = await chromium.connectOverCDP(buildBrowserlessEndpoint(env.browserlessWsUrl, env.browserlessToken));
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
          return finishResult("BLOCKED", page, steps, mailboxEvents, blockReason);
        }

        const action = await generateNextWebappAction({ audit: input, emailAlias, observation, steps });
        if (action.actionType === "stop") {
          steps.push(await observe(index, "stop", action.target, "COMPLETED", action.reason));
          return finishResult("COMPLETED", page, steps, mailboxEvents);
        }
        if (action.actionType === "blocked") {
          steps.push(await observe(index, "blocked", action.target, "BLOCKED", action.reason));
          return finishResult("BLOCKED", page, steps, mailboxEvents, action.reason);
        }

        if (action.actionType === "wait_for_email") {
          const event = await waitForEmailConfirmation({ input, emailAlias, env, page });
          mailboxEvents.push(event);
          if (event.status !== "FOUND" && event.status !== "USED") {
            steps.push(await observe(index, "wait_for_email", action.target, "BLOCKED", event.error || event.status));
            return finishResult("PARTIAL", page, steps, mailboxEvents, event.error);
          }
          steps.push(await observe(index, "wait_for_email", action.target, "COMPLETED", "Confirmation email processed."));
          continue;
        }

        if (action.actionType === "navigate" && action.target && !isAllowedNavigationUrl(action.target, input.allowedDomains)) {
          const reason = "Navigation target is outside allowedDomains.";
          steps.push(await observe(index, "blocked", action.target, "BLOCKED", reason));
          return finishResult("BLOCKED", page, steps, mailboxEvents, reason);
        }

        await executeAction(page, action.actionType, action.target, resolveActionValue(action.target, action.value, {
          emailAlias,
          password,
          profile: input.testUserProfile
        }));

        if (!isAllowedNavigationUrl(page.url(), input.allowedDomains)) {
          const reason = "Browser landed outside allowedDomains after the last action.";
          steps.push(await observe(index, "blocked", page.url(), "BLOCKED", reason));
          return finishResult("BLOCKED", page, steps, mailboxEvents, reason);
        }

        steps.push(await observe(index, action.actionType, action.target, "COMPLETED", action.reason));
      }

      return finishResult("PARTIAL", page, steps, mailboxEvents, "Maximum webapp steps reached.");
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
      await browser?.close().catch(() => undefined);
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
      return { ...event, status: "BLOCKED", error: "Confirmation link was outside allowedDomains." };
    }
    await input.page.goto(event.confirmationLink, { waitUntil: "domcontentloaded", timeout: 45_000 });
    return { ...event, status: "USED" };
  }

  return event;
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

function buildBrowserlessEndpoint(wsUrl: string | undefined, token: string | undefined): string {
  if (wsUrl) return token && !wsUrl.includes("token=") ? appendToken(wsUrl, token) : wsUrl;
  return appendToken(browserlessDefaultWsUrl, token || "");
}

function appendToken(url: string, token: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

async function finishResult(
  status: WebappRunResult["status"],
  page: Page,
  steps: WebappStepEvidence[],
  mailboxEvents: WebappMailboxEvent[],
  error?: string
): Promise<WebappRunResult> {
  return {
    status,
    finalUrl: page.url(),
    steps,
    mailboxEvents,
    pageSnapshot: buildSnapshot(page.url(), steps, error),
    error
  };
}

function blockedResult(
  input: WebappAuditInput,
  steps: WebappStepEvidence[],
  mailboxEvents: WebappMailboxEvent[],
  error: string
): WebappRunResult {
  return {
    status: "PARTIAL",
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
