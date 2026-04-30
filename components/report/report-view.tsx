import { FindingCard } from "@/components/finding-card";
import { ScoreRing } from "@/components/score-ring";
import { getPrimaryScreenshotEvidence, type ScreenshotEvidenceRecord } from "@/lib/screenshots/report-evidence";
import { asArray, asRecord, asStringArray } from "@/lib/ui/json";

type ReportViewProps = {
  audit: {
    id: string;
    shareableReport: { shareId: string } | null;
    screenshots?: ScreenshotEvidenceRecord[];
    report: {
      executiveSummary: string;
      conversionScore: number;
      frictionMap: unknown;
      personaOutcomes: unknown;
      topBlockers: unknown;
      recommendations: unknown;
      checklist: unknown;
    } | null;
    findings: Array<{
      id: string;
      category: string;
      problem: string;
      evidence: unknown;
      severity: string;
      impact: string;
      effort: string;
      confidence: number;
      suggestedFix: string;
    }>;
    recommendations: Array<{
      id: string;
      title: string;
      whyItMatters: string;
      implementation: string;
      priority: number;
    }>;
    copyVariants: Array<{
      id: string;
      type: string;
      label: string;
      content: unknown;
      rationale: string | null;
    }>;
  };
  publicMode?: boolean;
};

export function ReportView({ audit, publicMode = false }: ReportViewProps) {
  const report = audit.report;
  const checklist = asStringArray(report?.checklist);
  const screenshotEvidence = getPrimaryScreenshotEvidence(audit.screenshots ?? []);

  if (!report) {
    return <div className="panel rounded-[8px] p-5 text-sm muted">Report is not ready.</div>;
  }

  return (
    <div className="grid min-w-0 gap-5">
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
        <ScoreRing score={report.conversionScore} />
        <div className="panel min-w-0 rounded-[8px] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mono text-xs uppercase muted">Client-ready report</p>
              <h1 className="mt-2 text-3xl font-semibold">Synthetic swarm audit</h1>
            </div>
            {!publicMode && audit.shareableReport ? (
              <a
                className="rounded-[6px] border border-[var(--lime)]/40 px-3 py-2 text-sm text-[var(--lime)]"
                href={`/r/${audit.shareableReport.shareId}`}
              >
                Share report
              </a>
            ) : null}
          </div>
          <p className="content-safe mt-5 max-w-4xl text-lg leading-8 muted">{report.executiveSummary}</p>
        </div>
      </div>

      {screenshotEvidence ? (
        <section className="panel min-w-0 rounded-[8px] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="mono text-xs uppercase muted">Visual evidence</p>
              <h2 className="mt-2 text-xl font-semibold">Captured page state</h2>
            </div>
            <span className="mono rounded-full border border-white/10 px-3 py-1 text-xs uppercase muted">
              {screenshotEvidence.viewport} · {screenshotEvidence.status}
            </span>
          </div>
          {screenshotEvidence.kind === "image" && screenshotEvidence.url ? (
            <div className="mt-4 overflow-hidden rounded-[8px] border border-white/10 bg-black/30">
              <img
                alt={`${screenshotEvidence.viewport} screenshot evidence`}
                className="max-h-[460px] w-full object-cover object-top"
                height={screenshotEvidence.height ?? undefined}
                src={screenshotEvidence.url}
                width={screenshotEvidence.width ?? undefined}
              />
            </div>
          ) : (
            <p className="mt-4 rounded-[6px] border border-yellow-300/20 bg-yellow-300/5 p-3 text-sm text-yellow-100">
              <span className="content-safe block">{screenshotEvidence.message}</span>
            </p>
          )}
        </section>
      ) : null}

      <section className="panel min-w-0 rounded-[8px] p-5">
        <p className="mono text-xs uppercase muted">Top blockers</p>
        <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-2">
          {audit.findings.map((finding) => (
            <FindingCard finding={finding} key={finding.id} />
          ))}
        </div>
      </section>

      <section className="panel min-w-0 rounded-[8px] p-5">
        <p className="mono text-xs uppercase muted">Recommendations</p>
        <div className="mt-4 grid min-w-0 gap-3">
          {audit.recommendations.map((recommendation) => (
            <div className="panel-soft min-w-0 rounded-[8px] p-4" key={recommendation.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="content-safe font-semibold">{recommendation.title}</h3>
                <span className="rounded-full bg-[var(--lime)] px-2 py-1 text-xs font-semibold text-black">
                  P{recommendation.priority}
                </span>
              </div>
              <p className="content-safe mt-2 text-sm muted">{recommendation.whyItMatters}</p>
              <p className="content-safe mt-3 text-sm">{recommendation.implementation}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-2">
        <div className="panel min-w-0 rounded-[8px] p-5">
          <p className="mono text-xs uppercase muted">Copy Lab</p>
          <div className="mt-4 grid min-w-0 gap-3">
            {audit.copyVariants.map((copyVariant) => {
              const content = asRecord(copyVariant.content);
              return (
                <div className="panel-soft min-w-0 rounded-[8px] p-4" key={copyVariant.id}>
                  <div className="flex items-center justify-between">
                    <h3 className="content-safe font-semibold">{copyVariant.label}</h3>
                    <span className="mono text-xs uppercase text-[var(--lime)]">{copyVariant.type}</span>
                  </div>
                  <pre className="content-safe mt-3 whitespace-pre-wrap text-xs leading-5 muted">
                    {JSON.stringify(content, null, 2)}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel min-w-0 rounded-[8px] p-5">
          <p className="mono text-xs uppercase muted">Implementation checklist</p>
          <div className="mt-4 grid min-w-0 gap-2">
            {checklist.map((item) => (
              <div className="flex min-w-0 items-center gap-3 rounded-[6px] bg-white/5 px-3 py-2 text-sm" key={item}>
                <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--lime)]" />
                <span className="content-safe">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
