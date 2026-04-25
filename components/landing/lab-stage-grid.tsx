"use client";

import { useRef, type PointerEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CodedResearchAsset } from "@/components/landing/coded-research-asset";

gsap.registerPlugin(useGSAP);

const stages = [
  {
    step: "01",
    label: "Extract",
    title: "Read the page like a conversion researcher.",
    copy: "The workflow pulls visible offer, CTA, proof, objections, missing context, and screenshots when available.",
    visual: "sessions" as const,
    metrics: ["Offer map", "CTA path", "DOM evidence"]
  },
  {
    step: "02",
    label: "Simulate",
    title: "Send synthetic buyers with different failure modes.",
    copy: "Each persona has a motivation, skepticism level, trust threshold, and final conversion likelihood.",
    visual: "swarm" as const,
    metrics: ["4 personas", "Session events", "Objections"]
  },
  {
    step: "03",
    label: "Prove",
    title: "Tie every claim to evidence before recommending fixes.",
    copy: "Findings are ranked by severity and mapped to affected personas, proof gaps, and missing information.",
    visual: "evidence" as const,
    metrics: ["Severity", "Evidence refs", "Trust gaps"]
  },
  {
    step: "04",
    label: "Package",
    title: "Turn the run into artifacts people can use.",
    copy: "The output is a shareable report, copy variants, implementation checklist, and Presenter Report.",
    visual: "presenter" as const,
    metrics: ["Report", "Copy lab", "Storyboard"]
  }
];

export function LabStageGrid() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(q(".lab-stage-card"), { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" });

        const tl = gsap.timeline({ repeat: -1, defaults: { ease: "power2.inOut" } });
        q(".lab-stage-card").forEach((card, index) => {
          tl.to(card, { "--stage-progress": "100%", borderColor: "rgba(204,255,61,.42)", duration: 0.9 }, index === 0 ? 0 : ">-0.15")
            .to(card, { y: -7, duration: 0.42 }, "<")
            .to(card, { y: 0, borderColor: "rgba(245,245,245,.1)", duration: 0.5 })
            .set(card, { "--stage-progress": "0%" });
        });
      });
    },
    { scope: rootRef }
  );

  function handleMove(event: PointerEvent<HTMLElement>) {
    const card = event.currentTarget;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  return (
    <div className="lab-stage-grid" ref={rootRef}>
      {stages.map((stage) => (
        <article className="lab-stage-card" key={stage.step} onPointerMove={handleMove}>
          <div className="stage-progress" />
          <div className="stage-card-copy">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="mono text-[10px] uppercase tracking-[0.24em] text-[var(--lime)]">{stage.label}</p>
                <h3>{stage.title}</h3>
              </div>
              <span className="mono stage-number">{stage.step}</span>
            </div>
            <p>{stage.copy}</p>
            <div className="stage-metrics">
              {stage.metrics.map((metric) => (
                <span key={metric}>{metric}</span>
              ))}
            </div>
          </div>
          <div className="stage-card-visual">
            <CodedResearchAsset variant={stage.visual} compact />
          </div>
        </article>
      ))}
    </div>
  );
}
