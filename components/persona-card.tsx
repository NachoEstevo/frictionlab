import { Monitor, Smartphone } from "lucide-react";
import { asStringArray } from "@/lib/ui/json";

type PersonaCardProps = {
  persona: {
    id: string;
    name: string;
    segment: string;
    device: string;
    trustSensitivity: string;
    priceSensitivity: string;
    objections: unknown;
  };
  session?: {
    finalVerdict: string | null;
    conversionLikelihood: number | null;
  };
};

export function PersonaCard({ persona, session }: PersonaCardProps) {
  const objections = asStringArray(persona.objections);

  return (
    <a className="panel-soft block min-w-0 rounded-[8px] p-4 transition hover:border-[var(--lime)]/40" href={`#${persona.id}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="content-safe font-semibold">{persona.name}</h3>
          <p className="content-safe text-sm muted">{persona.segment}</p>
        </div>
        {persona.device === "mobile" ? (
          <Smartphone className="h-4 w-4 shrink-0 text-[var(--lime)]" />
        ) : (
          <Monitor className="h-4 w-4 shrink-0 text-[var(--lime)]" />
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <span className="content-safe rounded-[6px] bg-black/30 px-2 py-2">Trust: {persona.trustSensitivity}</span>
        <span className="content-safe rounded-[6px] bg-black/30 px-2 py-2">Price: {persona.priceSensitivity}</span>
      </div>
      <div className="mt-4 flex min-w-0 items-center justify-between gap-3">
        <span className="content-safe mono min-w-0 text-xs uppercase muted">{session?.finalVerdict || "pending"}</span>
        <span className="shrink-0 text-lg font-semibold">{session?.conversionLikelihood ?? 0}%</span>
      </div>
      <p className="content-safe mt-3 line-clamp-2 text-xs leading-5 muted">{objections[0] || "No objection recorded."}</p>
    </a>
  );
}
