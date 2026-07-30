export const CASH_DISBURSEMENT_FEE_RATE = 0.05;

export interface CashPointReceiveAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

const CASH_POINT_BANKS = ["Metroven Ltd", "Checkout Now Ltd"] as const;
const CASH_POINT_ACCOUNT_NAMES = ["Cheko Retail Store", "Cheko Ltd"] as const;

const CASH_POINT_ACCOUNT_NUMBERS: Record<(typeof CASH_POINT_BANKS)[number], string> = {
  "Metroven Ltd": "9023812902",
  "Checkout Now Ltd": "5070238190",
};

export function pickRandomCashPointAccount(): CashPointReceiveAccount {
  const bankName = CASH_POINT_BANKS[Math.floor(Math.random() * CASH_POINT_BANKS.length)];
  const accountName =
    CASH_POINT_ACCOUNT_NAMES[Math.floor(Math.random() * CASH_POINT_ACCOUNT_NAMES.length)];
  return {
    bankName,
    accountName,
    accountNumber: CASH_POINT_ACCOUNT_NUMBERS[bankName],
  };
}

export const NIGERIAN_BANKS = [
  "Access Bank",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank",
  "Globus Bank",
  "Guaranty Trust Bank",
  "Heritage Bank",
  "Keystone Bank",
  "Kuda Bank",
  "Moniepoint",
  "Opay",
  "Palmpay",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "Suntrust Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
] as const;

export type CashPointTxnMethod = "Bank Transfer" | "NFC/Card" | "Cash Send";

export interface CashDisbursementRecord {
  id: string;
  paymentRef: string;
  cashDisbursed: number;
  cashCollected?: number;
  paymentReceived: number;
  feeAmount: number;
  method: CashPointTxnMethod;
  senderName?: string;
  destinationBank?: string;
  destinationAccount?: string;
  timestamp: string;
}

export type ServiceMode = "digital_to_cash" | "cash_to_bank";

export type CashPointPayPhase =
  | "form"
  | "card_await_tap"
  | "card_await_api"
  | "transfer_await_api"
  | "transfer_detected"
  | "disburse"
  | "send_collect"
  | "send_processing"
  | "done";
