"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuditInProgress } from "@/lib/workflow/status";

type AuditDashboardPollerProps = {
  status: string;
};

export function AuditDashboardPoller({ status }: AuditDashboardPollerProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuditInProgress(status)) return;

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [router, status]);

  return null;
}
