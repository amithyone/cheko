/**
 * Cash point API
 * Base path: /api/v1/cash-point/*
 */

export interface IncomingTransferEvent {
  amount: number;
  senderName: string;
  senderAccount: string;
  sessionId: string;
}

export interface OutboundTransferRequest {
  senderName: string;
  amountCollected: number;
  destinationBank: string;
  destinationAccount: string;
  destinationAccountName: string;
}

export interface OutboundTransferResponse {
  sessionId: string;
  amountSent: number;
  feeAmount: number;
}

/** WebSocket or GET /api/v1/cash-point/transfers/incoming */
export async function listenIncomingTransfer(): Promise<IncomingTransferEvent> {
  throw new Error("Not implemented — subscribe to bank credit webhooks");
}

/** POST /api/v1/cash-point/payments/card-charge */
export async function cashPointChargeCard(_amount: number, _reference: string): Promise<{ approved: boolean }> {
  throw new Error("Not implemented");
}

/** POST /api/v1/cash-point/transfers/outbound */
export async function sendOutboundTransfer(
  _req: OutboundTransferRequest
): Promise<OutboundTransferResponse> {
  throw new Error("Not implemented — NIP/outbound transfer provider");
}
