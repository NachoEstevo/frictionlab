import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Film, FlaskConical, Network, Radar, Share2, Sparkles } from "lucide-react";
import { AuditForm } from "@/components/audit-form";
import { LandingMotion } from "@/components/landing/landing-motion";

const capabilities = [
  {
    title: "Synthetic user swarms",
    copy: "Run buyer personas through the page like a coordinated research panel, not a single generic critique.",
    image: "/landing/recreated-swarm.png",
    className: "md:col-span-4"
  },
  {
    title: "Session-grade evidence",
    copy: "Every finding ties back to observed page content, friction moments, and conversion risk.",
    image: "/landing/recreated-sessions.png",
    className: "md:col-span-2"
  },
  {
    title: "Evidence map",
    copy: "Cluster issues by severity, persona, funnel moment, and what needs to change next.",
    image: "/landing/recreated-evidence-map.png",
    className: "md:col-span-2"
  },
  {
    title: "Shareable report",
    copy: "Send stakeholders a focused report with findings, proof, and recommendations.",
    image: "/landing/recreated-presenter.png",
    className: "md:col-span-2"
  },
  {
    title: "Presenter Report",
    copy: "Turn research into a judge-ready storyboard: narrative beats, evidence, and a clean talk track.",
    image: "/landing/original-presenter.png",
    className: "md:col-span-2"
  },
  {
    title: "Conversion decisions",
    copy: "Move from taste debates to evidence-backed product changes before traffic gets wasted.",
    image: "/landing/recreated-evidence-map.png",
    className: "md:col-span-3"
  },
  {
    title: "No chatbot surface",
    copy: "FrictionLab is a research engine that outputs structured artifacts your team can ship against.",
    image: "/landing/recreated-sessions.png",
    className: "md:col-span-3"
  }
];

const accordionItems = [
  {
    title: "Extract",
    copy: "Pull visible page content and context from the live URL.",
    image: "/landing/original-sessions.png",
    icon: Radar
  },
  {
    title: "Simulate",
    copy: "Send distinct synthetic buyers through the conversion path.",
    image: "/landing/original-swarm.png",
    icon: Network
  },
  {
    title: "Prove",
    copy: "Bind every claim to evidence and severity.",
    image: "/landing/original-evidence-map.png",
    icon: FlaskConical
  },
  {
    title: "Present",
    copy: "Package the result into reports built for sharing and demoing.",
    image: "/landing/original-presenter.png",
    icon: Film
  }
];

const revealWords =
  "FrictionLab turns a public landing page into a research field test: synthetic users explore the offer, surface conversion friction, cite the evidence, and leave your team with a report that is precise enough to act on.".split(
    " "
  );

