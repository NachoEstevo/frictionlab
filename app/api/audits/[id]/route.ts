import { NextResponse } from "next/server";
import { getAuditState } from "@/lib/workflow/state";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const audit = await getAuditState(id);

  if (!audit) {
    return NextResponse.json({ error: "Audit not found." }, { status: 404 });
  }

  return NextResponse.json(audit);
}
