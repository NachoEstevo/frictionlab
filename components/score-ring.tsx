type ScoreRingProps = {
  score: number | null | undefined;
  label?: string;
};

export function ScoreRing({ score, label = "Conversion score" }: ScoreRingProps) {
  const safeScore = Math.max(0, Math.min(100, score ?? 0));

  return (
    <div className="panel rounded-[8px] p-5">
      <div className="flex items-center gap-5">
        <div
          className="grid h-28 w-28 place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--lime) ${safeScore * 3.6}deg, rgba(255,255,255,0.08) 0deg)`
          }}
        >
          <div className="grid h-20 w-20 place-items-center rounded-full bg-black">
            <span className="text-3xl font-bold">{safeScore}</span>
          </div>
        </div>
        <div>
          <p className="mono text-xs uppercase muted">{label}</p>
          <p className="mt-2 text-sm muted">Evidence-backed readiness score from synthetic sessions.</p>
        </div>
      </div>
    </div>
  );
}
