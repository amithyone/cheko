import type { PaymentProviderCredentials } from "@/types/payment-provider";

export interface BroadcastCredentialCheck {
  ok: boolean;
  errors: string[];
}

const DEMO_SIGNING_KEY = "demo-signing-key-min-16-chars";

/**
 * CheckoutPay Pay at Shop — POS only needs terminal ID + Ed25519 signing key.
 * Bank name and account come from the server after verify (not from BLE).
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
    errors.push("Signature algorithm must be ed25519 for CheckoutPay terminals (not HMAC-SHA256).");
  }

  return { ok: errors.length === 0, errors };
}
