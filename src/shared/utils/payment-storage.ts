const STORAGE_KEY = "cheko_payment_config";

import type { PaymentProviderCredentials } from "@/types/payment-provider";

export function loadWebPaymentCredentials(): PaymentProviderCredentials | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PaymentProviderCredentials) : null;
  } catch {
    return null;
  }
}

export function saveWebPaymentCredentials(creds: PaymentProviderCredentials): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
}
