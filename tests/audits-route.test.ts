import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/security/rate-limit", () => ({
  checkAuditRateLimitForRequest: vi.fn(),
  getRetryAfterSeconds: vi.fn(() => 600)
}));

vi.mock("@/lib/workflow/start-audit", () => ({
  startAudit: vi.fn()
}));

describe("POST /api/audits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 429 and does not start an audit when rate limited", async () => {
    const { checkAuditRateLimitForRequest } = await import("@/lib/security/rate-limit");
    const { startAudit } = await import("@/lib/workflow/start-audit");
    const { POST } = await import("@/app/api/audits/route");

    vi.mocked(checkAuditRateLimitForRequest).mockResolvedValue({
      allowed: false,
      limit: 5,
      remaining: 0,
      resetAt: new Date("2026-01-01T00:10:00.000Z")
    });

    const response = await POST(
      new Request("https://frictionlab.example/api/audits", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.10" },
        body: JSON.stringify({ url: "https://example.com" })
      })
    );

    await expect(response.json()).resolves.toMatchObject({
      error: "Too many audit requests. Try again later."
    });
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("600");
    expect(startAudit).not.toHaveBeenCalled();
  });
});
