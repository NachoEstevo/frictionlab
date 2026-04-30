import Link from "next/link";
import {
  ArrowRight,
  Code2,
  FileSearch,
  FileText,
  FlaskConical,
  Gauge,
  Layers3,
  ListChecks,
  MousePointerClick,
  Network,
  Share2,
  TriangleAlert
} from "lucide-react";
import { LabConsole } from "@/components/landing/lab-console";
import { LabStageGrid } from "@/components/landing/lab-stage-grid";
import { LandingMotion } from "@/components/landing/landing-motion";

const proofPoints = ["4 buyer personas", "Evidence-bound findings", "Shareable report"];

const problemSignals = [
  {
    label: "Offer clarity",
    title: "The page looks polished, but buyers still miss what changed for them.",
    copy: "FrictionLab extracts the visible offer, CTA path, proof, and missing context before the launch room debates taste."
  },
  {
    label: "Trust proof",
    title: "Claims need evidence close to the moment of doubt.",
    copy: "Synthetic buyers surface where evaluators ask for integrations, security, examples, pricing, or risk reversal."
  },
  {
    label: "CTA risk",
    title: "The next step can feel too expensive before the page earns commitment.",
    copy: "Every recommendation is ranked by severity and tied to the section, copy, or missing proof that caused the hesitation."
  }
];

const usefulOutputs = [
  {
    label: "Score",
    title: "Conversion readiness",
    copy: "62 / 100 with the reasons it moved: pricing context, proof gap, and CTA risk.",
    icon: Gauge,
    className: "output-card-large"
  },
  {
    label: "Map",
    title: "Friction evidence map",
    copy: "Evidence refs connect findings to hero copy, CTA labels, proof blocks, FAQ gaps, and page sections.",
    icon: Network,
    className: "output-card-large"
  },
  {
    label: "Copy",
    title: "Rewrite candidates",
    copy: "Hero, CTA, FAQ, and trust copy variants generated from specific findings instead of generic advice.",
    icon: FileText,
    className: ""
  },
  {
    label: "Persona",
    title: "Buyer objections",
    copy: "Founder, evaluator, operator, and skeptical buyer objections stay separate so teams know which doubt to resolve.",
    icon: MousePointerClick,
    className: ""
  },
  {
    label: "Fixes",
    title: "Implementation checklist",
    copy: "Prioritized fixes move from high-severity conversion blockers to medium proof gaps and polish work.",
    icon: ListChecks,
    className: ""
  },
  {
    label: "Room",
    title: "Presenter Report",
    copy: "A short storyboard for explaining what the lab found in demo rooms, reviews, and investor updates.",
    icon: Share2,
    className: "output-card-wide"
  }
];

