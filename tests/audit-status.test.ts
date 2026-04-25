import { describe, expect, it } from "vitest";
import { isAuditInProgress, isAuditTerminal } from "@/lib/workflow/status";

describe("audit workflow status helpers", () => {
  it("treats CREATED and RUNNING as in-progress statuses", () => {
    expect(isAuditInProgress("CREATED")).toBe(true);
    expect(isAuditInProgress("RUNNING")).toBe(true);
    expect(isAuditTerminal("CREATED")).toBe(false);
    expect(isAuditTerminal("RUNNING")).toBe(false);
  });

  it("treats completed, partial, failed and demo runs as terminal", () => {
    for (const status of ["COMPLETED", "PARTIAL", "FAILED", "DEMO"]) {
      expect(isAuditTerminal(status)).toBe(true);
      expect(isAuditInProgress(status)).toBe(false);
    }
  });
});
