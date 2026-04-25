import { AuditForm } from "@/components/audit-form";

export default function NewAuditPage() {
  return (
    <div className="lab-container py-8 md:py-12">
      <a className="mono text-xs uppercase muted" href="/">
        FrictionLab
      </a>
      <div className="mt-8 grid gap-8 xl:grid-cols-[420px_1fr]">
        <div>
          <p className="mono text-xs uppercase text-[var(--lime)]">New audit</p>
          <h1 className="mt-3 text-4xl font-semibold">Run a real synthetic UX audit.</h1>
          <p className="mt-4 leading-7 muted">
            Audit a public landing page or let a controlled browser agent sign up, confirm email and inspect a real webapp flow.
          </p>
        </div>
        <AuditForm />
      </div>
    </div>
  );
}
