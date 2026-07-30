import type { PaymentProviderCapabilities, PaymentProviderId } from "@/types/payment-provider";

export const PROVIDER_CAPABILITIES: Record<PaymentProviderId, PaymentProviderCapabilities> = {
  checkoutnow: {
    virtualAccount: true,
    cardCharge: true,
    transferVerify: true,
    broadcastPay: true,
  },
  mevonpay: {
    virtualAccount: true,
    cardCharge: true,
    transferVerify: true,
    broadcastPay: false,
  },
  paystack: {
    virtualAccount: true,
    cardCharge: true,
    transferVerify: false,
    broadcastPay: false,
  },
  moniepoint: {
    virtualAccount: true,
    cardCharge: true,
    transferVerify: false,
    broadcastPay: false,
  },
  squad: {
    virtualAccount: true,
    cardCharge: true,
    transferVerify: false,
    broadcastPay: false,
  },
};

export function getCapabilities(provider: PaymentProviderId): PaymentProviderCapabilities {
  return PROVIDER_CAPABILITIES[provider];
}

export class ProviderCapabilityError extends Error {
  constructor(
    public capability: keyof PaymentProviderCapabilities,
    public provider: PaymentProviderId
  ) {
    super(`Provider "${provider}" does not support ${capability}. Use CheckoutNow for full coverage.`);
    this.name = "ProviderCapabilityError";
  }
}
