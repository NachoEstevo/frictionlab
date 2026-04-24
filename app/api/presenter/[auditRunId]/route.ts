import { NextResponse } from "next/server";
import { getAuditState } from "@/lib/workflow/state";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ auditRunId: string }> }) {
  const { auditRunId } = await context.params;
  const audit = await getAuditState(auditRunId);

  if (!audit?.presenterReport) {
    return NextResponse.json({ error: "Presenter report is not available yet." }, { status: 404 });
  }

  return NextResponse.json(audit.presenterReport);
}
