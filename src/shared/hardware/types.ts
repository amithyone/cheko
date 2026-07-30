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

export interface ChekoHardwareBridge {
  printReceipt(payload: ReceiptPayload): Promise<{ ok: boolean }>;
  openCashDrawer(): Promise<void>;
  getScaleWeight(): Promise<{ kg: number; stable: boolean }>;
  listPrinters(): Promise<string[]>;
  getConfig(): Promise<TerminalConfig>;
  saveConfig(partial: Partial<TerminalConfig>): Promise<TerminalConfig>;
  onScan(callback: (barcode: string) => void): () => void;
  testScan?(barcode: string): Promise<void>;
  getPaymentConfig?(): Promise<import("@/types/payment-provider").PaymentConfigSummary>;
  getPaymentCredentials?(): Promise<import("@/types/payment-provider").PaymentProviderCredentials | null>;
  savePaymentConfig?(
    creds: import("@/types/payment-provider").PaymentProviderCredentials
  ): Promise<import("@/types/payment-provider").PaymentConfigSummary>;
}
