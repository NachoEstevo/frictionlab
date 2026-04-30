import { describe, expect, it } from "vitest";
import {
  buildAgentEmailAlias,
  extractEmailActions,
  generateAgentPassword,
  getBlockedActionReason,
  isAllowedNavigationUrl,
  redactMailboxEvent,
  redactSecrets
} from "@/lib/webapp/guards";

describe("webapp audit guardrails", () => {
  it("builds a plus-addressed Gmail alias for a run", () => {
    expect(buildAgentEmailAlias("agent.audit@gmail.com", "audit_123")).toBe("agent.audit+frictionlab-audit-123@gmail.com");
  });

  it("generates random agent passwords without audit-run identifiers", () => {
    const first = generateAgentPassword();
    const second = generateAgentPassword();

    expect(first).not.toBe(second);
    expect(first).not.toContain("audit_123");
    expect(first.length).toBeGreaterThanOrEqual(24);
  });

  it("extracts confirmation links and codes from email content", () => {
    const actions = extractEmailActions({
      html: '<a href="https://app.example.com/confirm?token=abc">Confirm account</a>',
      text: "Your verification code is 483921."
    });

    expect(actions.links).toEqual(["https://app.example.com/confirm?token=abc"]);
    expect(actions.codes).toContain("483921");
  });

  it("blocks navigation outside allowed domains", () => {
    expect(isAllowedNavigationUrl("https://app.example.com/welcome", ["app.example.com"])).toBe(true);
    expect(isAllowedNavigationUrl("https://evil.example/phish", ["app.example.com"])).toBe(false);
  });

  it("blocks destructive or payment-like actions before execution", () => {
    expect(getBlockedActionReason({ actionType: "click", target: "Delete workspace", reason: "Clean up" })).toMatch(/destructive/i);
    expect(getBlockedActionReason({ actionType: "click", target: "Add credit card", reason: "Continue" })).toMatch(/payment/i);
    expect(getBlockedActionReason({ actionType: "click", target: "Create project", reason: "Continue onboarding" })).toBeNull();
  });

  it("redacts passwords, tokens and cookies from persisted metadata", () => {
    expect(
      redactSecrets({
        password: "super-secret",
        nested: {
          token: "abc123",
          cookie: "sid=private",
          safe: "visible"
        }
      })
    ).toEqual({
      password: "[redacted]",
      nested: {
        token: "[redacted]",
        cookie: "[redacted]",
        safe: "visible"
      }
    });
  });

  it("redacts confirmation links and codes before mailbox persistence", () => {
    const redacted = redactMailboxEvent({
      emailAlias: "agent+frictionlab-audit-123@gmail.com",
      subject: "Confirm",
      fromAddress: "noreply@example.com",
      confirmationLink: "https://app.example.com/confirm?token=secret-token",
      confirmationCode: "483921",
      status: "USED"
    });

    expect(redacted.confirmationLink).toBe("https://app.example.com/[redacted-confirmation-link]");
    expect(redacted.confirmationCode).toBe("[redacted]");
    expect(JSON.stringify(redacted)).not.toContain("secret-token");
    expect(JSON.stringify(redacted)).not.toContain("483921");
  });
});
