import { hasModelCredential } from "@/lib/ai/model";
import { getEnv, type AppEnv } from "@/lib/env";

type CheckStatus = "ready" | "missing" | "disabled" | "optional";
type ReadinessStatus = "ready" | "degraded" | "blocked";

type RuntimeCheck = {
  status: CheckStatus;
  message: string;
};

export type RuntimeReadiness = {
  status: ReadinessStatus;
  canStartAudits: boolean;
  canRunRealAi: boolean;
  checks: {
    database: RuntimeCheck;
    aiProvider: RuntimeCheck;
    mockMode: RuntimeCheck;
    demoFallback: RuntimeCheck;
    browserless: RuntimeCheck;
    webappBrowser: RuntimeCheck;
    mailbox: RuntimeCheck;
    blob: RuntimeCheck;
    remotion: RuntimeCheck;
    appUrl: RuntimeCheck;
  };
};

export function getCurrentRuntimeReadiness(): RuntimeReadiness {
  return getRuntimeReadiness(getEnv(), {
    appUrlConfigured: Boolean(process.env.NEXT_PUBLIC_APP_URL)
  });
}

export function getRuntimeReadiness(
  env: AppEnv,
  optionalEnv: { browserlessToken?: string; blobReadWriteToken?: string; appUrlConfigured?: boolean } = {}
): RuntimeReadiness {
  const hasDatabase = Boolean(env.databaseUrl);
  const hasConfiguredAiModels = hasModelCredential(env.fastModel, env) && hasModelCredential(env.strongModel, env);
  const canRunRealAi = !env.mockMode && hasConfiguredAiModels;

  const database = hasDatabase
    ? ready("Postgres is configured for persisted audits.")
    : missing("DATABASE_URL is required before audits can be created.");

  const aiProvider = getAiProviderCheck(env.mockMode, hasConfiguredAiModels);
  const checks = {
    database,
    aiProvider,
    mockMode: env.mockMode ? ready("MOCK_MODE is enabled for deterministic demo runs.") : disabled("MOCK_MODE is disabled."),
    demoFallback: env.demoFallback
      ? ready("DEMO_FALLBACK is enabled for blocked or failing page fetches.")
      : disabled("DEMO_FALLBACK is disabled; fetch failures will fail the run."),
    browserless: optionalIntegration(
      optionalEnv.browserlessToken ?? env.browserlessToken,
      "Browserless screenshot capture is configured.",
      "Browserless screenshot capture is not configured; audits continue with DOM evidence."
    ),
    webappBrowser: optionalIntegration(
      env.browserlessWsUrl || env.browserlessToken,
      "Browserless webapp agent browser is configured.",
      "Browserless webapp agent browser is not configured; webapp audits will stop with partial evidence."
    ),
    mailbox:
      env.agentMailboxUser && env.agentMailboxAppPassword
        ? ready("Agent Gmail mailbox is configured for email confirmations.")
        : optional(undefined, "Agent Gmail mailbox is not configured; webapp audits cannot confirm signup emails automatically."),
    blob: optionalIntegration(
      optionalEnv.blobReadWriteToken ?? env.blobReadWriteToken,
      "Vercel Blob screenshot storage is configured.",
      "Vercel Blob screenshot storage is not configured; audits continue with DOM evidence."
    ),
    remotion: env.enableRemotionRender
      ? ready("Presenter video rendering is enabled.")
      : disabled("Presenter video rendering is disabled in P0."),
    appUrl:
      optionalEnv.appUrlConfigured ?? Boolean(env.appUrl)
        ? ready("NEXT_PUBLIC_APP_URL is configured.")
        : missing("NEXT_PUBLIC_APP_URL is using the local default.")
  };

  return {
    status: getOverallStatus({ hasDatabase, hasConfiguredAiModels, mockMode: env.mockMode }),
    canStartAudits: hasDatabase,
    canRunRealAi,
    checks
  };
}

function getAiProviderCheck(mockMode: boolean, hasConfiguredAiModels: boolean): RuntimeCheck {
  if (mockMode) return disabled("AI provider keys are not required while MOCK_MODE is enabled.");
  if (hasConfiguredAiModels) return ready("Configured fast and strong model credentials are available.");
  return missing("Configured AI model credentials are missing; audits will fall back to template artifacts.");
}

function getOverallStatus(input: { hasDatabase: boolean; hasConfiguredAiModels: boolean; mockMode: boolean }): ReadinessStatus {
  if (!input.hasDatabase) return "blocked";
  if (!input.mockMode && !input.hasConfiguredAiModels) return "degraded";
  return "ready";
}

function ready(message: string): RuntimeCheck {
  return { status: "ready", message };
}

function missing(message: string): RuntimeCheck {
  return { status: "missing", message };
}

function disabled(message: string): RuntimeCheck {
  return { status: "disabled", message };
}

function optional(value: string | undefined, message: string): RuntimeCheck {
  return value ? ready(message) : { status: "optional", message };
}

function optionalIntegration(value: string | undefined, readyMessage: string, missingMessage: string): RuntimeCheck {
  return value ? ready(readyMessage) : { status: "optional", message: missingMessage };
}
