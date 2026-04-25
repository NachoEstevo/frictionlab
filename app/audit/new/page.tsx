import { AuditForm } from "@/components/audit-form";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileSearch, FlaskConical, Gauge, Layers3 } from "lucide-react";

const auditPreview = [
  { label: "Extract", copy: "Visible offer, CTA path, proof inventory and missing context.", icon: FileSearch },
  { label: "Simulate", copy: "Founder, evaluator, operator and skeptical buyer sessions.", icon: FlaskConical },
  { label: "Prove", copy: "Evidence refs, affected personas and severity-ranked findings.", icon: Layers3 },
  { label: "Package", copy: "Readiness score, rewrites, checklist and Presenter Report.", icon: Gauge }
];

export default function NewAuditPage() {
  return (
    <main className="audit-entry-page">
      <div className="lab-container py-6 md:py-8">
        <nav className="audit-entry-nav">
          <Link className="audit-back-link" href="/">
            <ArrowLeft className="h-4 w-4" />
            FrictionLab
          </Link>
          <Link className="audit-nav-cta" href="/">
            Landing
          </Link>
        </nav>

        <div className="audit-entry-hero">
          <div>
            <p className="mono text-xs uppercase tracking-[0.26em] text-[var(--lime)]">Run audit</p>
            <h1>Run a real synthetic UX audit.</h1>
          </div>
          <p>
            Paste a public landing page, define the buyer and conversion goal, then generate an evidence-bound report.
            Use webapp mode when you need the controlled browser agent to inspect a real signup or onboarding flow.
          </p>
        </div>

        <div className="audit-entry-grid">
          <section className="audit-form-panel" aria-label="Audit setup form">
            <div className="audit-panel-heading">
              <div>
                <p className="mono">Audit setup</p>
                <h2>Define the target and run the lab.</h2>
              </div>
              <span>Public URL required</span>
            </div>
            <AuditForm />
          </section>

          <aside className="audit-preview-panel" aria-label="Audit output preview">
            <div className="audit-preview-header">
              <p className="mono">Report preview</p>
              <strong>62</strong>
              <span>/ 100 readiness sample</span>
            </div>

            <div className="audit-preview-finding">
              <div>
                <span>High</span>
                <span>E-03</span>
              </div>
              <h2>Pricing context missing before first CTA</h2>
              <p>Recommendation, rewrite candidate, affected personas and source evidence are packaged into the report.</p>
            </div>

            <div className="audit-preview-steps">
              {auditPreview.map((item) => {
                const PreviewIcon = item.icon;

                return (
                  <article key={item.label}>
                    <PreviewIcon className="h-4 w-4 text-[var(--lime)]" />
                    <div>
                      <h3>{item.label}</h3>
                      <p>{item.copy}</p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-[var(--lime)]" />
                  </article>
                );
              })}
            </div>

            <div className="audit-preview-note">
              <p className="mono">Demo path</p>
              <span>Load demo audit uses the same form contract and routes into the persisted audit view.</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
