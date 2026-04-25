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
    blob: RuntimeCheck;
    remotion: RuntimeCheck;
    appUrl: RuntimeCheck;
  };
};

export function getCurrentRuntimeReadiness(): RuntimeReadiness {
  return getRuntimeReadiness(getEnv(), {
    browserlessToken: process.env.BROWSERLESS_TOKEN,
    blobReadWriteToken: process.env.BLOB_READ_WRITE_TOKEN,
    appUrlConfigured: Boolean(process.env.NEXT_PUBLIC_APP_URL)
  });
}

export function getRuntimeReadiness(
  env: AppEnv,
  optionalEnv: { browserlessToken?: string; blobReadWriteToken?: string; appUrlConfigured?: boolean } = {}
): RuntimeReadiness {
  const hasDatabase = Boolean(env.databaseUrl);
  const hasAiProvider = Boolean(env.openaiApiKey || env.anthropicApiKey);
  const canRunRealAi = !env.mockMode && hasAiProvider;

  const database = hasDatabase
    ? ready("Postgres is configured for persisted audits.")
    : missing("DATABASE_URL is required before audits can be created.");

  const aiProvider = getAiProviderCheck(env.mockMode, hasAiProvider);
  const checks = {
    database,
    aiProvider,
    mockMode: env.mockMode ? ready("MOCK_MODE is enabled for deterministic demo runs.") : disabled("MOCK_MODE is disabled."),
    demoFallback: env.demoFallback
      ? ready("DEMO_FALLBACK is enabled for blocked or failing page fetches.")
      : disabled("DEMO_FALLBACK is disabled; fetch failures will fail the run."),
    browserless: optional(optionalEnv.browserlessToken, "Browserless screenshots are optional P1."),
    blob: optional(optionalEnv.blobReadWriteToken, "Vercel Blob asset upload is optional P1."),
    remotion: env.enableRemotionRender
      ? ready("Presenter video rendering is enabled.")
      : disabled("Presenter video rendering is disabled in P0."),
    appUrl:
      optionalEnv.appUrlConfigured ?? Boolean(env.appUrl)
        ? ready("NEXT_PUBLIC_APP_URL is configured.")
        : missing("NEXT_PUBLIC_APP_URL is using the local default.")
  };

  return {
    status: getOverallStatus({ hasDatabase, hasAiProvider, mockMode: env.mockMode }),
    canStartAudits: hasDatabase,
    canRunRealAi,
    checks
  };
}

function getAiProviderCheck(mockMode: boolean, hasAiProvider: boolean): RuntimeCheck {
  if (mockMode) return disabled("AI provider keys are not required while MOCK_MODE is enabled.");
  if (hasAiProvider) return ready("At least one direct AI provider key is configured.");
  return missing("No OpenAI or Anthropic key is configured; audits will fall back to template artifacts.");
}

function getOverallStatus(input: { hasDatabase: boolean; hasAiProvider: boolean; mockMode: boolean }): ReadinessStatus {
  if (!input.hasDatabase) return "blocked";
  if (!input.mockMode && !input.hasAiProvider) return "degraded";
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
