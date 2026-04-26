import { NextResponse } from "next/server";
import { checkAuditRateLimitForRequest, getRetryAfterSeconds } from "@/lib/security/rate-limit";
import { startAudit } from "@/lib/workflow/start-audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const rateLimit = await checkAuditRateLimitForRequest(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many audit requests. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(getRetryAfterSeconds(rateLimit.resetAt)),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": rateLimit.resetAt.toISOString()
          }
        }
      );
    }

    const body = await request.json();
    const result = await startAudit(body);
    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Limit": String(rateLimit.limit),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": rateLimit.resetAt.toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to start audit."
      },
      { status: 400 }
    );
  }
}
