import { prisma } from "@/lib/db";
import { redactMailboxEvent } from "@/lib/webapp/guards";

export async function getAuditState(auditRunId: string) {
  const audit = await prisma.auditRun.findUnique({
    where: { id: auditRunId },
    include: {
      pageSnapshot: true,
      screenshots: {
        orderBy: { createdAt: "asc" }
      },
      personas: true,
      sessions: {
        include: {
          events: {
            orderBy: { order: "asc" }
          },
          persona: true
        }
      },
      findings: true,
      recommendations: {
        orderBy: { priority: "desc" }
      },
      copyVariants: true,
      report: true,
      presenterReport: {
        include: {
          scenes: {
            orderBy: { order: "asc" }
          }
        }
      },
      browserRun: {
        include: {
          steps: {
            orderBy: { order: "asc" }
          },
          mailboxEvents: {
            orderBy: { createdAt: "asc" }
          }
        }
      },
      shareableReport: true,
      agentRuns: {
        orderBy: { startedAt: "asc" }
      },
      toolCalls: {
        orderBy: { startedAt: "asc" }
      }
    }
  });

  return redactAuditMailboxEvents(audit);
}

export async function getAuditEvents(auditRunId: string) {
  const [agentRuns, toolCalls, browserRun] = await Promise.all([
    prisma.agentRun.findMany({
      where: { auditRunId },
      orderBy: { startedAt: "asc" }
    }),
    prisma.toolCall.findMany({
      where: { auditRunId },
      orderBy: { startedAt: "asc" }
    }),
    prisma.browserRun.findUnique({
      where: { auditRunId },
      include: {
        steps: {
          orderBy: { order: "asc" }
        },
        mailboxEvents: {
          orderBy: { createdAt: "asc" }
        }
      }
    })
  ]);

  return { agentRuns, toolCalls, browserRun: redactBrowserRunMailboxEvents(browserRun) };
}

export async function getShareableReportState(shareId: string) {
  const share = await prisma.shareableReport.findUnique({
    where: { shareId },
    include: {
      auditRun: {
        include: {
          pageSnapshot: true,
          screenshots: {
            orderBy: { createdAt: "asc" }
          },
          personas: true,
          sessions: {
            include: {
              events: { orderBy: { order: "asc" } },
              persona: true
            }
          },
          findings: true,
          recommendations: { orderBy: { priority: "desc" } },
          copyVariants: true,
          report: true,
          presenterReport: {
            include: {
              scenes: { orderBy: { order: "asc" } }
            }
          },
          browserRun: {
            include: {
              steps: { orderBy: { order: "asc" } },
              mailboxEvents: { orderBy: { createdAt: "asc" } }
            }
          },
          shareableReport: true
        }
      }
    }
  });

  return share?.isPublic ? redactAuditMailboxEvents(share.auditRun) : null;
}

function redactAuditMailboxEvents<T extends { browserRun?: { mailboxEvents?: unknown[] } | null } | null>(audit: T): T {
  if (!audit?.browserRun) return audit;

  return {
    ...audit,
    browserRun: redactBrowserRunMailboxEvents(audit.browserRun)
  } as T;
}

function redactBrowserRunMailboxEvents<T extends { mailboxEvents?: unknown[] } | null>(browserRun: T): T {
  if (!browserRun?.mailboxEvents) return browserRun;

  return {
    ...browserRun,
    mailboxEvents: browserRun.mailboxEvents.map((event) => redactMailboxEvent(event as Parameters<typeof redactMailboxEvent>[0]))
  } as T;
}
