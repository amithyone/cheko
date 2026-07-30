/**
 * POS terminal payment API
 * Base path: /api/v1/terminal/payments/*
 */

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
  throw new Error("Not implemented — integrate payment gateway");
}

/** POST /api/v1/terminal/payments/transfer/confirm */
export async function confirmBankTransfer(
  _req: TransferConfirmRequest
): Promise<TransferConfirmResponse> {
  throw new Error("Not implemented — integrate bank webhook");
}

/** POST /api/v1/terminal/payments/split */
export async function submitSplitPayment(_payload: Record<string, unknown>): Promise<{ ok: boolean }> {
  throw new Error("Not implemented");
}

/** POST /api/v1/terminal/receipt/print */
export async function printReceipt(_transactionId: string): Promise<{ queued: boolean }> {
  throw new Error("Not implemented");
}
