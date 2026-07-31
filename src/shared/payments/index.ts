import type {
  PaymentProviderCapabilities,
  PaymentProviderCredentials,
  PaymentProviderId,
  VirtualAccount,
} from "@/types/payment-provider";
import type { ChargeCardRequest, ChargeCardResponse } from "@/features/pos/terminal/api";
import { validateCheckoutNowBroadcastCredentials } from "@/shared/broadcast/credentials";
import {
  checkoutBroadcastApiBase,
  expectBroadcastPayment,
  pollBroadcastSession,
  testCheckoutPayConnection,
} from "@/shared/broadcast/checkout-api";
import { roundMoney } from "@/shared/utils/money";

export interface PaymentAdapter {
  id: PaymentProviderId;
  capabilities: PaymentProviderCapabilities;
  verifyCredentials(): Promise<{ ok: boolean; message?: string }>;
  createVirtualAccount(amount: number, ref: string, customerName?: string): Promise<VirtualAccount>;
  chargeCard(req: ChargeCardRequest): Promise<ChargeCardResponse>;
  verifyTransfer(
    ref: string,
    amount: number,
    opts?: { broadcastSessionId?: string | null }
  ): Promise<{ credited: boolean; sessionId?: string; partial?: boolean }>;
}

export type AdapterFactory = (creds: PaymentProviderCredentials | null) => PaymentAdapter;

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function mockAccount(ref: string, amount: number, customerName?: string): VirtualAccount {
  const banks = ["GTBank", "Access Bank", "Zenith Bank", "UBA", "First Bank"] as const;
  const bank = banks[Math.floor(Math.random() * banks.length)];
  const acct = String(Math.floor(1000000000 + Math.random() * 8999999999));
  return {
    bankName: bank,
    accountNumber: acct,
    accountName: customerName ? `cheko: ${customerName}` : "Cheko Retail Store",
    reference: ref,
    amount,
  };
}

function baseAdapter(
  id: PaymentProviderId,
  capabilities: PaymentProviderCapabilities,
  creds: PaymentProviderCredentials | null
): PaymentAdapter {
  return {
    id,
    capabilities,
    async verifyCredentials() {
      if (!creds) return { ok: false, message: "No credentials saved" };
      const hasKey = Boolean(creds.apiKey || creds.secretKey || creds.publicKey);
      await delay(400);
      return hasKey
        ? { ok: true, message: `${id} credentials validated (demo mode)` }
        : { ok: false, message: "Missing API keys" };
    },
    async createVirtualAccount(amount, ref, customerName) {
      await delay(600);
      return mockAccount(ref, amount, customerName);
    },
    async chargeCard(req) {
      await delay(900);
      return {
        approved: true,
        authCode: `${id.toUpperCase().slice(0, 3)}-${Math.floor(Math.random() * 900000 + 100000)}`,
        cardMask: "****4242",
        brand: "Verve",
      };
    },
    async verifyTransfer(ref, amount, opts) {
      await delay(700);
      void amount;
      void opts;
      return { credited: true, sessionId: ref };
    },
  };
}

function limitedAdapter(
  id: PaymentProviderId,
  capabilities: PaymentProviderCapabilities,
  creds: PaymentProviderCredentials | null
): PaymentAdapter {
  const base = baseAdapter(id, capabilities, creds);
  return {
    ...base,
    async verifyTransfer(ref, amount, opts) {
      if (!capabilities.transferVerify) {
        await delay(500);
        return { credited: true, sessionId: ref };
      }
      return base.verifyTransfer(ref, amount, opts);
    },
  };
}

export function createCheckoutNowAdapter(creds: PaymentProviderCredentials | null): PaymentAdapter {
  const base = baseAdapter("checkoutnow", {
    virtualAccount: true,
    cardCharge: true,
    transferVerify: true,
    broadcastPay: true,
  }, creds);
  return {
    ...base,
    async verifyCredentials() {
      const broadcast = validateCheckoutNowBroadcastCredentials(creds);
      if (!broadcast.ok) {
        return { ok: false, message: broadcast.errors.join(" ") };
      }
      if (!creds) {
        return { ok: false, message: "No credentials saved" };
      }
      return testCheckoutPayConnection(creds);
    },
    async verifyTransfer(_ref, amount, opts) {
      const sessionId = opts?.broadcastSessionId?.trim();
      const terminalId = creds?.terminalId?.trim();
      const apiKey = creds?.apiKey?.trim();
      if (!sessionId || !terminalId || !apiKey) {
        return { credited: false };
      }

      const poll = await pollBroadcastSession(sessionId, terminalId, apiKey);
      if (!poll) {
        return { credited: false, sessionId };
      }

      if (poll.sessionStatus === "paid") {
        return { credited: true, sessionId };
      }

      if (poll.sessionStatus === "partial") {
        return { credited: false, sessionId, partial: true };
      }

      const expectedKobo = Math.round(roundMoney(amount) * 100);
      if (poll.amountNgn > 0 && expectedKobo > 0 && poll.amountNgn !== expectedKobo) {
        return { credited: false, sessionId };
      }

      return { credited: false, sessionId };
    },
  };
}

export function createMevonPayAdapter(creds: PaymentProviderCredentials | null): PaymentAdapter {
  return limitedAdapter("mevonpay", {
    virtualAccount: true,
    cardCharge: true,
    transferVerify: true,
    broadcastPay: false,
  }, creds);
}

export function createPaystackAdapter(creds: PaymentProviderCredentials | null): PaymentAdapter {
  return limitedAdapter("paystack", {
    virtualAccount: true,
    cardCharge: true,
    transferVerify: false,
    broadcastPay: false,
  }, creds);
}

export function createMoniepointAdapter(creds: PaymentProviderCredentials | null): PaymentAdapter {
  return limitedAdapter("moniepoint", {
    virtualAccount: true,
    cardCharge: true,
    transferVerify: false,
    broadcastPay: false,
  }, creds);
}

export function createSquadAdapter(creds: PaymentProviderCredentials | null): PaymentAdapter {
  return limitedAdapter("squad", {
    virtualAccount: true,
    cardCharge: true,
    transferVerify: false,
    broadcastPay: false,
  }, creds);
}

const factories: Record<PaymentProviderId, AdapterFactory> = {
  checkoutnow: createCheckoutNowAdapter,
  mevonpay: createMevonPayAdapter,
  paystack: createPaystackAdapter,
  moniepoint: createMoniepointAdapter,
  squad: createSquadAdapter,
};

export function resolveAdapter(
  provider: PaymentProviderId,
  creds: PaymentProviderCredentials | null
): PaymentAdapter {
  return factories[provider](creds);
}
