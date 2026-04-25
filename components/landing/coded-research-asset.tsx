"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

type AssetVariant = "swarm" | "sessions" | "evidence" | "presenter";

type CodedResearchAssetProps = {
  variant: AssetVariant;
  compact?: boolean;
};

const nodePoints = [
  [12, 22],
  [24, 16],
  [39, 24],
  [54, 14],
  [68, 25],
  [82, 18],
  [18, 46],
  [31, 55],
  [47, 43],
  [64, 55],
  [78, 44],
  [89, 62],
  [27, 77],
  [44, 70],
  [60, 79],
  [74, 72]
];

const evidenceCards = [
  { x: 9, y: 21, score: "+36" },
  { x: 32, y: 10, score: "+12" },
  { x: 63, y: 17, score: "+28" },
  { x: 75, y: 38, score: "+24" },
  { x: 18, y: 48, score: "+31" },
  { x: 52, y: 55, score: "+7" }
];

function AssetFrame({ children, variant, compact }: CodedResearchAssetProps & { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(
        {
          isMobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)"
        },
        (context) => {
          const { isMobile, reduceMotion } = context.conditions as { isMobile: boolean; reduceMotion: boolean };
          if (reduceMotion) return;
          const drift = q("[data-drift]");
          const pulse = q("[data-pulse]");
          const flow = q("[data-flow]");
          const cursor = q("[data-cursor]");
          const wave = q("[data-wave]");

          if (drift.length) {
            gsap.fromTo(
              drift,
              { autoAlpha: 0.28, y: isMobile ? 6 : 12 },
              { autoAlpha: 1, y: isMobile ? -5 : -8, duration: 2.8, stagger: 0.08, repeat: -1, yoyo: true, ease: "sine.inOut" }
            );
          }
          if (pulse.length) {
            gsap.to(pulse, {
              scale: isMobile ? 1.1 : 1.18,
              autoAlpha: 0.42,
              duration: 1.5,
              stagger: 0.12,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              transformOrigin: "center"
            });
          }
          if (flow.length) {
            gsap.to(flow, { strokeDashoffset: -180, duration: 5.5, repeat: -1, ease: "none" });
          }
          if (cursor.length) {
            gsap.to(cursor, { x: isMobile ? 22 : 40, y: isMobile ? -14 : -24, duration: 2.2, repeat: -1, yoyo: true, ease: "power2.inOut" });
          }
          if (wave.length) {
            gsap.to(wave, {
              scaleY: isMobile ? 1.35 : 1.55,
              duration: 0.9,
              stagger: { each: 0.04, from: "center" },
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              transformOrigin: "50% 100%"
            });
          }
        },
        root
      );

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  const handleMove = contextSafe((event: PointerEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    if (!root) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = root.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    gsap.to(root, {
      "--asset-tilt-x": `${-y * 7}deg`,
      "--asset-tilt-y": `${x * 9}deg`,
      "--asset-glow-x": `${(x + 0.5) * 100}%`,
      "--asset-glow-y": `${(y + 0.5) * 100}%`,
      duration: 0.45,
      ease: "power3.out",
      overwrite: "auto"
    });
  });

  const handleLeave = contextSafe(() => {
    if (!rootRef.current) return;
    gsap.to(rootRef.current, {
      "--asset-tilt-x": "0deg",
      "--asset-tilt-y": "0deg",
      "--asset-glow-x": "50%",
      "--asset-glow-y": "42%",
      duration: 0.7,
      ease: "power3.out",
      overwrite: "auto"
    });
  });

  return (
    <div
      ref={rootRef}
      className={`coded-asset coded-asset-${variant}${compact ? " coded-asset-compact" : ""}`}
      onPointerLeave={handleLeave}
      onPointerMove={handleMove}
      role="img"
      aria-label={`${variant} interactive research visualization`}
    >
      <div className="asset-grid" />
      {children}
    </div>
  );
}

export function CodedResearchAsset({ variant, compact = false }: CodedResearchAssetProps) {
  if (variant === "sessions") return <AssetFrame variant={variant} compact={compact}><SessionsAsset /></AssetFrame>;
  if (variant === "evidence") return <AssetFrame variant={variant} compact={compact}><EvidenceAsset /></AssetFrame>;
  if (variant === "presenter") return <AssetFrame variant={variant} compact={compact}><PresenterAsset /></AssetFrame>;
  return <AssetFrame variant={variant} compact={compact}><SwarmAsset /></AssetFrame>;
}

