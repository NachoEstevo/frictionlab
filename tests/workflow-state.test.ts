import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    agentRun: {
      findMany: vi.fn()
    },
    toolCall: {
      findMany: vi.fn()
    },
    browserRun: {
      findUnique: vi.fn()
    }
  }
}));

describe("workflow state", () => {
  it("includes browser steps and mailbox events in audit events", async () => {
    const { prisma } = await import("@/lib/db");
    const { getAuditEvents } = await import("@/lib/workflow/state");

    vi.mocked(prisma.agentRun.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.toolCall.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.browserRun.findUnique).mockResolvedValue({
      id: "browser_run_1",
      status: "RUNNING",
      steps: [{ id: "step_1", order: 1, actionType: "navigate" }],
      mailboxEvents: [
        {
          id: "mail_1",
          status: "USED",
          confirmationLink: "https://app.example.com/confirm?token=secret-token",
          confirmationCode: "483921"
        }
      ]
    } as any);

    await expect(getAuditEvents("audit_1")).resolves.toMatchObject({
      agentRuns: [],
      toolCalls: [],
      browserRun: {
        id: "browser_run_1",
        steps: [{ id: "step_1", order: 1, actionType: "navigate" }],
        mailboxEvents: [
          {
            id: "mail_1",
            status: "USED",
            confirmationLink: "https://app.example.com/[redacted-confirmation-link]",
            confirmationCode: "[redacted]"
          }
        ]
      }
    });
  });
});
