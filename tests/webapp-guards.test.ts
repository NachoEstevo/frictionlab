import { describe, expect, it } from "vitest";
import { buildAgentEmailAlias, extractEmailActions, isAllowedNavigationUrl, redactSecrets } from "@/lib/webapp/guards";

describe("webapp audit guardrails", () => {
  it("builds a plus-addressed Gmail alias for a run", () => {
    expect(buildAgentEmailAlias("agent.audit@gmail.com", "audit_123")).toBe("agent.audit+frictionlab-audit-123@gmail.com");
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
});
