export interface ReceiptLineItem {
  name: string;
  quantity: number;
  lineTotal: number;
}

export interface ReceiptPayload {
  storeName: string;
  terminalId: string;
  cashier?: string;
  transactionId: string;
  paymentMethod: string;
  paymentReference?: string;
  items: ReceiptLineItem[];
  subtotal: number;
  tax?: number;
  total: number;
  currencySymbol?: string;
}

export interface TerminalConfig {
  terminalId: string;
  printerName: string;
  scalePort: string;
  isDesktop: boolean;
}

export type PaymentProviderId =
  | "checkoutnow"
  | "mevonpay"
  | "paystack"
  | "moniepoint"
  | "squad";

export type SignatureAlg = "HMAC-SHA256" | "ed25519";

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
  broadcastConnectivity?: BroadcastConnectivity;
  settlementAccountNumber?: string;
  settlementBankCode?: string;
  settlementAccountName?: string;
  merchantBankName?: string;
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