export default function HomePage() {
  return (
    <main className="landing-page w-full max-w-full overflow-x-hidden">
      <LandingMotion />

      <nav className="fixed left-1/2 top-4 z-50 w-[min(1120px,calc(100vw-24px))] -translate-x-1/2 rounded-full border border-white/10 bg-black/[0.55] px-3 py-3 shadow-2xl shadow-black/[0.30] backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-3" href="/" aria-label="FrictionLab home">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--lime)] text-sm font-black text-black">F</span>
            <span className="hidden text-sm font-semibold tracking-wide text-white sm:inline">FrictionLab</span>
          </Link>
          <div className="hidden items-center gap-7 text-sm text-white/[0.62] md:flex">
            <a href="#research">Research engine</a>
            <a href="#evidence">Evidence</a>
            <a href="#live-audit">Run audit</a>
          </div>
          <Link
            className="nav-cta inline-flex items-center gap-2 rounded-full bg-[var(--lime)] px-4 py-2 text-sm font-semibold transition hover:bg-white"
            href="/audit/new"
          >
            New audit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      <section className="relative min-h-screen overflow-hidden px-4 pb-24 pt-32 md:px-8 md:pb-32 md:pt-44">
        <div className="hero-orbit" />
        <div className="mx-auto grid w-[min(1480px,100%)] items-center gap-12 xl:grid-cols-[minmax(0,1fr)_560px]">
          <div className="relative z-10">
            <p className="mono mb-7 text-xs uppercase tracking-[0.28em] text-[var(--lime)]">
              AI conversion research for teams that need proof
            </p>
            <h1 className="max-w-6xl text-[clamp(3.1rem,5.8vw,6.4rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-white">
              AI conversion research at swarm scale.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/[0.68] md:text-xl">
              FrictionLab sends synthetic user swarms through your landing page and returns evidence-backed findings,
              a shareable report, and a Presenter Report for the room.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                className="lime-glow inline-flex items-center justify-center gap-2 rounded-full bg-[var(--lime)] px-6 py-4 text-sm font-bold text-black transition hover:scale-[1.02]"
                href="/audit/new"
              >
                Start a research run
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.07] px-6 py-4 text-sm font-bold text-white transition hover:border-white/[0.38] hover:bg-white/[0.12]"
                href="#live-audit"
              >
                Use the live form
                <Sparkles className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="hero-visual relative z-10" data-hero-visual>
            <div className="hero-panel hero-panel-main group">
              <Image
                priority
                alt="Synthetic user swarm research interface"
                className="h-full w-full object-cover opacity-95 transition duration-700 ease-out group-hover:scale-105"
                height={784}
                src="/landing/original-swarm.png"
                width={502}
              />
            </div>
            <div className="hero-panel hero-panel-secondary group">
              <Image
                priority
                alt="Synthetic user session replay interface"
                className="h-full w-full object-cover opacity-90 transition duration-700 ease-out group-hover:scale-105"
                height={784}
                src="/landing/original-sessions.png"
                width={502}
              />
            </div>
            <div className="hero-panel hero-panel-tertiary group">
              <Image
                alt="Presenter report storyboard interface"
                className="h-full w-full object-cover opacity-90 transition duration-700 ease-out group-hover:scale-105"
                height={784}
                src="/landing/original-presenter.png"
                width={501}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="research" className="px-4 py-32 md:px-8 md:py-48">
        <div className="mx-auto w-[min(1360px,100%)]">
          <div className="mb-16 max-w-5xl">
            <h2 className="text-[clamp(2.7rem,6vw,6.6rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-white">
              A research engine with{" "}
              <span
                className="inline-block h-12 w-28 rounded-full bg-cover bg-center align-middle md:h-16 md:w-40"
                style={{ backgroundImage: "url('/landing/recreated-evidence-map.png')" }}
              />{" "}
              proof in the loop.
            </h2>
          </div>

          <div className="grid-flow-dense grid auto-rows-[minmax(260px,auto)] gap-3 md:grid-cols-6">
            {capabilities.map((card) => (
              <article
                className={`group panel landing-card overflow-hidden rounded-[8px] p-4 ${card.className}`}
                data-scale-fade
                key={card.title}
              >
                <div className="relative min-h-[260px] overflow-hidden rounded-[6px] border border-white/10">
                  <Image
                    alt={`${card.title} visual`}
                    className="h-full min-h-[260px] w-full object-cover opacity-[0.86] transition-transform duration-700 ease-out group-hover:scale-105"
                    height={1122}
                    src={card.image}
                    width={1586}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/[0.18] to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-2xl font-semibold tracking-[-0.02em] text-white">{card.title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/[0.68]">{card.copy}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="evidence" className="px-4 py-32 md:px-8 md:py-48">
        <div className="mx-auto grid w-[min(1360px,100%)] gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-32 lg:h-fit">
            <p className="mono mb-5 text-xs uppercase tracking-[0.26em] text-[var(--lime)]">Evidence-backed findings</p>
            <p className="max-w-xl text-4xl font-semibold leading-tight tracking-[-0.035em] text-white md:text-6xl" data-reveal-copy>
              {revealWords.map((word, index) => (
                <span className="mr-[0.28em] inline-block" data-reveal-word key={`${word}-${index}`}>
                  {word}
                </span>
              ))}
            </p>
          </div>

          <div className="horizontal-accordion grid gap-4">
            {accordionItems.map((item) => {
              const Icon = item.icon;
              return (
                <article className="accordion-panel group min-h-[320px] overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.035]" key={item.title} data-stack-card>
                  <Image
                    alt={`${item.title} workflow visual`}
                    className="absolute inset-0 h-full w-full object-cover opacity-[0.45] transition duration-700 group-hover:scale-105 group-hover:opacity-[0.72]"
                    height={784}
                    src={item.image}
                    width={502}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/[0.72] to-black/[0.12]" />
                  <div className="relative z-10 flex h-full min-h-[320px] flex-col justify-end p-6 md:p-7">
                    <Icon className="mb-6 h-7 w-7 text-[var(--lime)]" />
                    <h3 className="text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">{item.title}</h3>
                    <p className="mt-4 max-w-md text-base leading-7 text-white/[0.70]">{item.copy}</p>
                  </div>
                </article>
              );
            })}
          </div>
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

      <section id="live-audit" className="px-4 py-32 md:px-8 md:py-48">
        <div className="mx-auto grid w-[min(1360px,100%)] items-start gap-10 xl:grid-cols-[0.78fr_1fr]">
          <div>
            <p className="mono mb-5 text-xs uppercase tracking-[0.26em] text-[var(--lime)]">Launch the lab</p>
            <h2 className="max-w-4xl text-[clamp(3rem,6.5vw,7rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-white">
              Turn a URL into conversion evidence.
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/[0.66]">
              Keep the real audit workflow intact: paste a landing page, define the buyer, then let FrictionLab generate
              the research artifacts your team can share.
            </p>
            <Link
              className="mt-9 inline-flex items-center gap-2 rounded-full border border-white/[0.16] px-5 py-3 text-sm font-semibold text-white transition hover:border-[var(--lime)] hover:text-[var(--lime)]"
              href="/audit/new"
            >
              Open full audit page
              <Share2 className="h-4 w-4" />
            </Link>
          </div>
          <div className="landing-form-shell">
            <AuditForm />
          </div>
        </div>
      </section>

      <footer className="px-4 pb-12 md:px-8">
        <div className="mx-auto flex w-[min(1360px,100%)] flex-col gap-5 border-t border-white/10 pt-8 text-sm text-white/[0.50] md:flex-row md:items-center md:justify-between">
          <p>FrictionLab converts landing page uncertainty into research evidence.</p>
          <div className="flex gap-5">
            <a href="#research">Research engine</a>
            <a href="#evidence">Evidence</a>
            <a href="/audit/new">New audit</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
