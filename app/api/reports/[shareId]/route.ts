import { NextResponse } from "next/server";
import { getShareableReportState } from "@/lib/workflow/state";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await context.params;
  const report = await getShareableReportState(shareId);

  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  return NextResponse.json(report);
}
