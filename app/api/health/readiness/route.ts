import { NextResponse } from "next/server";
import { getCurrentRuntimeReadiness } from "@/lib/runtime/readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const readiness = getCurrentRuntimeReadiness();
  const status = readiness.status === "blocked" ? 503 : 200;

  return NextResponse.json(readiness, { status });
}
