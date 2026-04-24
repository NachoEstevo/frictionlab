import { NextResponse } from "next/server";
import { getAuditEvents } from "@/lib/workflow/state";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return NextResponse.json(await getAuditEvents(id));
}
