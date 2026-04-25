"use client";

import { useRef, useState, type PointerEvent } from "react";
import { ArrowRight, FlaskConical, RotateCcw } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const labEvents = [
  { label: "Extract", copy: "Offer, CTA path, proof, objections" },
  { label: "Simulate", copy: "4 synthetic buyers with different trust thresholds" },
  { label: "Prove", copy: "Findings ranked and bound to page evidence" },
  { label: "Package", copy: "Report, copy variants, Presenter Report" }
];

const personaSignals = [
  { name: "Founder", risk: "Offer clarity", score: "42.8%" },
  { name: "Evaluator", risk: "Trust proof", score: "58.4%" },
  { name: "Buyer", risk: "Pricing context", score: "37.2%" }
];

const profiles = [
  {
    url: "https://www.vercel.com",
    audience: "Technical founders evaluating dev platforms",
    goal: "Start a trial",
    business: "Devtool",
    language: "en",
    market: "US",
    personas: "4",
    tone: "precise, technical, premium"
  },
  {
    url: "https://demo.frictionlab.ai/pricing",
    audience: "B2B buyers comparing workflow tools",
    goal: "Book a demo",
    business: "SaaS",
    language: "en",
    market: "NA",
    personas: "5",
    tone: "clear, skeptical, evidence-first"
  }
];

export function LabConsole() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [profileIndex, setProfileIndex] = useState(0);
  const [runLabel, setRunLabel] = useState("Ready to audit");
  const profile = profiles[profileIndex];

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(q("[data-lab-scan]"), { yPercent: 210, duration: 4, ease: "none", repeat: -1 });
        gsap.to(q("[data-lab-pulse]"), { scale: 1.12, autoAlpha: 0.5, duration: 1.5, yoyo: true, repeat: -1, ease: "sine.inOut" });
        gsap.to(q("[data-lab-thread]"), { strokeDashoffset: -180, duration: 5.5, repeat: -1, ease: "none" });
      });
    },
    { scope: rootRef }
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);

      gsap.fromTo(q(".lab-event-row.is-active"), { x: -8, autoAlpha: 0.62 }, { x: 0, autoAlpha: 1, duration: 0.35, ease: "power2.out" });
      gsap.fromTo(q(".lab-core"), { scale: 0.96 }, { scale: 1, duration: 0.45, ease: "back.out(1.7)" });
      gsap.fromTo(q(".lab-output-preview"), { y: 8, autoAlpha: 0.78 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: "power2.out" });
    },
    { scope: rootRef, dependencies: [activeStep, profileIndex] }
  );

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    const root = rootRef.current;
    if (!root || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = root.getBoundingClientRect();
    root.style.setProperty("--lab-x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    root.style.setProperty("--lab-y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  }

  function runAuditPreview() {
    const nextStep = (activeStep + 1) % labEvents.length;
    setActiveStep(nextStep);
    setRunLabel(`${labEvents[nextStep].label} running`);
  }

  function loadDemoProfile() {
    const nextProfile = (profileIndex + 1) % profiles.length;
    setProfileIndex(nextProfile);
    setActiveStep(1);
    setRunLabel("Demo profile loaded");
  }

  return (
    <div className="lab-console" ref={rootRef} onPointerMove={handleMove}>
      <div className="lab-console-header">
        <div className="flex items-center gap-3">
          <span className="brand-mark-shell">
            <img src="/favicon.svg" alt="" />
          </span>
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--lime)]">Live lab</p>
            <p className="text-sm font-semibold text-white">Conversion research run</p>
          </div>
        </div>
        <div className="lab-status-pill">
          <span />
          {runLabel}
        </div>
      </div>

      <div className="lab-console-grid">
        <div className="lab-form-stage">
          <div className="lab-brief-card">
            <div className="lab-brief-heading">
              <p className="mono">Audit brief</p>
              <span>Hero preview</span>
            </div>

            <label className="lab-field lab-field-wide">
              <span>Landing page URL</span>
              <input readOnly value={profile.url} />
            </label>

            <div className="lab-field-grid lab-field-grid-two">
              <label className="lab-field">
                <span>Target audience</span>
                <textarea readOnly value={profile.audience} />
              </label>
              <label className="lab-field">
                <span>Conversion goal</span>
                <textarea readOnly value={profile.goal} />
              </label>
            </div>

            <div className="lab-config-grid" aria-label="Audit configuration">
              <button type="button" onClick={() => setRunLabel("Business model selected")}>
                <span>Business</span>
                <strong>{profile.business}</strong>
              </button>
              <button type="button" onClick={() => setRunLabel("Language locked")}>
                <span>Language</span>
                <strong>{profile.language}</strong>
              </button>
              <button type="button" onClick={() => setRunLabel("Market context set")}>
                <span>Market</span>
                <strong>{profile.market}</strong>
              </button>
              <button type="button" onClick={() => setRunLabel("Persona count set")}>
                <span>Personas</span>
                <strong>{profile.personas}</strong>
              </button>
            </div>

            <label className="lab-field lab-field-wide">
              <span>Brand tone</span>
              <input readOnly value={profile.tone} />
            </label>

            <div className="lab-action-row">
              <button className="lab-primary-action" type="button" onClick={runAuditPreview}>
                <ArrowRight className="h-4 w-4" />
                Run preview
              </button>
              <button className="lab-secondary-action" type="button" onClick={loadDemoProfile}>
                <RotateCcw className="h-4 w-4" />
                Load demo
              </button>
            </div>
          </div>
        </div>

        <div className="lab-visual-stage">
          <div className="lab-scan" data-lab-scan />
          <svg className="lab-thread-map" viewBox="0 0 520 360" fill="none" aria-hidden="true">
            <path data-lab-thread d="M64 270 C130 112, 215 310, 264 138 C314 -32, 389 224, 468 84" stroke="#ccff3d" strokeWidth="1.4" strokeDasharray="9 12" />
            <path data-lab-thread d="M42 102 C126 184, 201 74, 279 190 C355 306, 421 148, 492 252" stroke="rgba(245,245,245,.32)" strokeWidth="1" strokeDasharray="7 10" />
          </svg>

          <div className="lab-core">
            <span data-lab-pulse />
            <FlaskConical className="h-7 w-7 text-[var(--lime)]" />
            <strong>{profile.personas}</strong>
            <p>synthetic users</p>
          </div>

          <div className="lab-event-stack">
            {labEvents.map((event, index) => (
              <button
                className={`lab-event-row ${activeStep === index ? "is-active" : ""}`}
                data-lab-row
                key={event.label}
                onClick={() => {
                  setActiveStep(index);
                  setRunLabel(`${event.label} selected`);
                }}
                type="button"
              >
                <span className="mono">0{index + 1}</span>
                <p>{event.label}</p>
                <small>{event.copy}</small>
              </button>
            ))}
          </div>

          <div className="lab-persona-strip">
            {personaSignals.map((persona) => (
              <button className="lab-persona-card" key={persona.name} onClick={() => setRunLabel(`${persona.name} signal inspected`)} type="button">
                <p className="mono">{persona.name}</p>
                <strong>{persona.score}</strong>
                <span>{persona.risk}</span>
              </button>
            ))}
          </div>

          <div className="lab-output-preview">
            <p className="mono">{labEvents[activeStep].label}</p>
            <div className="lab-output-bars">
              <span />
              <span />
              <span />
            </div>
            <strong>{labEvents[activeStep].copy}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
