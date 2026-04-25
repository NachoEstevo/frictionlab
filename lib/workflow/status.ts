const terminalAuditStatuses = new Set(["COMPLETED", "PARTIAL", "FAILED", "DEMO"]);

export function isAuditTerminal(status: string): boolean {
  return terminalAuditStatuses.has(status);
}

export function isAuditInProgress(status: string): boolean {
  return !isAuditTerminal(status);
}
