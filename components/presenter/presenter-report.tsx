type PresenterReportProps = {
  presenter:
    | {
        title: string;
        subtitle: string | null;
        durationSeconds: number;
        voiceoverScript: string;
        renderStatus: string;
        scenes: Array<{
          id: string;
          order: number;
          title: string;
          narration: string;
          visualType: string;
          durationSeconds: number;
          caption: string;
        }>;
      }
    | null;
};

export function PresenterReport({ presenter }: PresenterReportProps) {
  if (!presenter) {
    return <div className="panel rounded-[8px] p-5 text-sm muted">Presenter report is not ready.</div>;
  }

  return (
    <div className="grid gap-5">
      <div className="panel rounded-[8px] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mono text-xs uppercase muted">Presenter Report</p>
            <h1 className="mt-2 text-3xl font-semibold">{presenter.title}</h1>
            <p className="mt-2 muted">{presenter.subtitle}</p>
          </div>
          <span className="rounded-full border border-[var(--lime)]/30 px-3 py-1 text-xs text-[var(--lime)]">
            {presenter.renderStatus} · {presenter.durationSeconds}s
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {presenter.scenes.map((scene) => (
          <div className="panel-soft rounded-[8px] p-4" key={scene.id}>
            <div className="flex items-center justify-between">
              <span className="mono text-xs text-[var(--lime)]">Scene {scene.order}</span>
              <span className="mono text-xs muted">{scene.durationSeconds}s</span>
            </div>
            <h3 className="mt-3 font-semibold">{scene.title}</h3>
            <p className="mt-2 text-xs uppercase muted">{scene.visualType}</p>
            <p className="mt-3 text-sm leading-6 muted">{scene.narration}</p>
            <p className="mt-4 rounded-[6px] bg-black/30 p-3 text-xs">{scene.caption}</p>
          </div>
        ))}
      </div>

      <div className="panel rounded-[8px] p-5">
        <p className="mono text-xs uppercase muted">Voiceover script</p>
        <p className="mt-3 leading-7 muted">{presenter.voiceoverScript}</p>
      </div>
    </div>
  );
}
