import Image from "next/image";
import { AuditForm } from "@/components/audit-form";

export default function HomePage() {
  return (
    <div className="lab-container py-8 md:py-12">
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-[8px] border border-[var(--lime)]/30 bg-[var(--lime)]/10">
            <span className="text-lg font-black text-[var(--lime)]">F</span>
          </div>
          <div>
            <p className="font-semibold">FrictionLab</p>
            <p className="mono text-xs muted">AI conversion research</p>
          </div>
        </div>
        <a className="rounded-[6px] border border-white/10 px-3 py-2 text-sm muted" href="/audit/new">
          New audit
        </a>
      </header>

      <section className="grid gap-8 xl:grid-cols-[1fr_520px]">
        <div className="grid content-between gap-8">
          <div>
            <p className="mono text-xs uppercase text-[var(--lime)]">Synthetic user swarms. Real friction. Real impact.</p>
            <h1 className="mt-5 max-w-5xl text-5xl font-bold leading-[1.02] md:text-7xl">
              Send a synthetic user swarm through your landing page.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 muted">
              Paste a public URL, define the buyer and FrictionLab runs evidence-backed synthetic UX sessions before real users bounce.
            </p>
          </div>

          <div className="panel rounded-[8px] p-4">
            <Image
              alt="FrictionLab brand kit"
              className="h-auto w-full rounded-[6px] border border-white/10"
              height={1055}
              priority
              src="/frictionlab-brand-kit.png"
              width={1491}
            />
          </div>
        </div>

        <div>
          <AuditForm />
          <div className="mt-4 grid grid-cols-3 gap-3 text-xs muted">
            <div className="panel-soft rounded-[8px] p-3">Real DOM extraction</div>
            <div className="panel-soft rounded-[8px] p-3">Structured AI outputs</div>
            <div className="panel-soft rounded-[8px] p-3">Shareable report</div>
          </div>
        </div>
      </section>
    </div>
  );
}
