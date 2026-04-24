import { NextResponse } from "next/server";
import { startAudit } from "@/lib/workflow/start-audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await startAudit(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to start audit."
      },
      { status: 400 }
    );
  }
}
