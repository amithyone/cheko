import type { ParkedPaymentPhase } from "@/types";

export type PayMethod = "NFC/Card" | "Cash" | "Bank Transfer" | "Split";

export type PaymentPhase =
  | "select_method"
  | "nfc_await_card"
  | "nfc_await_api"
  | "cash_amount"
  | "transfer_await"
  | "split_overview"
  | "split_cash_amount"
  | "split_transfer_1"
  | "split_transfer_2"
  | "success";

export function isParkablePaymentPhase(phase: PaymentPhase): phase is ParkedPaymentPhase {
  return (
    phase === "select_method" ||
    phase === "nfc_await_api" ||
    phase === "transfer_await" ||
    phase === "split_transfer_1" ||
    phase === "split_transfer_2"
  );
}

export const SPLIT_CASH_RATIO = 0.4;
export const SPLIT_TRANSFER_1_RATIO = 0.3;
export const SPLIT_TRANSFER_2_RATIO = 0.3;

export function splitAmounts(totalDue: number) {
  return {
    cash: totalDue * SPLIT_CASH_RATIO,
    transfer1: totalDue * SPLIT_TRANSFER_1_RATIO,
    transfer2: totalDue * SPLIT_TRANSFER_2_RATIO,
  };
}
