/**
 * POS terminal payment API
 * Base path: /api/v1/terminal/payments/*
 */

import { hardwareBridge } from "@/shared/hardware/bridge";
import type { ReceiptPayload } from "@/shared/hardware/types";

export interface ChargeCardRequest {
  terminalId: string;
  amount: number;
  reference: string;
}

export interface ChargeCardResponse {
  approved: boolean;
  authCode: string;
  cardMask: string;
  brand: string;
}

export interface TransferConfirmRequest {
  terminalId: string;
  amount: number;
  reference: string;
}

export interface TransferConfirmResponse {
  credited: boolean;
  sessionId: string;
}

/** POST /api/v1/terminal/payments/nfc-charge */
export async function chargeCard(_req: ChargeCardRequest): Promise<ChargeCardResponse> {
  throw new Error("Use payment adapter via usePaymentProvider().adapter.chargeCard()");
}

/** POST /api/v1/terminal/payments/transfer/confirm */
export async function confirmBankTransfer(
  _req: TransferConfirmRequest
): Promise<TransferConfirmResponse> {
  throw new Error("Use payment adapter via usePaymentProvider().adapter.verifyTransfer()");
}

/** POST /api/v1/terminal/payments/split */
export async function submitSplitPayment(_payload: Record<string, unknown>): Promise<{ ok: boolean }> {
  throw new Error("Not implemented");
}

/** POST /api/v1/terminal/receipt/print — desktop uses hardware bridge */
export async function printReceipt(payload: ReceiptPayload): Promise<{ queued: boolean }> {
  const result = await hardwareBridge.printReceipt(payload);
  return { queued: result.ok };
}

export function buildReceiptPayload(
  cart: { product: { name: string; price: number }; quantity: number }[],
  totalDue: number,
  paymentMethod: string,
  currencySymbol: string,
  paymentReference?: string,
  terminalId = "TERMINAL_04"
): ReceiptPayload {
  const items = cart.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    lineTotal: item.product.price * item.quantity,
  }));
  return {
    storeName: "Cheko POS",
    terminalId,
    transactionId: `TX-${Date.now().toString().slice(-8)}`,
    paymentMethod,
    paymentReference,
    items,
    subtotal: totalDue,
    total: totalDue,
    currencySymbol,
  };
}
