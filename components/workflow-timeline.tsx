import { CheckCircle2, CircleDashed, CircleX, FlaskConical } from "lucide-react";
import { formatStatus } from "@/lib/ui/json";

type WorkflowTimelineProps = {
  status: string;
  toolCalls: Array<{ toolName: string; status: string; error: string | null }>;
  agentRuns: Array<{ agentName: string; status: string; error: string | null }>;
};

const steps = [
  { key: "extractPage", label: "Extract page" },
  { key: "DOM_SNAPSHOT", label: "DOM evidence" },
  { key: "audit_synthesis", label: "AI synthesis" },
  { key: "report", label: "Report" },
  { key: "presenter", label: "Presenter" }
];

export function WorkflowTimeline({ status, toolCalls, agentRuns }: WorkflowTimelineProps) {
  const names = new Set([...toolCalls.map((tool) => tool.toolName), ...agentRuns.map((agent) => agent.agentName)]);

  return (
    <div className="panel rounded-[8px] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-xs uppercase muted">Workflow</p>
          <h2 className="text-xl font-semibold">{formatStatus(status)}</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--lime)]/30 px-3 py-1 text-xs text-[var(--lime)]">
          <FlaskConical className="h-3.5 w-3.5" />
          Sequential runner
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => {
          const completed =
            names.has(step.key) ||
            (step.key === "DOM_SNAPSHOT" && toolCalls.length > 0) ||
            (step.key === "report" && ["COMPLETED", "PARTIAL", "DEMO"].includes(status)) ||
            (step.key === "presenter" && ["COMPLETED", "PARTIAL", "DEMO"].includes(status));
          const failed =
            toolCalls.some((event) => event.toolName === step.key && event.status === "FAILED") ||
            agentRuns.some((event) => event.agentName === step.key && event.status === "FAILED");

          return (
            <div className="panel-soft rounded-[8px] p-3" key={step.key}>
              <div className="mb-3 flex items-center justify-between">
                <span className="mono text-xs muted">0{index + 1}</span>
                {failed ? (
                  <CircleX className="h-4 w-4 text-red-300" />
                ) : completed ? (
                  <CheckCircle2 className="h-4 w-4 text-[var(--lime)]" />
                ) : (
                  <CircleDashed className="h-4 w-4 muted" />
                )}
              </div>
              <p className="text-sm font-medium">{step.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
