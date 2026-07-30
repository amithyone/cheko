import { useState, useCallback } from "react";
import type { TerminalAudit, Transaction } from "@/types";
import { INITIAL_TERMINAL_AUDITS } from "@/mock";

export function useTerminalAudits() {
  const [terminalAudits, setTerminalAudits] = useState<TerminalAudit[]>(INITIAL_TERMINAL_AUDITS);

  const applyPaymentToTerminal = useCallback(
    (method: string, processedTotal: number, terminalId = "term-4") => {
      setTerminalAudits((prev) =>
        prev.map((term) => {
          if (term.id !== terminalId) return term;
          const cashAdd =
            method === "Cash" ? processedTotal : method === "Split" ? processedTotal * 0.4 : 0;
          const transferAdd =
            method === "Bank Transfer"
              ? processedTotal
              : method === "Split"
                ? processedTotal * 0.3
                : 0;
          const cardAdd =
            method === "NFC/Card" ? processedTotal : method === "Split" ? processedTotal * 0.3 : 0;
          return {
            ...term,
            cashDrawer: term.cashDrawer + cashAdd,
            bankTransfer: term.bankTransfer + transferAdd,
            cardNfc: term.cardNfc + cardAdd,
            totalSales: term.totalSales + processedTotal,
          };
        })
      );
    },
    []
  );

  const recordCashPointTerminalUpdate = useCallback(
    (
      update: Partial<Pick<TerminalAudit, "cashDrawer" | "bankTransfer" | "cardNfc" | "totalSales">>,
      terminalId = "term-4"
    ) => {
      setTerminalAudits((prev) =>
        prev.map((t) => {
          if (t.id !== terminalId) return t;
          return {
            ...t,
            cashDrawer: update.cashDrawer ?? t.cashDrawer,
            bankTransfer: update.bankTransfer ?? t.bankTransfer,
            cardNfc: update.cardNfc ?? t.cardNfc,
            totalSales: update.totalSales ?? t.totalSales,
          };
        })
      );
    },
    []
  );

  return {
    terminalAudits,
    setTerminalAudits,
    applyPaymentToTerminal,
    recordCashPointTerminalUpdate,
  };
}

export function useTransactions(initial: Transaction[]) {
  const [transactions, setTransactions] = useState<Transaction[]>(initial);
  const [totalRevenue, setTotalRevenue] = useState(1284092.45);

  const appendTransaction = useCallback((tx: Transaction, addRevenue = true) => {
    setTransactions((prev) => [tx, ...prev]);
    if (addRevenue) setTotalRevenue((prev) => prev + tx.amount);
  }, []);

  return { transactions, setTransactions, totalRevenue, setTotalRevenue, appendTransaction };
}
