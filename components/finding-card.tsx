import { AlertTriangle } from "lucide-react";
import { asArray } from "@/lib/ui/json";
import type { EvidenceRef } from "@/lib/schemas/evidence";

type FindingCardProps = {
  finding: {
    id: string;
    category: string;
    problem: string;
    evidence: unknown;
    severity: string;
    impact: string;
    effort: string;
    confidence: number;
    suggestedFix: string;
  };
};

export function FindingCard({ finding }: FindingCardProps) {
  const evidence = asArray<EvidenceRef>(finding.evidence);

  return (
    <div className="panel-soft min-w-0 rounded-[8px] p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--lime)]" />
          <span className="content-safe mono text-xs uppercase text-[var(--lime)]">{finding.category}</span>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-xs">{finding.severity}</span>
      </div>
      <h3 className="content-safe font-semibold">{finding.problem}</h3>
      <p className="content-safe mt-3 text-sm muted">{finding.suggestedFix}</p>
      {evidence[0] ? (
        <blockquote className="content-safe mt-4 border-l border-[var(--lime)]/50 pl-3 text-xs leading-5 muted">
          “{evidence[0].quote}”
        </blockquote>
      ) : (
        <p className="mt-4 text-xs text-yellow-200">Marked as missing information.</p>
      )}
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <span className="content-safe rounded-[6px] bg-black/30 px-2 py-2">Impact {finding.impact}</span>
        <span className="content-safe rounded-[6px] bg-black/30 px-2 py-2">Effort {finding.effort}</span>
        <span className="rounded-[6px] bg-black/30 px-2 py-2">{Math.round(finding.confidence * 100)}% conf.</span>
      </div>
    </div>
  );
}
