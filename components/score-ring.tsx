type ScoreRingProps = {
  score: number | null | undefined;
  label?: string;
};

export function ScoreRing({ score, label = "Conversion score" }: ScoreRingProps) {
  const safeScore = Math.max(0, Math.min(100, score ?? 0));
  const radius = 39;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="panel min-w-0 rounded-[8px] p-5">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center xl:flex-col xl:items-start 2xl:flex-row 2xl:items-center">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full" aria-label={`${label}: ${safeScore}`}>
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 96 96" role="presentation">
            <circle
              cx="48"
              cy="48"
              fill="none"
              r={radius}
              stroke="rgba(245,245,245,0.12)"
              strokeWidth="9"
            />
            <circle
              cx="48"
              cy="48"
              fill="none"
              r={radius}
              stroke="var(--lime)"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              strokeWidth="9"
            />
          </svg>
          <div className="relative grid h-[70px] w-[70px] place-items-center rounded-full border border-white/8 bg-[var(--void)]">
            <span className="mono text-3xl font-semibold text-white">{safeScore}</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="mono text-xs uppercase muted">{label}</p>
          <p className="content-safe mt-2 text-sm leading-6 muted">Evidence-backed readiness score from synthetic sessions.</p>
        </div>
      </div>
    </div>
  );
}
