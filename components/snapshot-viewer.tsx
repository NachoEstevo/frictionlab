import type { PageSnapshot } from "@/lib/schemas/page";
import { asArray, asRecord } from "@/lib/ui/json";

type SnapshotViewerProps = {
  snapshot:
    | {
        title: string | null;
        description: string | null;
        visibleText: string;
        sections: unknown;
        ctas: unknown;
        links: unknown;
        metadata: unknown;
      }
    | null;
  screenshots?: Array<{
    viewport: string;
    status: string;
    url: string | null;
    width: number | null;
    height: number | null;
    fallbackType: string | null;
    error: string | null;
  }>;
};

export function SnapshotViewer({ snapshot, screenshots = [] }: SnapshotViewerProps) {
  if (!snapshot) {
    return (
      <div className="panel rounded-[8px] p-5">
        <p className="mono text-xs uppercase muted">Page evidence</p>
        <p className="mt-3 text-sm muted">No snapshot has been captured yet.</p>
      </div>
    );
  }

  const sections = asArray<PageSnapshot["sections"][number]>(snapshot.sections);
  const ctas = asArray<string>(snapshot.ctas);
  const metadata = asRecord(snapshot.metadata);
  const primaryScreenshot = screenshots.find((screenshot) => screenshot.url) ?? screenshots[0];

  return (
    <div className="panel rounded-[8px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mono text-xs uppercase muted">Page evidence</p>
          <h2 className="mt-2 text-xl font-semibold">{snapshot.title || "Untitled page"}</h2>
          <p className="mt-1 text-sm muted">{snapshot.description || "No meta description extracted."}</p>
        </div>
        {metadata.fallbackUsed ? (
          <span className="rounded-full border border-yellow-300/30 px-3 py-1 text-xs text-yellow-200">Fallback used</span>
        ) : null}
      </div>

      {primaryScreenshot ? (
        <div className="mt-5 overflow-hidden rounded-[8px] border border-white/10 bg-black/30">
          {primaryScreenshot.url ? (
            <img
              alt={`${primaryScreenshot.viewport} screenshot`}
              className="max-h-[360px] w-full object-cover object-top"
              height={primaryScreenshot.height ?? undefined}
              src={primaryScreenshot.url}
              width={primaryScreenshot.width ?? undefined}
            />
          ) : (
            <div className="p-4">
              <p className="mono text-xs uppercase text-yellow-200">{primaryScreenshot.status}</p>
              <p className="mt-2 text-sm muted">{primaryScreenshot.error || "Screenshot unavailable; DOM evidence is shown below."}</p>
            </div>
          )}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3">
        {sections.slice(0, 5).map((section) => (
          <div className="panel-soft rounded-[8px] p-3" key={section.id}>
            <div className="flex items-center justify-between gap-3">
              <span className="mono text-xs uppercase text-[var(--lime)]">{section.type}</span>
              <span className="mono text-xs muted">#{section.order}</span>
            </div>
            <p className="mt-2 text-sm font-medium">{section.heading || "Untitled section"}</p>
            <p className="mt-2 line-clamp-3 text-xs leading-5 muted">{section.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {ctas.length > 0 ? ctas.map((cta) => <span className="rounded-full bg-white/8 px-3 py-1 text-xs" key={cta}>{cta}</span>) : null}
      </div>
    </div>
  );
}
