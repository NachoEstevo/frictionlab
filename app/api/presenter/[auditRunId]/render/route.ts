import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json({
    renderStatus: "DISABLED",
    message: "Video render is disabled in P0. Presenter storyboard and script are ready."
  });
}
