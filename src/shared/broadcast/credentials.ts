import type { PaymentProviderCredentials } from "@/types/payment-provider";

export interface BroadcastCredentialCheck {
  ok: boolean;
  errors: string[];
}

const DEMO_SIGNING_KEY = "demo-signing-key-min-16-chars";

/**
 * Online Pay at Shop: POS broadcasts terminal_id + amount only.
 * CheckoutNow loads settlement account from CheckoutPay using terminal_id.
 *
 * Offline: POS also stores settlement account locally and includes it in BLE.
 */
export function validateCheckoutNowBroadcastCredentials(
  creds: PaymentProviderCredentials | null | undefined
): BroadcastCredentialCheck {
  const errors: string[] = [];

  if (!creds?.terminalId?.trim()) {
    errors.push("Terminal ID is required (e.g. CP-1RK8Z from Pay at shop dashboard).");
  }

  const signingKey = creds?.signingKey?.trim() ?? "";
  if (!signingKey || signingKey === DEMO_SIGNING_KEY) {
    errors.push("Ed25519 signing key is required — copy from CheckoutPay Pay at shop (shown once).");
  }

  const alg = (creds?.signatureAlg ?? "ed25519").toUpperCase();
  if (alg === "HMAC-SHA256") {
    errors.push("Signature algorithm must be ed25519 (not HMAC-SHA256).");
  }

  const connectivity = creds?.broadcastConnectivity ?? "online";
  if (connectivity === "offline") {
    if (!creds?.settlementAccountNumber?.trim()) {
      errors.push("Offline mode: save your settlement account number on this POS.");
    }
    if (!creds?.settlementBankCode?.trim()) {
      errors.push("Offline mode: save NIP bank code (e.g. 090175 for Rubies).");
    }
  }

  return { ok: errors.length === 0, errors };
}