const pipelineCards = [
  { title: "Page extraction", copy: "Fetch visible content, CTA path, proof inventory, objections, and screenshot evidence when available.", icon: FileSearch },
  { title: "Evidence model", copy: "Normalize findings around refs such as E-01 Hero claim, E-02 CTA label, and E-03 Missing pricing anchor.", icon: Layers3 },
  { title: "Persona simulation", copy: "Run founders, evaluators, operators, and skeptical buyers with different trust thresholds.", icon: FlaskConical },
  { title: "Findings ranking", copy: "Score severity by conversion risk, affected personas, and evidence strength.", icon: TriangleAlert },
  { title: "Report generation", copy: "Package the score, findings, copy variants, checklist, and Presenter Report into a shareable artifact.", icon: Code2 }
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
            <a href="#live-audit">Demo</a>
            <a href="#research">Method</a>
            <a href="#outputs">Outputs</a>
          </div>
          <Link
            className="nav-cta inline-flex items-center gap-2 rounded-full bg-[var(--lime)] px-4 py-2 text-sm font-semibold transition hover:bg-white active:scale-[0.98]"
            href="/audit/new"
          >
            Run audit
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
              Find the <span className="hero-friction-word">friction</span> before your buyers do.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/[0.68]">
              Paste a public landing page. FrictionLab sends synthetic buyers through the offer, ties every
              finding to evidence, and packages a report your team can act on.
            </p>
            <form action="/audit/new" className="run-audit-command mt-9" aria-label="Run an audit">
              <span className="mono">url</span>
              <input aria-label="Landing page URL" name="url" placeholder="https://yourlanding.com" type="url" />
              <button type="submit">
                Run audit
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-7 flex flex-wrap gap-2">
              {proofPoints.map((point) => (
                <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-medium text-white/[0.72]" key={point}>
                  {point}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                className="lime-glow inline-flex items-center justify-center gap-2 rounded-full bg-[var(--lime)] px-6 py-4 text-sm font-bold text-black transition hover:scale-[1.02] active:scale-[0.98]"
                href="/audit/new"
              >
                Run the lab
                <FlaskConical className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.06] px-6 py-4 text-sm font-bold text-white transition hover:border-white/[0.38] hover:bg-white/[0.1] active:scale-[0.98]"
                href="/audit/new"
              >
                Load demo report
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
            <p className="mono text-xs uppercase tracking-[0.24em] text-[var(--lime)]">Why it exists</p>
            <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1] tracking-[-0.04em] text-white md:text-6xl">
              Polished pages still hide conversion risk.
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
              The interface shows the pipeline: page evidence is extracted, buyer paths are simulated, recommendations
              are proven against source material, and the final report is packaged for sharing.
            </p>
          </div>

          <LabStageGrid />
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] py-8">
        <div className="marquee-track mono text-sm uppercase tracking-[0.24em] text-white/[0.56]">
          <span>4 buyer personas</span>
          <span>evidence-backed findings</span>
          <span>12 evidence refs</span>
          <span>Presenter Report</span>
          <span>AI conversion research</span>
          <span>4 buyer personas</span>
          <span>evidence-backed findings</span>
          <span>12 evidence refs</span>
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
          <div className="deliverable-grid grid gap-3">
            {usefulOutputs.map((output) => {
              const OutputIcon = output.icon;

              return (
                <article className={`panel-soft output-card rounded-[8px] p-5 ${output.className}`} data-scale-fade key={output.title}>
                  <div className="mb-7 flex items-center justify-between">
                    <span className="mono text-xs text-[var(--lime)]">{output.label}</span>
                    <OutputIcon className="h-4 w-4 text-[var(--lime)]" />
                  </div>
                  <h3 className="text-2xl font-semibold tracking-[-0.025em] text-white">{output.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-white/[0.62]">{output.copy}</p>
                  {output.label === "Score" ? (
                    <div className="score-module mt-6">
                      <strong>62</strong>
                      <span>/ 100</span>
                      <div>
                        <i style={{ width: "62%" }} />
                      </div>
                    </div>
                  ) : null}
                  {output.label === "Map" ? (
                    <div className="evidence-ref-row mt-6">
                      {["E-01", "E-02", "E-03", "E-04"].map((ref) => (
                        <span key={ref}>{ref}</span>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 md:px-8 md:pb-36">
        <div className="mx-auto grid w-[min(1360px,100%)] gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="panel evidence-preview rounded-[8px] p-6 md:p-8" data-scale-fade>
            <p className="mono text-xs uppercase tracking-[0.24em] text-[var(--lime)]">Evidence E-03</p>
            <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1] tracking-[-0.04em] text-white md:text-6xl">
              Every finding has a source, a severity, and a next move.
            </h2>
            <div className="mini-page-map mt-8" aria-hidden="true">
              <span className="is-hero">hero claim</span>
              <span>proof block</span>
              <span className="is-hot">missing pricing anchor</span>
              <span>first CTA</span>
            </div>
          </div>

          <article className="panel-soft finding-card rounded-[8px] p-6 md:p-8" data-scale-fade>
            <div className="flex flex-wrap items-center gap-2">
              <span className="severity-pill">High severity</span>
              <span className="evidence-pill">E-03</span>
              <span className="evidence-pill">Evaluator</span>
              <span className="evidence-pill">Skeptical buyer</span>
            </div>
            <h3 className="mt-8 text-3xl font-semibold leading-tight tracking-[-0.035em] text-white">
              Pricing context appears too late.
            </h3>
            <p className="mt-4 text-base leading-7 text-white/[0.66]">
              First CTA asks for commitment before any pricing expectation or risk-reversal appears. Evaluators
              understand the offer, but hesitate because effort and cost are not bounded.
            </p>
            <div className="finding-detail-grid mt-7">
              <div>
                <p className="mono">Recommendation</p>
                <span>Add a pricing expectation or risk-reversal line near the first CTA.</span>
              </div>
              <div>
                <p className="mono">Rewrite candidate</p>
                <span>Start free, see pricing before setup, and get a sample report in minutes.</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="px-4 pb-24 md:px-8 md:pb-36">
        <div className="mx-auto w-[min(1360px,100%)]">
          <div className="mb-10 grid gap-5 lg:grid-cols-[0.8fr_1fr] lg:items-end">
            <div>
              <p className="mono mb-5 text-xs uppercase tracking-[0.26em] text-[var(--lime)]">Research pipeline</p>
              <h2 className="max-w-4xl text-[clamp(2.4rem,5vw,5rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-white">
                Built as a synthetic research pipeline, not a prompt wrapper.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-white/[0.66]">
              FrictionLab turns public page evidence into structured simulations, ranked findings, and useful artifacts.
              The landing should make that architecture visible.
            </p>
          </div>
          <div className="pipeline-grid">
            {pipelineCards.map((card) => {
              const PipelineIcon = card.icon;

              return (
                <article className="panel-soft pipeline-card rounded-[8px] p-5" data-scale-fade key={card.title}>
                  <PipelineIcon className="h-5 w-5 text-[var(--lime)]" />
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 md:px-8 md:pb-28">
        <div className="final-cta mx-auto w-[min(1080px,100%)] rounded-[8px] p-6 text-center md:p-10">
          <p className="mono text-xs uppercase tracking-[0.24em] text-[var(--lime)]">Run before launch</p>
          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-[1] tracking-[-0.04em] text-white md:text-6xl">
            Run a lab before you launch.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/[0.64]">
            Paste a public landing page and leave with evidence, affected personas, rewrite candidates, and a report
            your team can act on.
          </p>
          <form action="/audit/new" className="run-audit-command mx-auto mt-8" aria-label="Run an audit from final CTA">
            <span className="mono">url</span>
            <input aria-label="Landing page URL" name="url" placeholder="https://yourlanding.com" type="url" />
            <button type="submit">
              Run audit
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      <footer className="px-4 pb-12 md:px-8">
        <div className="mx-auto flex w-[min(1360px,100%)] flex-col gap-5 border-t border-white/10 pt-8 text-sm text-white/[0.50] md:flex-row md:items-center md:justify-between">
          <BrandLogo size="footer" />
          <div className="flex gap-5">
            <a href="#live-audit">Demo</a>
            <a href="#research">Method</a>
            <a href="/audit/new">Run audit</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
