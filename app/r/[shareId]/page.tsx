import { notFound } from "next/navigation";
import { PresenterReport } from "@/components/presenter/presenter-report";
import { ReportView } from "@/components/report/report-view";
import { getShareableReportState } from "@/lib/workflow/state";

export const dynamic = "force-dynamic";

export default async function ShareReportPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const audit = await getShareableReportState(shareId);
  if (!audit) notFound();

  return (
    <div className="lab-container py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="font-semibold">FrictionLab</p>
          <p className="mono text-xs muted">Generated synthetic UX research report</p>
        </div>
        <span className="rounded-full border border-[var(--lime)]/30 px-3 py-1 text-xs text-[var(--lime)]">Public report</span>
      </header>
      <div className="grid gap-8">
        <ReportView audit={audit} publicMode />
        <PresenterReport presenter={audit.presenterReport} />
      </div>
    </div>
  );
}