function SwarmAsset() {
  return (
    <>
      <svg className="asset-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="swarmCore" cx="50%" cy="48%" r="45%">
            <stop offset="0%" stopColor="#ccff3d" stopOpacity="0.9" />
            <stop offset="42%" stopColor="#ccff3d" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ccff3d" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="50" rx="34" ry="11" fill="none" stroke="rgba(255,255,255,.16)" />
        <ellipse cx="51" cy="47" rx="42" ry="16" fill="none" stroke="rgba(204,255,61,.26)" data-flow strokeDasharray="5 7" />
        <path d="M8 76 C25 38, 39 74, 50 22 C56 60, 75 31, 94 18" fill="none" stroke="rgba(204,255,61,.72)" strokeWidth="0.7" data-flow strokeDasharray="8 9" />
        <path d="M15 28 C34 47, 42 12, 52 50 C62 87, 72 28, 91 70" fill="none" stroke="rgba(255,255,255,.42)" strokeWidth="0.35" data-flow strokeDasharray="4 8" />
        <circle cx="52" cy="48" r="26" fill="url(#swarmCore)" data-pulse />
        <rect x="49" y="37" width="4" height="17" rx="2" fill="#ccff3d" opacity="0.82" />
        {nodePoints.map(([x, y], index) => (
          <g key={`${x}-${y}`} data-drift>
            <circle cx={x} cy={y} r={index % 3 === 0 ? 2.4 : 1.4} fill={index % 4 === 0 ? "#ccff3d" : "#f5f5f5"} opacity="0.88" />
            <circle cx={x} cy={y} r={index % 3 === 0 ? 4.2 : 2.8} fill="none" stroke="rgba(255,255,255,.24)" />
          </g>
        ))}
      </svg>
      <div className="asset-bottom">
        <MiniMap />
        <RadarModule />
        <SignalRows />
      </div>
    </>
  );
}

function SessionsAsset() {
  return (
    <>
      <div className="session-list">
        {Array.from({ length: 9 }).map((_, index) => <span key={index} />)}
      </div>
      <div className="session-stack">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="session-layer" style={{ "--i": index } as CSSProperties} key={index}>
            <span />
            <span />
            <span />
          </div>
        ))}
        <svg className="session-path" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <path d="M57 12 C35 26, 76 33, 50 49 C24 65, 63 71, 42 90" fill="none" stroke="#ccff3d" strokeWidth="1.2" data-flow strokeDasharray="7 6" />
        </svg>
        <div className="cursor-dot" data-cursor />
      </div>
      <TimelineModule />
    </>
  );
}

function EvidenceAsset() {
  return (
    <>
      <svg className="asset-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <circle cx="50" cy="48" r="5" fill="#ccff3d" filter="drop-shadow(0 0 18px #ccff3d)" data-pulse />
        {evidenceCards.map((card) => (
          <path key={card.score} d={`M50 48 C${card.x + 8} ${card.y + 20}, ${card.x + 22} ${card.y - 8}, ${card.x + 12} ${card.y + 7}`} fill="none" stroke="rgba(204,255,61,.6)" strokeWidth="0.55" data-flow strokeDasharray="6 7" />
        ))}
      </svg>
      {evidenceCards.map((card, index) => (
        <div className="evidence-card" style={{ left: `${card.x}%`, top: `${card.y}%` }} key={card.score} data-drift>
          <div />
          <span>{card.score}</span>
          <i />
        </div>
      ))}
      <div className="evidence-bottom">
        <PointCloud />
        <Heatmap />
      </div>
    </>
  );
}

function PresenterAsset() {
  return (
    <>
      <div className="presenter-dashboard">
        <div className="chart-line" />
        <div className="chart-sidebar" />
      </div>
      <div className="presenter-side">
        <SignalRows />
        <RadarModule />
      </div>
      <div className="story-strip">
        {Array.from({ length: 4 }).map((_, index) => <span className={index === 2 ? "is-active" : ""} key={index} />)}
      </div>
      <TimelineModule />
    </>
  );
}

function MiniMap() {
  return <div className="mini-map">{Array.from({ length: 26 }).map((_, index) => <span style={{ left: `${(index * 37) % 92}%`, top: `${(index * 19) % 78}%` }} key={index} />)}</div>;
}

function RadarModule() {
  return <div className="radar-module"><span /><span /><span /><i data-pulse /></div>;
}

function SignalRows() {
  return <div className="signal-rows">{Array.from({ length: 5 }).map((_, row) => <span key={row}>{Array.from({ length: 22 }).map((_, bar) => <i key={bar} />)}</span>)}</div>;
}

function TimelineModule() {
  return <div className="timeline-module">{Array.from({ length: 36 }).map((_, index) => <span data-wave key={index} style={{ height: `${18 + ((index * 13) % 38)}%` }} />)}</div>;
}

function PointCloud() {
  return <div className="point-cloud">{Array.from({ length: 90 }).map((_, index) => <span style={{ left: `${(index * 29) % 96}%`, top: `${(index * index * 7) % 84}%` }} key={index} />)}</div>;
}

function Heatmap() {
  return <div className="heatmap">{Array.from({ length: 36 }).map((_, index) => <span className={index % 7 === 0 || index % 11 === 0 ? "is-hot" : ""} key={index} />)}</div>;
}
