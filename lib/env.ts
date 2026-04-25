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
  blobReadWriteToken?: string;
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
    blobReadWriteToken: process.env.BLOB_READ_WRITE_TOKEN,
    enableRemotionRender: parseBoolean(process.env.ENABLE_REMOTION_RENDER, false),
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  };
}

export function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}
