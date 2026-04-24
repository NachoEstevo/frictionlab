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
    <a className="panel-soft block rounded-[8px] p-4 transition hover:border-[var(--lime)]/40" href={`#${persona.id}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{persona.name}</h3>
          <p className="text-sm muted">{persona.segment}</p>
        </div>
        {persona.device === "mobile" ? <Smartphone className="h-4 w-4 text-[var(--lime)]" /> : <Monitor className="h-4 w-4 text-[var(--lime)]" />}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <span className="rounded-[6px] bg-black/30 px-2 py-2">Trust: {persona.trustSensitivity}</span>
        <span className="rounded-[6px] bg-black/30 px-2 py-2">Price: {persona.priceSensitivity}</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="mono text-xs uppercase muted">{session?.finalVerdict || "pending"}</span>
        <span className="text-lg font-semibold">{session?.conversionLikelihood ?? 0}%</span>
      </div>
      <p className="mt-3 line-clamp-2 text-xs leading-5 muted">{objections[0] || "No objection recorded."}</p>
    </a>
  );
}
