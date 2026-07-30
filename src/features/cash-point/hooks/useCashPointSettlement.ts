import { useState, useCallback } from "react";
import { CASH_DISBURSEMENT_FEE_RATE } from "@/types";
import { roundMoney } from "@/shared/utils/money";

export { roundMoney };

export function calcFromPaymentReceived(paymentReceived: number) {
  const cashToGive = roundMoney(paymentReceived * (1 - CASH_DISBURSEMENT_FEE_RATE));
  const feeAmount = roundMoney(paymentReceived - cashToGive);
  return { paymentReceived, cashToGive, feeAmount };
}

const TRANSFER_SENDERS = [
  "Chidi Okonkwo",
  "Amaka Nwosu",
  "Ibrahim Musa",
  "Grace Adeyemi",
  "Tunde Bakare",
];
const CARD_BRANDS = ["Visa", "Mastercard", "Verve"] as const;

export function simulateIncomingTransfer() {
  const amounts = [25000, 50000, 75000, 100000, 150000, 200000, 350000, 500000];
  const amount = amounts[Math.floor(Math.random() * amounts.length)];
  const sender = TRANSFER_SENDERS[Math.floor(Math.random() * TRANSFER_SENDERS.length)];
  const senderAcct = String(Math.floor(1000000000 + Math.random() * 9000000000));
  const sessionId = `TRF-${Date.now().toString(36).toUpperCase()}`;
  return {
    amount,
    paymentRef: `${sender} · acct …${senderAcct.slice(-4)}`,
    sessionId,
  };
}

export function simulateCardIdentity() {
  const brand = CARD_BRANDS[Math.floor(Math.random() * CARD_BRANDS.length)];
  const last4 = String(Math.floor(1000 + Math.random() * 9000));
  const authCode = `AUTH${Math.floor(100000 + Math.random() * 900000)}`;
  return {
    paymentRef: `${brand} · ****${last4}`,
    authCode,
  };
}

export function useCashPointSettlement() {
  const [settledPayment, setSettledPayment] = useState(0);
  const [settledCash, setSettledCash] = useState(0);
  const [settledFee, setSettledFee] = useState(0);

  const applySettlement = useCallback((paymentReceived: number) => {
    const { cashToGive, feeAmount } = calcFromPaymentReceived(paymentReceived);
    setSettledPayment(paymentReceived);
    setSettledCash(cashToGive);
    setSettledFee(feeAmount);
    return { cashToGive, feeAmount };
  }, []);

  const resetSettlement = useCallback(() => {
    setSettledPayment(0);
    setSettledCash(0);
    setSettledFee(0);
  }, []);

  return {
    settledPayment,
    settledCash,
    settledFee,
    setSettledPayment,
    setSettledCash,
    setSettledFee,
    applySettlement,
    resetSettlement,
  };
}
