import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
};

type CheckAuditRateLimitInput = {
  identifier: string;
  route?: string;
  now?: Date;
  limit?: number;
  windowSeconds?: number;
};

const defaultAuditRoute = "POST /api/audits";

export async function checkAuditRateLimitForRequest(request: Request): Promise<RateLimitResult> {
  const env = getEnv();
  if (env.rateLimitDisabled) {
    return {
      allowed: true,
      limit: env.auditRateLimitMax ?? 5,
      remaining: env.auditRateLimitMax ?? 5,
      resetAt: new Date(Date.now() + (env.auditRateLimitWindowSeconds ?? 600) * 1000)
    };
  }

  return checkAuditRateLimit({
    identifier: getClientIp(request),
    limit: env.auditRateLimitMax ?? 5,
    windowSeconds: env.auditRateLimitWindowSeconds ?? 600
  });
}

export async function checkAuditRateLimit(input: CheckAuditRateLimitInput): Promise<RateLimitResult> {
  const limit = input.limit ?? 5;
  const windowSeconds = input.windowSeconds ?? 600;
  const now = input.now ?? new Date();
  const route = input.route ?? defaultAuditRoute;
  const keyHash = hashRateLimitIdentifier(input.identifier);
  const windowStart = getWindowStart(now, windowSeconds);
  const resetAt = new Date(windowStart.getTime() + windowSeconds * 1000);

  const existing = await prisma.rateLimitBucket.findUnique({
    where: {
      keyHash_route: {
        keyHash,
        route
      }
    }
  });

  if (!existing) {
    await prisma.rateLimitBucket.create({
      data: { keyHash, route, windowStart, count: 1 }
    });
    return { allowed: true, limit, remaining: Math.max(limit - 1, 0), resetAt };
  }

  if (existing.windowStart.getTime() !== windowStart.getTime()) {
    await prisma.rateLimitBucket.update({
      where: {
        keyHash_route: {
          keyHash,
          route
        }
      },
      data: { windowStart, count: 1 }
    });
    return { allowed: true, limit, remaining: Math.max(limit - 1, 0), resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, limit, remaining: 0, resetAt };
  }

  const updated = await prisma.rateLimitBucket.update({
    where: {
      keyHash_route: {
        keyHash,
        route
      }
    },
    data: {
      count: {
        increment: 1
      }
    }
  });

  return { allowed: true, limit, remaining: Math.max(limit - updated.count, 0), resetAt };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function hashRateLimitIdentifier(identifier: string): string {
  return createHash("sha256").update(identifier).digest("hex");
}

export function getRetryAfterSeconds(resetAt: Date, now = new Date()): number {
  return Math.max(Math.ceil((resetAt.getTime() - now.getTime()) / 1000), 1);
}

function getWindowStart(now: Date, windowSeconds: number): Date {
  const windowMs = windowSeconds * 1000;
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs);
}
