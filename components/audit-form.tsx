"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, FlaskConical, Loader2 } from "lucide-react";

type FormState = {
  url: string;
  targetAudience: string;
  conversionGoal: string;
  businessType: string;
  language: string;
  market: string;
  brandTone: string;
  personaCount: number;
};

const defaultState: FormState = {
  url: "https://www.vercel.com",
  targetAudience: "technical founders evaluating developer platforms",
  conversionGoal: "Start a trial",
  businessType: "devtool",
  language: "en",
  market: "US",
  brandTone: "precise, technical and premium",
  personaCount: 4
};

export function AuditForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(defaultState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitAudit(demoMode: boolean) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/audits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, demoMode })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Audit failed.");

      router.push(`/audit/${payload.auditRunId}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to start audit.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="panel rounded-[8px] p-5">
      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-xs uppercase muted mono">Landing page URL</span>
          <input
            className="rounded-[6px] border border-white/10 bg-black/40 px-3 py-3 text-sm outline-none focus:border-[var(--lime)]"
            value={form.url}
            onChange={(event) => setForm({ ...form, url: event.target.value })}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs uppercase muted mono">Target audience</span>
            <textarea
              className="min-h-24 rounded-[6px] border border-white/10 bg-black/40 px-3 py-3 text-sm outline-none focus:border-[var(--lime)]"
              value={form.targetAudience}
              onChange={(event) => setForm({ ...form, targetAudience: event.target.value })}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs uppercase muted mono">Conversion goal</span>
            <textarea
              className="min-h-24 rounded-[6px] border border-white/10 bg-black/40 px-3 py-3 text-sm outline-none focus:border-[var(--lime)]"
              value={form.conversionGoal}
              onChange={(event) => setForm({ ...form, conversionGoal: event.target.value })}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <label className="grid gap-2">
            <span className="text-xs uppercase muted mono">Business</span>
            <select
              className="rounded-[6px] border border-white/10 bg-black/40 px-3 py-3 text-sm outline-none focus:border-[var(--lime)]"
              value={form.businessType}
              onChange={(event) => setForm({ ...form, businessType: event.target.value })}
            >
              <option value="saas">SaaS</option>
              <option value="agency">Agency</option>
              <option value="ecommerce">Ecommerce</option>
              <option value="devtool">Devtool</option>
              <option value="fintech">Fintech</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs uppercase muted mono">Language</span>
            <input
              className="rounded-[6px] border border-white/10 bg-black/40 px-3 py-3 text-sm outline-none focus:border-[var(--lime)]"
              value={form.language}
              onChange={(event) => setForm({ ...form, language: event.target.value })}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs uppercase muted mono">Market</span>
            <input
              className="rounded-[6px] border border-white/10 bg-black/40 px-3 py-3 text-sm outline-none focus:border-[var(--lime)]"
              value={form.market}
              onChange={(event) => setForm({ ...form, market: event.target.value })}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs uppercase muted mono">Personas</span>
            <input
              className="rounded-[6px] border border-white/10 bg-black/40 px-3 py-3 text-sm outline-none focus:border-[var(--lime)]"
              min={2}
              max={6}
              type="number"
              value={form.personaCount}
              onChange={(event) => setForm({ ...form, personaCount: Number(event.target.value) })}
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-xs uppercase muted mono">Brand tone</span>
          <input
            className="rounded-[6px] border border-white/10 bg-black/40 px-3 py-3 text-sm outline-none focus:border-[var(--lime)]"
            value={form.brandTone}
            onChange={(event) => setForm({ ...form, brandTone: event.target.value })}
          />
        </label>
      </div>

      {error ? <p className="mt-4 rounded-[6px] border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          className="lime-glow inline-flex items-center gap-2 rounded-[6px] bg-[var(--lime)] px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"
          disabled={isSubmitting}
          onClick={() => submitAudit(false)}
          type="button"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Run real audit
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-[6px] border border-white/10 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          disabled={isSubmitting}
          onClick={() => submitAudit(true)}
          type="button"
        >
          <FlaskConical className="h-4 w-4" />
          Load demo audit
        </button>
      </div>
    </div>
  );
}
