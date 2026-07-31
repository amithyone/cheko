import type { SessionStatus } from "./types";
import type { PaymentProviderCredentials } from "@/types/payment-provider";

const DEFAULT_BROADCAST_API = "https://check-outpay.com/api/v1/broadcast";
const SIDECAR_BASE = import.meta.env.VITE_BROADCAST_SIDECAR_URL ?? "http://127.0.0.1:8765";

/** Normalize any legacy bankApiUrl to the CheckoutPay broadcast API base. */
export function resolveBroadcastApiBase(customBase?: string): string {
  const raw = (customBase ?? import.meta.env.VITE_CHECKOUT_BROADCAST_API ?? DEFAULT_BROADCAST_API)
    .trim()
    .replace(/\/+$/, "");

  if (raw.endsWith("/verify-broadcast")) {
    return raw.slice(0, -"/verify-broadcast".length);
  }
  if (raw.includes("/api/v1/broadcast")) {
    return raw.split("/verify-broadcast")[0]!.replace(/\/+$/, "");
  }
  if (/check-outpay\.com/i.test(raw)) {
    return DEFAULT_BROADCAST_API;
  }
  return raw || DEFAULT_BROADCAST_API;
}

export function checkoutBroadcastApiBase(): string {
  return resolveBroadcastApiBase();
}

export function broadcastVerifyUrl(customBase?: string): string {
  return `${resolveBroadcastApiBase(customBase)}/verify-broadcast`;
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
  apiKey: string,
  apiBase?: string
): Promise<{ ok: boolean; error?: string }> {
  const base = resolveBroadcastApiBase(apiBase);
  const res = await fetch(`${base}/terminals/sync-signing-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Terminal-Api-Key": apiKey,
    },
    body: JSON.stringify({ terminal_id: terminalId, signing_key: signingKey }),
    signal: AbortSignal.timeout(10000),
  });

  const text = await res.text();
  let data: { ok?: boolean; error?: string; message?: string } = {};
  try {
    data = JSON.parse(text) as typeof data;
  } catch {
    if (text.trim().startsWith("<!")) {
      return {
        ok: false,
        error: `HTTP ${res.status} — wrong URL (use ${base}/terminals/sync-signing-key)`,
      };
    }
    return { ok: false, error: text.slice(0, 200) || `HTTP ${res.status}` };
  }

  if (!res.ok || !data.ok) {
    return { ok: false, error: data.error ?? data.message ?? `HTTP ${res.status}` };
  }

  return { ok: true };
}

/** Full Pay at Shop test: sync POS key + live verify (via sidecar when available). */
export async function testCheckoutPayConnection(
  creds: PaymentProviderCredentials
): Promise<{ ok: boolean; message?: string }> {
  const terminalId = creds.terminalId?.trim() ?? "";
  const signingKey = creds.signingKey?.trim() ?? "";
  const apiKey = creds.apiKey?.trim() ?? "";
  const apiBase = resolveBroadcastApiBase(creds.checkoutBroadcastApi);

  if (!terminalId || !signingKey || !apiKey) {
    return { ok: false, message: "Terminal ID, signing key, and API key are required." };
  }

  try {
    const res = await fetch(`${SIDECAR_BASE}/credentials/test-checkoutpay`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        terminal_id: terminalId,
        signing_key: signingKey,
        api_key: apiKey,
        checkout_broadcast_api: apiBase,
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (res.ok) {
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (data.message) {
        return { ok: Boolean(data.ok), message: data.message };
      }
    }
  } catch {
    // Sidecar not running — sync + health below
  }

  const sync = await syncBroadcastSigningKey(terminalId, signingKey, apiKey, apiBase);
  if (!sync.ok) {
    return { ok: false, message: `Sync signing key failed: ${sync.error}` };
  }

  try {
    const healthRes = await fetch(`${apiBase}/health`, { signal: AbortSignal.timeout(8000) });
    const health = (await healthRes.json()) as { verify_profile?: string };
    if (!health.verify_profile) {
      return {
        ok: false,
        message: "Key synced but CheckoutPay is on old code. Deploy latest checkoutpay on production.",
      };
    }
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Key synced but could not reach CheckoutPay health.",
    };
  }

  return {
    ok: true,
    message:
      "Signing key synced to CheckoutPay. Start broadcast sidecar and test again for full live verify.",
  };
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
