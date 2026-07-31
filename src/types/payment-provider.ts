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

export type SignatureAlg = "HMAC-SHA256" | "ed25519";

/** Online: CheckoutNow fetches account from CheckoutPay. Offline: account saved on POS goes in BLE. */
export type BroadcastConnectivity = "online" | "offline";

export interface PaymentProviderCredentials {
  provider: PaymentProviderId;
  apiKey?: string;
  secretKey?: string;
  publicKey?: string;
  terminalId?: string;
  merchantId?: string;
  contractCode?: string;
  signingKey?: string;
  signatureAlg?: SignatureAlg;
  /** Online (default) or offline Pay at Shop */
  broadcastConnectivity?: BroadcastConnectivity;
  /** Offline mode only — settlement account stored on this POS */
  settlementAccountNumber?: string;
  settlementBankCode?: string;
  settlementAccountName?: string;
  merchantBankName?: string;
  /** CheckoutPay broadcast API base, e.g. https://check-outpay.com/api/v1/broadcast */
  checkoutBroadcastApi?: string;
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
      { key: "apiKey", label: "API key (session polling)", secret: true },
      { key: "terminalId", label: "Terminal ID", placeholder: "CP-1RK8Z" },
      { key: "merchantId", label: "Merchant ID (optional)" },
      { key: "signingKey", label: "Ed25519 signing key", secret: true },
      {
        key: "checkoutBroadcastApi",
        label: "Verify API base URL",
        placeholder: "https://check-outpay.com/api/v1/broadcast",
      },
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
