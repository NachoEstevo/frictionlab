import type { PageSnapshot } from "@/lib/schemas/page";

export type WebappActionType = "click" | "fill" | "select" | "press" | "navigate" | "wait_for_email" | "stop" | "blocked";

export type WebappAgentAction = {
  actionType: WebappActionType;
  target?: string;
  value?: string;
  reason: string;
};

export type WebappStepEvidence = {
  order: number;
  actionType: WebappActionType | "observe";
  target?: string;
  url?: string;
  title?: string;
  observation: string;
  screenshotUrl?: string;
  status: "COMPLETED" | "FAILED" | "BLOCKED";
  error?: string;
  metadata?: Record<string, unknown>;
};

export type WebappMailboxEvent = {
  emailAlias: string;
  subject?: string;
  fromAddress?: string;
  confirmationLink?: string;
  confirmationCode?: string;
  status: "FOUND" | "USED" | "TIMEOUT" | "BLOCKED" | "FAILED";
  error?: string;
};

export type WebappRunResult = {
  status: "COMPLETED" | "PARTIAL" | "BLOCKED";
  finalUrl?: string;
  remoteSessionId?: string;
  steps: WebappStepEvidence[];
  mailboxEvents: WebappMailboxEvent[];
  pageSnapshot: PageSnapshot;
  error?: string;
  metadata?: Record<string, unknown>;
};

export type WebappBrowserRunner = () => Promise<WebappRunResult>;
