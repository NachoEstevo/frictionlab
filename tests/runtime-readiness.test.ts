import { describe, expect, it } from "vitest";
import { getRuntimeReadiness } from "@/lib/runtime/readiness";

describe("runtime readiness", () => {
  it("blocks startup when DATABASE_URL is missing", () => {
    const readiness = getRuntimeReadiness({
      databaseUrl: undefined,
      openaiApiKey: "sk-test",
      anthropicApiKey: undefined,
      mockMode: false,
      demoFallback: true,
      enableRemotionRender: false,
      appUrl: "http://localhost:3000",
      fastModel: "openai:gpt-4.1-mini",
      strongModel: "anthropic:claude-sonnet-4-5"
    });

    expect(readiness.status).toBe("blocked");
    expect(readiness.canStartAudits).toBe(false);
    expect(readiness.checks.database.status).toBe("missing");
  });

  it("reports degraded live readiness when AI keys are missing but fallback can run", () => {
    const readiness = getRuntimeReadiness({
      databaseUrl: "postgresql://user:pass@localhost:5432/frictionlab",
      openaiApiKey: undefined,
      anthropicApiKey: undefined,
      mockMode: false,
      demoFallback: true,
      enableRemotionRender: false,
      appUrl: "http://localhost:3000",
      fastModel: "openai:gpt-4.1-mini",
      strongModel: "anthropic:claude-sonnet-4-5"
    });

    expect(readiness.status).toBe("degraded");
    expect(readiness.canStartAudits).toBe(true);
    expect(readiness.canRunRealAi).toBe(false);
    expect(readiness.checks.aiProvider.status).toBe("missing");
  });

  it("allows demo/mock mode without AI provider keys", () => {
    const readiness = getRuntimeReadiness({
      databaseUrl: "postgresql://user:pass@localhost:5432/frictionlab",
      openaiApiKey: undefined,
      anthropicApiKey: undefined,
      mockMode: true,
      demoFallback: true,
      enableRemotionRender: false,
      appUrl: "http://localhost:3000",
      fastModel: "openai:gpt-4.1-mini",
      strongModel: "anthropic:claude-sonnet-4-5"
    });

    expect(readiness.status).toBe("ready");
    expect(readiness.canStartAudits).toBe(true);
    expect(readiness.canRunRealAi).toBe(false);
    expect(readiness.checks.aiProvider.status).toBe("disabled");
  });

  it("can report when NEXT_PUBLIC_APP_URL is only using the local fallback", () => {
    const readiness = getRuntimeReadiness(
      {
        databaseUrl: "postgresql://user:pass@localhost:5432/frictionlab",
        openaiApiKey: "sk-test",
        anthropicApiKey: undefined,
        mockMode: false,
        demoFallback: true,
        enableRemotionRender: false,
        appUrl: "http://localhost:3000",
        fastModel: "openai:gpt-4.1-mini",
        strongModel: "anthropic:claude-sonnet-4-5"
      },
      { appUrlConfigured: false }
    );

    expect(readiness.checks.appUrl.status).toBe("missing");
  });
});
