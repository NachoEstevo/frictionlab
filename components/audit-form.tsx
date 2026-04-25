"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, FlaskConical, Loader2 } from "lucide-react";

type FormState = {
  auditType: "LANDING" | "WEBAPP";
  url: string;
  targetAudience: string;
  conversionGoal: string;
  businessType: string;
  language: string;
  market: string;
  brandTone: string;
  personaCount: number;
  scenarioPrompt: string;
  signupAllowed: boolean;
  allowedDomains: string;
  maxSteps: number;
};

const defaultState: FormState = {
  auditType: "LANDING",
  url: "https://www.vercel.com",
  targetAudience: "technical founders evaluating developer platforms",
  conversionGoal: "Start a trial",
  businessType: "devtool",
  language: "en",
  market: "US",
  brandTone: "precise, technical and premium",
  personaCount: 4,
  scenarioPrompt: "Sign up, confirm the account by email, complete onboarding and create the first meaningful project.",
  signupAllowed: true,
  allowedDomains: "vercel.com",
  maxSteps: 12
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
        body: JSON.stringify(buildPayload(form, demoMode))
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
    <div className="audit-form-card">
      <div className="grid gap-4">
        <div className="audit-type-toggle">
          {(["LANDING", "WEBAPP"] as const).map((auditType) => (
            <button
              className={form.auditType === auditType ? "is-active" : ""}
              key={auditType}
              onClick={() => setForm({ ...form, auditType })}
              type="button"
            >
              {auditType === "LANDING" ? "Landing audit" : "Webapp audit"}
            </button>
          ))}
        </div>

        <label className="grid gap-2">
          <span className="text-xs uppercase muted mono">{form.auditType === "WEBAPP" ? "Signup or app URL" : "Landing page URL"}</span>
          <input
            className="audit-input"
            value={form.url}
            onChange={(event) => setForm({ ...form, url: event.target.value })}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs uppercase muted mono">Target audience</span>
            <textarea
              className="audit-input min-h-24"
              value={form.targetAudience}
              onChange={(event) => setForm({ ...form, targetAudience: event.target.value })}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs uppercase muted mono">Conversion goal</span>
            <textarea
              className="audit-input min-h-24"
              value={form.conversionGoal}
              onChange={(event) => setForm({ ...form, conversionGoal: event.target.value })}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <label className="grid gap-2">
            <span className="text-xs uppercase muted mono">Business</span>
            <select
              className="audit-input"
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
              className="audit-input"
              value={form.language}
              onChange={(event) => setForm({ ...form, language: event.target.value })}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs uppercase muted mono">Market</span>
            <input
              className="audit-input"
              value={form.market}
              onChange={(event) => setForm({ ...form, market: event.target.value })}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs uppercase muted mono">Personas</span>
            <input
              className="audit-input"
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
            className="audit-input"
            value={form.brandTone}
            onChange={(event) => setForm({ ...form, brandTone: event.target.value })}
          />
        </label>

        {form.auditType === "WEBAPP" ? (
          <div className="audit-webapp-fields">
            <label className="grid gap-2">
              <span className="text-xs uppercase muted mono">Agent scenario</span>
              <textarea
                className="audit-input min-h-28"
                value={form.scenarioPrompt}
                onChange={(event) => setForm({ ...form, scenarioPrompt: event.target.value })}
              />
            </label>
            <div className="grid gap-4 md:grid-cols-[1fr_140px]">
              <label className="grid gap-2">
                <span className="text-xs uppercase muted mono">Allowed domains</span>
                <input
                  className="audit-input"
                  value={form.allowedDomains}
                  onChange={(event) => setForm({ ...form, allowedDomains: event.target.value })}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs uppercase muted mono">Max steps</span>
                <input
                  className="audit-input"
                  min={1}
                  max={30}
                  type="number"
                  value={form.maxSteps}
                  onChange={(event) => setForm({ ...form, maxSteps: Number(event.target.value) })}
                />
              </label>
            </div>
            <label className="flex items-center gap-3 text-sm">
              <input
                checked={form.signupAllowed}
                className="h-4 w-4 accent-[var(--lime)]"
                onChange={(event) => setForm({ ...form, signupAllowed: event.target.checked })}
                type="checkbox"
              />
              Autonomous signup is allowed for this target
            </label>
          </div>
        ) : null}
      </div>

      {error ? <p className="mt-4 rounded-[6px] border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}

      <div className="audit-action-row">
        <button
          className="audit-primary-button lime-glow"
          disabled={isSubmitting}
          onClick={() => submitAudit(false)}
          type="button"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Run real audit
        </button>
        <button
          className="audit-secondary-button"
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

function buildPayload(form: FormState, demoMode: boolean) {
  const base = {
    url: form.url,
    targetAudience: form.targetAudience,
    conversionGoal: form.conversionGoal,
    businessType: form.businessType,
    language: form.language,
    market: form.market,
    brandTone: form.brandTone,
    personaCount: form.personaCount,
    demoMode
  };

  if (form.auditType === "LANDING") {
    return { ...base, auditType: "LANDING" };
  }

  return {
    ...base,
    auditType: "WEBAPP",
    scenarioPrompt: form.scenarioPrompt,
    signupAllowed: form.signupAllowed,
    allowedDomains: form.allowedDomains
      .split(",")
      .map((domain) => domain.trim())
      .filter(Boolean),
    maxSteps: form.maxSteps,
    mailboxMode: "GMAIL_IMAP"
  };
}
