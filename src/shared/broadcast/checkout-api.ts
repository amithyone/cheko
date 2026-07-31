import type { SessionStatus } from "./types";

const DEFAULT_BROADCAST_API = "https://check-outpay.com/api/v1/broadcast";

export function checkoutBroadcastApiBase(): string {
  return import.meta.env.VITE_CHECKOUT_BROADCAST_API ?? DEFAULT_BROADCAST_API;
}

export interface BroadcastSessionPollResult {
  sessionStatus: SessionStatus | "awaiting_scan";
  amountNgn: number;
  amountReceivedNgn: number;
  amountDueNgn: number;
  settlementMode: "permanent" | "temporary";
  awaitingPayment: boolean;
}

export async function pollBroadcastSession(
  sessionUuid: string,
  terminalId: string,
  apiKey: string
): Promise<BroadcastSessionPollResult | null> {
  const url = new URL(`${checkoutBroadcastApiBase()}/sessions/${sessionUuid}`);
  url.searchParams.set("terminal_id", terminalId);

  const res = await fetch(url.toString(), {
    headers: { "X-Terminal-Api-Key": apiKey },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as {
    session_status?: SessionStatus | "awaiting_scan";
    amount_ngn?: number;
    amount_received_ngn?: number;
    amount_due_ngn?: number;
    settlement_mode?: "permanent" | "temporary";
    awaiting_payment?: boolean;
  };

  return {
    sessionStatus: data.session_status ?? "awaiting_scan",
    amountNgn: data.amount_ngn ?? 0,
    amountReceivedNgn: data.amount_received_ngn ?? 0,
    amountDueNgn: data.amount_due_ngn ?? 0,
    settlementMode: data.settlement_mode ?? "permanent",
    awaitingPayment: Boolean(data.awaiting_payment),
  };
}

/** Push the POS Ed25519 seed to CheckoutPay so live verify accepts this machine's signatures. */
export async function syncBroadcastSigningKey(
  terminalId: string,
  signingKey: string,
  apiKey: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${checkoutBroadcastApiBase()}/terminals/sync-signing-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Terminal-Api-Key": apiKey,
    },
    body: JSON.stringify({ terminal_id: terminalId, signing_key: signingKey }),
    signal: AbortSignal.timeout(10000),
  });

  const data = (await res.json()) as { ok?: boolean; error?: string };
  if (!res.ok || !data.ok) {
    return { ok: false, error: data.error ?? `HTTP ${res.status}` };
  }

  return { ok: true };
}

export async function expectBroadcastPayment(
  sessionUuid: string,
  terminalId: string,
  apiKey: string
): Promise<boolean> {
  const res = await fetch(`${checkoutBroadcastApiBase()}/sessions/${sessionUuid}/expect-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Terminal-Api-Key": apiKey,
    },
    body: JSON.stringify({ terminal_id: terminalId }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    return false;
  }

  const data = (await res.json()) as { ok?: boolean };
  return Boolean(data.ok);
}
