import type { PaymentProviderCredentials } from "@/types/payment-provider";

export interface BroadcastCredentialCheck {
  ok: boolean;
  errors: string[];
}

const SDK_DEMO_SUFFIX = "***9876";
const DEMO_SIGNING_KEY = "demo-signing-key-min-16-chars";

/** CheckoutPay CP-* terminals require Ed25519 + settlement bank from merchant dashboard. */
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

  const bank = creds?.merchantBankName?.trim() ?? "";
  if (!bank || bank.toLowerCase() === "kuda") {
    errors.push("Settlement bank must match your CheckoutPay account (e.g. RUBIES MFB — not kuda).");
  }

  const suffix = creds?.maskedAccountSuffix?.trim() ?? "";
  if (!suffix || suffix === SDK_DEMO_SUFFIX) {
    errors.push("Masked account suffix must match settlement account (e.g. ***4863 — not ***9876).");
  } else if (!/^\*{3}[0-9]{4}$/.test(suffix)) {
    errors.push("Masked suffix format must be ***1234 (last 4 digits of settlement account).");
  }

  return { ok: errors.length === 0, errors };
}
