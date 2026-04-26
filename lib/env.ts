export type AppEnv = {
  databaseUrl?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  aiGatewayApiKey?: string;
  vercelOidcToken?: string;
  fastModel: string;
  strongModel: string;
  mockMode: boolean;
  demoFallback: boolean;
  browserlessToken?: string;
  browserlessWsUrl?: string;
  blobReadWriteToken?: string;
  webappBrowserProvider?: "browserless";
  webappMaxSteps?: number;
  agentMailboxHost?: string;
  agentMailboxPort?: number;
  agentMailboxSecure?: boolean;
  agentMailboxUser?: string;
  agentMailboxAppPassword?: string;
  auditRateLimitMax?: number;
  auditRateLimitWindowSeconds?: number;
  rateLimitDisabled?: boolean;
  enableRemotionRender: boolean;
  appUrl: string;
};

export function getEnv(): AppEnv {
  return {
    databaseUrl: process.env.DATABASE_URL,
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    aiGatewayApiKey: process.env.AI_GATEWAY_API_KEY,
    vercelOidcToken: process.env.VERCEL_OIDC_TOKEN,
    fastModel: process.env.FRICTIONLAB_FAST_MODEL || "openai:gpt-4.1-mini",
    strongModel: process.env.FRICTIONLAB_STRONG_MODEL || "anthropic:claude-sonnet-4-5",
    mockMode: parseBoolean(process.env.MOCK_MODE, false),
    demoFallback: parseBoolean(process.env.DEMO_FALLBACK, true),
    browserlessToken: process.env.BROWSERLESS_TOKEN,
    browserlessWsUrl: process.env.BROWSERLESS_WS_URL,
    blobReadWriteToken: process.env.BLOB_READ_WRITE_TOKEN,
    webappBrowserProvider: "browserless",
    webappMaxSteps: parseInteger(process.env.WEBAPP_MAX_STEPS, 20),
    agentMailboxHost: process.env.AGENT_MAILBOX_HOST || "imap.gmail.com",
    agentMailboxPort: parseInteger(process.env.AGENT_MAILBOX_PORT, 993),
    agentMailboxSecure: parseBoolean(process.env.AGENT_MAILBOX_SECURE, true),
    agentMailboxUser: process.env.AGENT_MAILBOX_USER,
    agentMailboxAppPassword: process.env.AGENT_MAILBOX_APP_PASSWORD,
    auditRateLimitMax: parseInteger(process.env.AUDIT_RATE_LIMIT_MAX, 5),
    auditRateLimitWindowSeconds: parseInteger(process.env.AUDIT_RATE_LIMIT_WINDOW_SECONDS, 600),
    rateLimitDisabled: parseBoolean(process.env.RATE_LIMIT_DISABLED, false),
    enableRemotionRender: parseBoolean(process.env.ENABLE_REMOTION_RENDER, false),
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  };
}

export function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function parseInteger(value: string | undefined, fallback: number): number {
  if (value === undefined || value === "") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}
