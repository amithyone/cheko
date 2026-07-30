import type { VirtualAccount } from "./payment-provider";
import type { CartItem } from "./pos";

export type PayMethod = "NFC/Card" | "Cash" | "Bank Transfer" | "Split";

export type ParkedPaymentPhase =
  | "select_method"
  | "nfc_await_api"
  | "transfer_await"
  | "split_transfer_1"
  | "split_transfer_2";

/** Payment handed off while waiting for gateway / CheckoutNow webhook */
export interface ParkedPayment {
  id: string;
  label: string;
  items: CartItem[];
  totalDue: number;
  method: PayMethod;
  phase: ParkedPaymentPhase;
  transferRef: string;
  nfcAuthRef: string;
  virtualAccount: VirtualAccount | null;
  broadcastSessionId: string | null;
  splitStepsDone: { cash: boolean; t1: boolean; t2: boolean };
  timestamp: string;
  status: "awaiting_webhook";
}

export type ParkedPaymentSnapshot = Omit<ParkedPayment, "id" | "timestamp" | "status">;
