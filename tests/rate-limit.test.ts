import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkAuditRateLimit, getClientIp, hashRateLimitIdentifier } from "@/lib/security/rate-limit";

vi.mock("@/lib/db", () => ({
  prisma: {
    $queryRaw: vi.fn()
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

  it("allows and creates a fresh bucket atomically when none exists", async () => {
    const { prisma } = await import("@/lib/db");
    vi.mocked(prisma.$queryRaw).mockResolvedValue([
      { allowed: true, count: 1, windowStart: new Date("2026-01-01T00:00:00.000Z") }
    ] as any);

    await expect(checkAuditRateLimit({ identifier: "203.0.113.10", now: new Date("2026-01-01T00:00:00.000Z") })).resolves.toMatchObject({
      allowed: true,
      limit: 5,
      remaining: 4
    });
    expect(prisma.$queryRaw).toHaveBeenCalledOnce();
  });

  it("blocks when the atomic upsert reports the current window is exhausted", async () => {
    const { prisma } = await import("@/lib/db");
    vi.mocked(prisma.$queryRaw).mockResolvedValue([
      { allowed: false, count: 5, windowStart: new Date("2026-01-01T00:00:00.000Z") }
    ] as any);

    await expect(
      checkAuditRateLimit({ identifier: "203.0.113.10", now: new Date("2026-01-01T00:03:00.000Z") })
    ).resolves.toMatchObject({
      allowed: false,
      limit: 5,
      remaining: 0
    });
    expect(prisma.$queryRaw).toHaveBeenCalledOnce();
  });

  it("uses a single database statement for the check and increment", async () => {
    const { prisma } = await import("@/lib/db");
    vi.mocked(prisma.$queryRaw).mockResolvedValue([
      { allowed: true, count: 3, windowStart: new Date("2026-01-01T00:00:00.000Z") }
    ] as any);

    await checkAuditRateLimit({ identifier: "203.0.113.10", now: new Date("2026-01-01T00:03:00.000Z") });

    const queryArg = vi.mocked(prisma.$queryRaw).mock.calls[0]?.[0] as { strings?: string[]; sql?: string };
    const query = queryArg.strings?.join("") ?? queryArg.sql ?? "";
    expect(prisma.$queryRaw).toHaveBeenCalledOnce();
    expect(query).toContain("ON CONFLICT");
    expect(query).toContain("DO UPDATE");
    expect(query).toContain("WHERE");
  });
});
