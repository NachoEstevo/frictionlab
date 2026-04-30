type WebappEvidenceProps = {
  browserRun:
    | {
        provider: string;
        status: string;
        startUrl: string;
        finalUrl: string | null;
        error: string | null;
        steps: Array<{
          id: string;
          order: number;
          actionType: string;
          target: string | null;
          url: string | null;
          title: string | null;
          observation: string;
          screenshotUrl: string | null;
          status: string;
          error: string | null;
        }>;
        mailboxEvents: Array<{
          id: string;
          emailAlias: string;
          subject: string | null;
          fromAddress: string | null;
          confirmationLink: string | null;
          confirmationCode: string | null;
          status: string;
          error: string | null;
        }>;
      }
    | null;
};

export function WebappEvidence({ browserRun }: WebappEvidenceProps) {
  if (!browserRun) return null;

  return (
    <section className="panel min-w-0 rounded-[8px] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mono text-xs uppercase muted">Webapp agent run</p>
          <h2 className="mt-2 text-xl font-semibold">{browserRun.provider} browser session</h2>
          <p className="content-safe mt-1 max-w-3xl text-sm muted">
            {browserRun.startUrl}
            {browserRun.finalUrl ? ` -> ${browserRun.finalUrl}` : ""}
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase">{browserRun.status}</span>
      </div>

      {browserRun.error ? (
        <p className="mt-4 rounded-[6px] border border-yellow-300/30 bg-yellow-500/10 p-3 text-sm text-yellow-100">
          {browserRun.error}
        </p>
      ) : null}

      <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="grid min-w-0 gap-3">
          {browserRun.steps.map((step) => (
            <article className="panel-soft min-w-0 rounded-[8px] p-4" key={step.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <span className="mono text-xs text-[var(--lime)]">#{step.order}</span>
                  <span className="mono text-xs uppercase">{step.actionType}</span>
                  {step.target ? <span className="content-safe text-xs muted">{step.target}</span> : null}
                </div>
                <span className="mono text-xs muted">{step.status}</span>
              </div>
              {step.title || step.url ? (
                <p className="content-safe mt-2 text-xs muted">
                  {step.title}
                  {step.url ? ` · ${step.url}` : ""}
                </p>
              ) : null}
              <p className="content-safe mt-3 text-sm leading-6">{step.observation}</p>
              {step.error ? <p className="content-safe mt-2 text-xs text-yellow-100">{step.error}</p> : null}
            </article>
          ))}
        </div>

        <aside className="panel-soft min-w-0 rounded-[8px] p-4">
          <p className="mono text-xs uppercase muted">Mailbox events</p>
          <div className="mt-4 grid min-w-0 gap-3">
            {browserRun.mailboxEvents.length > 0 ? (
              browserRun.mailboxEvents.map((event) => (
                <div className="min-w-0 rounded-[6px] border border-white/8 bg-black/20 p-3" key={event.id}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="mono text-xs uppercase text-[var(--lime)]">{event.status}</span>
                    <span className="content-safe mono min-w-0 text-[10px] muted">{event.emailAlias}</span>
                  </div>
                  <p className="content-safe mt-2 text-sm">{event.subject || "Email event"}</p>
                  <p className="content-safe mt-1 text-xs muted">{event.fromAddress}</p>
                  {event.confirmationLink ? <p className="mt-2 break-all text-xs muted">{event.confirmationLink}</p> : null}
                  {event.error ? <p className="mt-2 text-xs text-yellow-100">{event.error}</p> : null}
                </div>
              ))
            ) : (
              <p className="text-sm muted">No email confirmation was needed or captured yet.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
