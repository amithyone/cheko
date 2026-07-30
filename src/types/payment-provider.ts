export type PaymentProviderId =
  | "checkoutnow"
  | "mevonpay"
  | "paystack"
  | "moniepoint"
  | "squad";

export interface PaymentProviderCapabilities {
  virtualAccount: boolean;
  cardCharge: boolean;
  transferVerify: boolean;
  broadcastPay: boolean;
}

export interface PaymentProviderCredentials {
  provider: PaymentProviderId;
  apiKey?: string;
  secretKey?: string;
  publicKey?: string;
  terminalId?: string;
  merchantId?: string;
  contractCode?: string;
  signingKey?: string;
  webhookSecret?: string;
  testMode?: boolean;
}

export interface PaymentConfigSummary {
  configured: boolean;
  provider: PaymentProviderId;
  testMode: boolean;
  terminalId?: string;
  merchantId?: string;
}

export interface VirtualAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  reference: string;
  amount: number;
}

export interface ProviderFieldDef {
  key: keyof PaymentProviderCredentials;
  label: string;
  secret?: boolean;
  placeholder?: string;
}

export interface ProviderMeta {
  id: PaymentProviderId;
  label: string;
  description: string;
  fullStack: boolean;
  fields: ProviderFieldDef[];
}

export const PAYMENT_PROVIDERS: ProviderMeta[] = [
  {
    id: "checkoutnow",
    label: "CheckoutNow",
    description: "Full stack — card, virtual account, transfer verify, BLE broadcast",
    fullStack: true,
    fields: [
      { key: "apiKey", label: "API key", secret: true },
      { key: "terminalId", label: "Terminal ID" },
      { key: "merchantId", label: "Merchant ID" },
      { key: "signingKey", label: "Signing key (broadcast)", secret: true },
    ],
  },
  {
    id: "mevonpay",
    label: "MevonPay",
    description: "Card, virtual account, transfer verify",
    fullStack: false,
    fields: [
      { key: "apiKey", label: "API key", secret: true },
      { key: "terminalId", label: "Terminal ID" },
    ],
  },
  {
    id: "paystack",
    label: "Paystack",
    description: "Card and virtual account (webhook verify)",
    fullStack: false,
    fields: [
      { key: "secretKey", label: "Secret key", secret: true },
      { key: "publicKey", label: "Public key" },
    ],
  },
  {
    id: "moniepoint",
    label: "Moniepoint",
    description: "Virtual account and card",
    fullStack: false,
    fields: [
      { key: "apiKey", label: "API key", secret: true },
      { key: "merchantId", label: "Merchant ID" },
      { key: "contractCode", label: "Contract code" },
    ],
  },
  {
    id: "squad",
    label: "Squad",
    description: "Virtual account and card",
    fullStack: false,
    fields: [
      { key: "secretKey", label: "Secret key", secret: true },
      { key: "merchantId", label: "Merchant ID" },
    ],
  },
];
