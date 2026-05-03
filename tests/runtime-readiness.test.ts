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
      enableScreenshotCapture: false,
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
      enableScreenshotCapture: false,
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
      enableScreenshotCapture: false,
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
        enableScreenshotCapture: false,
        enableRemotionRender: false,
        appUrl: "http://localhost:3000",
        fastModel: "openai:gpt-4.1-mini",
        strongModel: "anthropic:claude-sonnet-4-5"
      },
      { appUrlConfigured: false }
    );

    expect(readiness.checks.appUrl.status).toBe("missing");
  });

  it("reports ready when configured models use AI Gateway credentials", () => {
    const readiness = getRuntimeReadiness({
      databaseUrl: "postgresql://user:pass@localhost:5432/frictionlab",
      openaiApiKey: undefined,
      anthropicApiKey: undefined,
      aiGatewayApiKey: "gateway-test",
      mockMode: false,
      demoFallback: true,
      enableScreenshotCapture: false,
      enableRemotionRender: false,
      appUrl: "http://localhost:3000",
      fastModel: "openai/gpt-5.4-mini",
      strongModel: "gateway:anthropic/claude-sonnet-4.6"
    });

    expect(readiness.status).toBe("ready");
    expect(readiness.canRunRealAi).toBe(true);
    expect(readiness.checks.aiProvider.status).toBe("ready");
  });

  it("reports landing screenshot integrations as disabled by default", () => {
    const readiness = getRuntimeReadiness({
      databaseUrl: "postgresql://user:pass@localhost:5432/frictionlab",
      openaiApiKey: "sk-test",
      anthropicApiKey: "sk-ant-test",
      mockMode: false,
      demoFallback: true,
      enableScreenshotCapture: false,
      enableRemotionRender: false,
      appUrl: "http://localhost:3000",
      fastModel: "openai:gpt-4.1-mini",
      strongModel: "anthropic:claude-sonnet-4-5"
    });

    expect(readiness.checks.browserless).toEqual({
      status: "disabled",
      message: "Landing screenshot capture is disabled; audits use DOM evidence."
    });
    expect(readiness.checks.blob).toEqual({
      status: "disabled",
      message: "Vercel Blob screenshot storage is disabled; audits use DOM evidence."
    });
  });

  it("reports screenshot integrations as optional when capture is explicitly enabled but tokens are missing", () => {
    const readiness = getRuntimeReadiness({
      databaseUrl: "postgresql://user:pass@localhost:5432/frictionlab",
      openaiApiKey: "sk-test",
      anthropicApiKey: "sk-ant-test",
      mockMode: false,
      demoFallback: true,
      enableScreenshotCapture: true,
      enableRemotionRender: false,
      appUrl: "http://localhost:3000",
      fastModel: "openai:gpt-4.1-mini",
      strongModel: "anthropic:claude-sonnet-4-5"
    });

    expect(readiness.checks.browserless).toEqual({
      status: "optional",
      message: "Browserless screenshot capture is not configured; audits continue with DOM evidence."
    });
    expect(readiness.checks.blob).toEqual({
      status: "optional",
      message: "Vercel Blob screenshot storage is not configured; audits continue with DOM evidence."
    });
  });
});
