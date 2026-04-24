import { notFound } from "next/navigation";
import { PresenterReport } from "@/components/presenter/presenter-report";
import { getAuditState } from "@/lib/workflow/state";

export const dynamic = "force-dynamic";

export default async function AuditPresenterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getAuditState(id);
  if (!audit) notFound();

  return (
    <div className="lab-container py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <a className="mono text-xs uppercase muted" href={`/audit/${audit.id}`}>
          Back to audit
        </a>
        <a className="rounded-[6px] border border-white/10 px-3 py-2 text-sm" href={`/audit/${audit.id}/report`}>
          Report
        </a>
      </div>
      <PresenterReport presenter={audit.presenterReport} />
    </div>
  );
}
