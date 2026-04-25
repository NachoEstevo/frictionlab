import { prisma } from "@/lib/db";

export async function getAuditState(auditRunId: string) {
  return prisma.auditRun.findUnique({
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
}

export async function getAuditEvents(auditRunId: string) {
  const [agentRuns, toolCalls] = await Promise.all([
    prisma.agentRun.findMany({
      where: { auditRunId },
      orderBy: { startedAt: "asc" }
    }),
    prisma.toolCall.findMany({
      where: { auditRunId },
      orderBy: { startedAt: "asc" }
    })
  ]);

  return { agentRuns, toolCalls };
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

  return share?.isPublic ? share.auditRun : null;
}
