import Link from "next/link";
import { ArrowRight, FileText, FlaskConical, Gauge, Share2 } from "lucide-react";
import { LabConsole } from "@/components/landing/lab-console";
import { LabStageGrid } from "@/components/landing/lab-stage-grid";
import { LandingMotion } from "@/components/landing/landing-motion";

const proofPoints = ["Synthetic user swarms", "Evidence-backed findings", "Presenter Report"];

const problemSignals = [
  {
    label: "Before launch",
    title: "The page looks polished, but nobody knows where buyers hesitate.",
    copy: "FrictionLab runs pre-flight conversion research before paid traffic turns guesswork into budget burn."
  },
  {
    label: "During the run",
    title: "Personas pressure-test the offer, trust proof, CTA path, and missing context.",
    copy: "Each synthetic buyer reads differently: founder, evaluator, operator, and skeptical buyer signals stay separate."
  },
  {
    label: "After the run",
    title: "The output is a report people can use in a product or hackathon room.",
    copy: "Findings become severity-ranked recommendations, rewrite ideas, implementation checklist, and a Presenter Report."
  }
];

const usefulOutputs = [
  { label: "Score", title: "Conversion readiness", copy: "A directional score with the main reasons it moved." },
  { label: "Map", title: "Friction evidence", copy: "Visible proof, weak claims, missing objections, and CTA timing." },
  { label: "Copy", title: "Rewrite candidates", copy: "Hero, CTA, FAQ, and trust copy variants tied to findings." },
  { label: "Room", title: "Presenter Report", copy: "A concise storyboard for explaining the audit in a demo or review." }
];

function BrandLogo({ size = "nav" }: { size?: "nav" | "hero" | "footer" }) {
  return (
    <span className={`brand-logo brand-logo-${size}`} aria-label="FrictionLab">
      <span className="brand-symbol" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="brand-logo-text">FrictionLab</span>
    </span>
  );
}

