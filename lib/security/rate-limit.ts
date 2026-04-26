import { createHash, randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
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

type RateLimitBucketRow = {
  allowed: boolean;
  count: number;
  windowStart: Date;
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

  const [bucket] = await prisma.$queryRaw<RateLimitBucketRow[]>(Prisma.sql`
    WITH upserted AS (
      INSERT INTO "RateLimitBucket" ("id", "keyHash", "route", "windowStart", "count", "updatedAt")
      VALUES (${randomUUID()}, ${keyHash}, ${route}, ${windowStart}, 1, ${now})
      ON CONFLICT ("keyHash", "route") DO UPDATE SET
        "windowStart" = CASE
          WHEN "RateLimitBucket"."windowStart" <> EXCLUDED."windowStart" THEN EXCLUDED."windowStart"
          ELSE "RateLimitBucket"."windowStart"
        END,
        "count" = CASE
          WHEN "RateLimitBucket"."windowStart" <> EXCLUDED."windowStart" THEN 1
          ELSE "RateLimitBucket"."count" + 1
        END,
        "updatedAt" = EXCLUDED."updatedAt"
      WHERE
        "RateLimitBucket"."windowStart" <> EXCLUDED."windowStart"
        OR "RateLimitBucket"."count" < ${limit}
      RETURNING true AS "allowed", "count", "windowStart"
    ),
    current_bucket AS (
      SELECT false AS "allowed", "count", "windowStart"
      FROM "RateLimitBucket"
      WHERE "keyHash" = ${keyHash} AND "route" = ${route}
      AND NOT EXISTS (SELECT 1 FROM upserted)
    )
    SELECT "allowed", "count", "windowStart" FROM upserted
    UNION ALL
    SELECT "allowed", "count", "windowStart" FROM current_bucket
    LIMIT 1
  `);

  if (!bucket) {
    throw new Error("Rate limit check failed to return a bucket.");
  }

  return { allowed: bucket.allowed, limit, remaining: Math.max(limit - bucket.count, 0), resetAt };
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
