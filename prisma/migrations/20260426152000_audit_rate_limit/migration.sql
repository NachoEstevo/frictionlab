CREATE TABLE "RateLimitBucket" (
    "id" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RateLimitBucket_keyHash_route_key" ON "RateLimitBucket"("keyHash", "route");
CREATE INDEX "RateLimitBucket_route_windowStart_idx" ON "RateLimitBucket"("route", "windowStart");
