import { beforeEach, describe, expect, it, vi } from "vitest";

const connectOverCDP = vi.fn();

vi.mock("playwright-core", () => ({
  chromium: {
    connectOverCDP
  }
}));

vi.mock("@/lib/env", () => ({
  getEnv: vi.fn(() => ({
    browserlessToken: "browserless-token",
    webappMaxSteps: 20
  }))
}));

describe("browserless webapp runner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks an initial WEBAPP URL outside allowedDomains before opening a browser", async () => {
    const { createBrowserlessWebappRunner } = await import("@/lib/webapp/browser/browserless-runner");
    const result = await createBrowserlessWebappRunner({
      auditRunId: "audit_123",
      input: {
        auditType: "WEBAPP",
        url: "https://evil.example/signup",
        targetAudience: "B2B SaaS operators evaluating workflow software",
        conversionGoal: "Create an account",
        businessType: "saas",
        language: "en",
        personaCount: 4,
        demoMode: false,
        scenarioPrompt: "Create an account and inspect onboarding.",
        signupAllowed: true,
        allowedDomains: ["app.example.com"],
        maxSteps: 8,
        mailboxMode: "GMAIL_IMAP"
      }
    })();

    expect(connectOverCDP).not.toHaveBeenCalled();
    expect(result.status).toBe("BLOCKED");
    expect(result.error).toMatch(/outside allowedDomains/i);
  });
});
