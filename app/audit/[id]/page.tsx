import { notFound } from "next/navigation";
import { AuditDashboardPoller } from "@/components/audit-dashboard-poller";
import { FindingCard } from "@/components/finding-card";
import { PersonaCard } from "@/components/persona-card";
import { ScoreRing } from "@/components/score-ring";
import { SnapshotViewer } from "@/components/snapshot-viewer";
import { WebappEvidence } from "@/components/webapp-evidence";
import { WorkflowTimeline } from "@/components/workflow-timeline";
import { getAuditState } from "@/lib/workflow/state";

export const dynamic = "force-dynamic";

export default async function AuditDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getAuditState(id);
  if (!audit) notFound();

  return (
    <div className="lab-container py-8">
      <AuditDashboardPoller status={audit.status} />
      <Header id={audit.id} shareId={audit.shareableReport?.shareId} />
      <div className="grid gap-5">
        <WorkflowTimeline status={audit.status} toolCalls={audit.toolCalls} agentRuns={audit.agentRuns} />
        <WebappEvidence browserRun={audit.browserRun} />
        <div className="grid gap-5 xl:grid-cols-[390px_1fr_330px]">
          <SnapshotViewer snapshot={audit.pageSnapshot} screenshots={audit.screenshots} />
          <section className="panel rounded-[8px] p-5">
            <p className="mono text-xs uppercase muted">Synthetic swarm</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {audit.personas.map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  session={audit.sessions.find((session) => session.personaId === persona.id)}
                />
              ))}
            </div>
          </section>
          <ScoreRing score={audit.conversionScore} />
        </div>

        <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
          <div className="panel rounded-[8px] p-5">
            <p className="mono text-xs uppercase muted">Persona sessions</p>
            <div className="mt-4 grid gap-4">
              {audit.sessions.map((session) => (
                <article className="panel-soft rounded-[8px] p-4" id={session.personaId} key={session.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{session.persona.name}</h3>
                      <p className="text-sm muted">{session.finalVerdict} · {session.conversionLikelihood}% likelihood</p>
                    </div>
                    <span className="mono text-xs uppercase text-[var(--lime)]">{session.likelyBouncePoint}</span>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {session.events.map((event) => (
                      <div className="rounded-[6px] border border-white/8 bg-black/20 p-3" key={event.id}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="mono text-xs uppercase text-[var(--lime)]">{event.stage}</span>
                          <span className="mono text-xs muted">{event.decision}</span>
                        </div>
                        <p className="text-sm">{event.personaThought}</p>
                        {event.friction ? <p className="mt-2 text-xs text-yellow-100">{event.friction}</p> : null}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="panel rounded-[8px] p-5">
            <p className="mono text-xs uppercase muted">Findings</p>
            <div className="mt-4 grid gap-4">
              {audit.findings.map((finding) => (
                <FindingCard finding={finding} key={finding.id} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Header({ id, shareId }: { id: string; shareId?: string }) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <a className="mono text-xs uppercase muted" href="/">
          FrictionLab
        </a>
        <h1 className="mt-2 text-3xl font-semibold">Audit run</h1>
        <p className="mono mt-1 text-xs muted">{id}</p>
      </div>
      <nav className="flex flex-wrap gap-2">
        <a className="rounded-[6px] border border-white/10 px-3 py-2 text-sm" href={`/audit/${id}/report`}>
          View report
        </a>
        <a className="rounded-[6px] border border-white/10 px-3 py-2 text-sm" href={`/audit/${id}/presenter`}>
          Presenter
        </a>
        {shareId ? (
          <a className="rounded-[6px] bg-[var(--lime)] px-3 py-2 text-sm font-semibold text-black" href={`/r/${shareId}`}>
            Share
          </a>
        ) : null}
      </nav>
    </header>
  );
}
