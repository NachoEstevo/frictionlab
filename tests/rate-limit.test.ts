import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkAuditRateLimit, getClientIp, hashRateLimitIdentifier } from "@/lib/security/rate-limit";

vi.mock("@/lib/db", () => ({
  prisma: {
    rateLimitBucket: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    }
  }
}));

describe("audit rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hashes client identifiers instead of storing raw IPs", () => {
    expect(hashRateLimitIdentifier("203.0.113.10")).not.toContain("203.0.113.10");
    expect(hashRateLimitIdentifier("203.0.113.10")).toBe(hashRateLimitIdentifier("203.0.113.10"));
  });

  it("uses the first forwarded IP address", () => {
    const request = new Request("https://frictionlab.example/api/audits", {
      headers: {
        "x-forwarded-for": "203.0.113.10, 10.0.0.1"
      }
    });

    expect(getClientIp(request)).toBe("203.0.113.10");
  });

  it("allows and creates a fresh bucket when none exists", async () => {
    const { prisma } = await import("@/lib/db");
    vi.mocked(prisma.rateLimitBucket.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.rateLimitBucket.create).mockResolvedValue({ count: 1, windowStart: new Date() } as any);

    await expect(checkAuditRateLimit({ identifier: "203.0.113.10", now: new Date("2026-01-01T00:00:00.000Z") })).resolves.toMatchObject({
      allowed: true,
      limit: 5,
      remaining: 4
    });
  });

  it("blocks when the current window is exhausted", async () => {
    const { prisma } = await import("@/lib/db");
    vi.mocked(prisma.rateLimitBucket.findUnique).mockResolvedValue({
      count: 5,
      windowStart: new Date("2026-01-01T00:00:00.000Z")
    } as any);

    await expect(
      checkAuditRateLimit({ identifier: "203.0.113.10", now: new Date("2026-01-01T00:03:00.000Z") })
    ).resolves.toMatchObject({
      allowed: false,
      limit: 5,
      remaining: 0
    });
    expect(prisma.rateLimitBucket.update).not.toHaveBeenCalled();
  });
});
