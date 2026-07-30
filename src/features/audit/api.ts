/**
 * Audit / reconciliation API — /api/v1/audit/*
 */
import type { TerminalAudit } from "@/types";

export async function listTerminals(): Promise<TerminalAudit[]> {
  throw new Error("Not implemented");
}

export async function submitReconciliation(
  _terminalId: string,
  _actualCash: number
): Promise<TerminalAudit> {
  throw new Error("Not implemented");
}