export default function HomePage() {
  return (
    <main className="landing-page w-full max-w-full overflow-x-hidden">
      <LandingMotion />

      <nav className="fixed left-1/2 top-4 z-50 w-[min(1180px,calc(100vw-24px))] -translate-x-1/2 rounded-full border border-white/10 bg-[#0a0a0a]/[0.72] px-3 py-3 shadow-2xl shadow-black/[0.30] backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-4">
          <Link className="brand-wordmark" href="/" aria-label="FrictionLab home">
            <BrandLogo />
          </Link>
          <div className="hidden items-center gap-7 text-sm text-white/[0.62] md:flex">
            <a href="#live-audit">Lab</a>
            <a href="#research">Method</a>
            <a href="#outputs">Outputs</a>
          </div>
          <Link
            className="nav-cta inline-flex items-center gap-2 rounded-full bg-[var(--lime)] px-4 py-2 text-sm font-semibold transition hover:bg-white active:scale-[0.98]"
            href="/audit/new"
          >
            New audit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      <section id="live-audit" className="hero-lab relative overflow-hidden px-4 pb-20 pt-28 md:px-8 md:pb-28 md:pt-36">
        <div className="hero-orbit" />
        <div className="mx-auto grid w-[min(1480px,100%)] items-start gap-8 xl:grid-cols-[minmax(360px,0.68fr)_minmax(720px,1.32fr)]">
          <div className="hero-copy relative z-10 pt-8 xl:sticky xl:top-28">
            <div className="mb-8">
              <BrandLogo size="hero" />
            </div>
            <p className="mono mb-6 text-xs uppercase tracking-[0.28em] text-[var(--lime)]">
              AI conversion research for pages that need proof
            </p>
            <h1 className="max-w-4xl text-[clamp(2.9rem,5.4vw,6.2rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-white">
              Find the friction before your buyers do.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/[0.68]">
              Paste a public landing page. FrictionLab extracts the offer, sends synthetic buyers through it,
              binds findings to evidence, and packages a shareable report.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {proofPoints.map((point) => (
                <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-medium text-white/[0.72]" key={point}>
                  {point}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                className="lime-glow inline-flex items-center justify-center gap-2 rounded-full bg-[var(--lime)] px-6 py-4 text-sm font-bold text-black transition hover:scale-[1.02] active:scale-[0.98]"
                href="#lab-form"
              >
                Run the lab
                <FlaskConical className="h-4 w-4" />
              </a>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.06] px-6 py-4 text-sm font-bold text-white transition hover:border-white/[0.38] hover:bg-white/[0.1] active:scale-[0.98]"
                href="/audit/new"
              >
                Open full audit page
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative z-10" id="lab-form">
            <LabConsole />
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 md:px-8 md:pb-24">
        <div className="mx-auto grid w-[min(1360px,100%)] gap-3 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="panel rounded-[8px] p-6 md:p-8" data-scale-fade>
            <p className="mono text-xs uppercase tracking-[0.24em] text-[var(--lime)]">Project idea</p>
            <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1] tracking-[-0.04em] text-white md:text-6xl">
              A research lab between landing-page taste and real conversion data.
            </h2>
          </div>
          <div className="problem-grid grid gap-3">
            {problemSignals.map((signal) => (
              <article className="panel-soft insight-row rounded-[8px] p-5" data-scale-fade key={signal.title}>
                <p className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--lime)]">{signal.label}</p>
                <h3>{signal.title}</h3>
                <p>{signal.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="research" className="px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-[min(1360px,100%)]">
          <div className="mb-12 grid gap-5 lg:grid-cols-[0.78fr_1fr] lg:items-end">
            <div>
              <p className="mono mb-5 text-xs uppercase tracking-[0.26em] text-[var(--lime)]">Research engine</p>
              <h2 className="text-[clamp(2.7rem,5.8vw,6rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-white">
                Extract. Simulate. Prove. Package.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-white/[0.66]">
              The animations are the product model: page layers are extracted, user paths are simulated, evidence is
              mapped, and the final report is composed for sharing.
            </p>
          </div>

          <LabStageGrid />
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] py-8">
        <div className="marquee-track mono text-sm uppercase tracking-[0.24em] text-white/[0.56]">
          <span>synthetic user swarms</span>
          <span>evidence-backed findings</span>
          <span>shareable report</span>
          <span>Presenter Report</span>
          <span>AI conversion research</span>
          <span>synthetic user swarms</span>
          <span>evidence-backed findings</span>
          <span>shareable report</span>
          <span>Presenter Report</span>
          <span>AI conversion research</span>
        </div>
      </section>

      <section id="outputs" className="px-4 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid w-[min(1360px,100%)] gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="mono mb-5 text-xs uppercase tracking-[0.26em] text-[var(--lime)]">What comes out</p>
            <h2 className="max-w-3xl text-[clamp(2.8rem,5.8vw,6rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-white">
              Useful artifacts, not another transcript.
            </h2>
          </div>
          <div className="deliverable-grid grid gap-3 sm:grid-cols-2">
            {usefulOutputs.map((output) => (
              <article className="panel-soft output-card rounded-[8px] p-5" data-scale-fade key={output.title}>
                <div className="mb-7 flex items-center justify-between">
                  <span className="mono text-xs text-[var(--lime)]">{output.label}</span>
                  {output.label === "Room" ? <Share2 className="h-4 w-4 text-[var(--lime)]" /> : output.label === "Score" ? <Gauge className="h-4 w-4 text-[var(--lime)]" /> : <FileText className="h-4 w-4 text-[var(--lime)]" />}
                </div>
                <h3 className="text-2xl font-semibold tracking-[-0.025em] text-white">{output.title}</h3>
                <p className="mt-4 text-sm leading-6 text-white/[0.62]">{output.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-4 pb-12 md:px-8">
        <div className="mx-auto flex w-[min(1360px,100%)] flex-col gap-5 border-t border-white/10 pt-8 text-sm text-white/[0.50] md:flex-row md:items-center md:justify-between">
          <BrandLogo size="footer" />
          <div className="flex gap-5">
            <a href="#live-audit">Lab</a>
            <a href="#research">Method</a>
            <a href="/audit/new">New audit</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
