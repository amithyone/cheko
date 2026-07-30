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
  /** Settlement bank slug for SDK bank_name_hash (e.g. kuda, opay) */
  merchantBankName?: string;
  /** Public BLE mask e.g. ***9876 — must match terminal registry */
  maskedAccountSuffix?: string;
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
