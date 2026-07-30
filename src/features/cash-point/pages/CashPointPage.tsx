import React, { useState } from "react";
import { Banknote, Wallet, CheckCircle2 } from "lucide-react";
import { TerminalAudit } from "@/types";
import {
  CashDisbursementRecord,
  CashPointReceiveAccount,
  pickRandomCashPointAccount,
  NIGERIAN_BANKS,
} from "@/types";
import { useNotice } from "@/context/NoticeContext";
import { formatCurrency } from "@/shared/utils/money";
import {
  calcFromPaymentReceived,
  simulateIncomingTransfer,
  simulateCardIdentity,
  useCashPointSettlement,
} from "@/features/cash-point/hooks/useCashPointSettlement";
import ServiceModeToggle, { ServiceMode } from "@/features/cash-point/components/ServiceModeToggle";
import TransactionHistoryPanel from "@/features/cash-point/components/TransactionHistoryPanel";
import DigitalToCashFlow, {
  PaymentMethod,
  DigitalPayPhase,
} from "@/features/cash-point/flows/DigitalToCashFlow";
import CashToBankFlow, { CashToBankPhase } from "@/features/cash-point/flows/CashToBankFlow";

interface CashPointViewProps {
  currencySymbol: string;
  terminalAudits: TerminalAudit[];
  setTerminalAudits: React.Dispatch<React.SetStateAction<TerminalAudit[]>>;
  transactionHistory: CashDisbursementRecord[];
  setTransactionHistory: React.Dispatch<React.SetStateAction<CashDisbursementRecord[]>>;
  onRecordTransaction?: (label: string, amount: number) => void;
}

type PayPhase = DigitalPayPhase | CashToBankPhase | "done";

export default function CashPointView({
  currencySymbol,
  terminalAudits,
  setTerminalAudits,
  transactionHistory,
  setTransactionHistory,
  onRecordTransaction,
}: CashPointViewProps) {
  const notice = useNotice();
  const activeTerminal = terminalAudits.find((t) => t.id === "term-4");
  const drawerBalance = activeTerminal?.cashDrawer ?? 0;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Bank Transfer");
  const [serviceMode, setServiceMode] = useState<ServiceMode>("digital_to_cash");
  const [chargeAmountInput, setChargeAmountInput] = useState("");
  const [phase, setPhase] = useState<PayPhase>("form");
  const [receiveAccount, setReceiveAccount] = useState<CashPointReceiveAccount>(pickRandomCashPointAccount);

  const [senderName, setSenderName] = useState("");
  const [cashCollectInput, setCashCollectInput] = useState("");
  const [destBank, setDestBank] = useState<string>(NIGERIAN_BANKS[0]);
  const [destAccountNo, setDestAccountNo] = useState("");
  const [destAccountName, setDestAccountName] = useState("");

  const [paymentRef, setPaymentRef] = useState("");
  const [apiSessionId, setApiSessionId] = useState("");
  const {
    settledPayment,
    settledCash,
    settledFee,
    applySettlement,
    resetSettlement,
  } = useCashPointSettlement();

  const chargeAmount = parseFloat(chargeAmountInput) || 0;
  const cashCollectAmount = parseFloat(cashCollectInput) || 0;
  const cardPreview = calcFromPaymentReceived(chargeAmount);
  const sendPreview = calcFromPaymentReceived(cashCollectAmount);
  const format = (n: number) => formatCurrency(n, currencySymbol);

  const refreshReceiveAccount = () => setReceiveAccount(pickRandomCashPointAccount());

  const resetForm = () => {
    setChargeAmountInput("");
    setSenderName("");
    setCashCollectInput("");
    setDestAccountNo("");
    setDestAccountName("");
    setDestBank(NIGERIAN_BANKS[0]);
    setPaymentRef("");
    setApiSessionId("");
    resetSettlement();
    refreshReceiveAccount();
    setPhase("form");
  };

  const switchServiceMode = (mode: ServiceMode) => {
    setServiceMode(mode);
    setPhase("form");
    setChargeAmountInput("");
    setSenderName("");
    setCashCollectInput("");
    setDestAccountNo("");
    setDestAccountName("");
  };

  const startFlow = () => {
    if (paymentMethod === "Bank Transfer") {
      refreshReceiveAccount();
      setPhase("transfer_await_api");
      return;
    }

    if (chargeAmount <= 0) {
      notice.showWarning("Enter the amount to debit from card/NFC.", "Invalid amount");
      return;
    }
    if (cardPreview.cashToGive > drawerBalance) {
      notice.showWarning(
        `Drawer only has ${format(drawerBalance)}. Cannot tender ${format(cardPreview.cashToGive)} after fee.`,
        "Insufficient drawer"
      );
      return;
    }
    setPhase("card_await_tap");
  };

  const startCashSend = () => {
    if (!senderName.trim()) {
      notice.showWarning("Sender name is required.", "Missing sender");
      return;
    }
    if (cashCollectAmount <= 0) {
      notice.showWarning("Enter the cash amount to collect.", "Invalid amount");
      return;
    }
    if (!destAccountNo.trim() || destAccountNo.trim().length < 10) {
      notice.showWarning("Enter a valid 10-digit Nigerian account number.", "Invalid account");
      return;
    }
    if (!destAccountName.trim()) {
      notice.showWarning("Enter the recipient account name.", "Missing beneficiary");
      return;
    }
    notice.showToast("Cash drawer opened — collect notes", "info");
    setPhase("send_collect");
  };

  const confirmCashCollected = () => {
    applySettlement(cashCollectAmount);
    const acctLast4 = destAccountNo.trim().slice(-4);
    setPaymentRef(`${senderName.trim()} → ${destBank} · …${acctLast4}`);
    setApiSessionId(`OUT-${Date.now().toString(36).toUpperCase()}`);
    setPhase("send_processing");
  };

  const completeCashSend = () => {
    setTerminalAudits((prev) =>
      prev.map((t) => {
        if (t.id !== "term-4") return t;
        return {
          ...t,
          cashDrawer: t.cashDrawer + cashCollectAmount,
          bankTransfer: t.bankTransfer + settledCash,
          totalSales: t.totalSales + cashCollectAmount,
        };
      })
    );

    const record: CashDisbursementRecord = {
      id: `CS-${Date.now()}`,
      paymentRef: paymentRef,
      cashDisbursed: 0,
      cashCollected: cashCollectAmount,
      paymentReceived: settledCash,
      feeAmount: settledFee,
      method: "Cash Send",
      senderName: senderName.trim(),
      destinationBank: destBank,
      destinationAccount: destAccountNo.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setTransactionHistory((h) => [record, ...h]);
    onRecordTransaction?.(`Cash send: ${senderName.trim()} → ${destBank}`, cashCollectAmount);

    notice.showToast("Cash drawer closed", "info");
    notice.showSuccess(
      `Collected ${format(cashCollectAmount)} from ${senderName.trim()}. Sent ${format(settledCash)} to ${destBank}.`,
      "Transfer sent"
    );
    setPhase("done");
    setTimeout(resetForm, 2500);
  };

  const handleCardTapped = () => setPhase("card_await_api");

  const handleCardChargeConfirmed = () => {
    const card = simulateCardIdentity();
    setPaymentRef(card.paymentRef);
    setApiSessionId(card.authCode);
    notice.showToast(`${card.paymentRef} · ${card.authCode}`, "success");
    applySettlement(chargeAmount);
    notice.showToast("Cash drawer opened", "info");
    setPhase("disburse");
  };

  const handleTransferDetected = () => {
    const transfer = simulateIncomingTransfer();
    const { cashToGive } = applySettlement(transfer.amount);

    setPaymentRef(transfer.paymentRef);
    setApiSessionId(transfer.sessionId);
    notice.showToast(`Transfer ${format(transfer.amount)} · ${transfer.paymentRef}`, "success");

    if (cashToGive > drawerBalance) {
      notice.showWarning(
        `Transfer received but drawer only has ${format(drawerBalance)}. Restock before paying out ${format(cashToGive)}.`,
        "Insufficient drawer"
      );
      return;
    }

    setPhase("transfer_detected");
  };

  const confirmTransferPayout = () => {
    notice.showSuccess(
      `Transfer ${format(settledPayment)} from ${paymentRef}. Tender ${format(settledCash)} from drawer.`,
      "Transfer credited"
    );
    notice.showToast("Cash drawer opened", "info");
    setPhase("disburse");
  };

  const completeDisbursement = () => {
    setTerminalAudits((prev) =>
      prev.map((t) => {
        if (t.id !== "term-4") return t;
        const cardAdd = paymentMethod === "NFC/Card" ? settledPayment : 0;
        const transferAdd = paymentMethod === "Bank Transfer" ? settledPayment : 0;
        return {
          ...t,
          cashDrawer: Math.max(0, t.cashDrawer - settledCash),
          cardNfc: t.cardNfc + cardAdd,
          bankTransfer: t.bankTransfer + transferAdd,
          totalSales: t.totalSales + settledPayment,
        };
      })
    );

    const record: CashDisbursementRecord = {
      id: `CD-${Date.now()}`,
      paymentRef,
      cashDisbursed: settledCash,
      paymentReceived: settledPayment,
      feeAmount: settledFee,
      method: paymentMethod,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setTransactionHistory((h) => [record, ...h]);
    onRecordTransaction?.(`Cash point: ${paymentRef}`, settledPayment);

    notice.showToast("Cash drawer closed", "info");
    notice.showSuccess(
      `Paid out ${format(settledCash)} · ${paymentRef}. Fee: ${format(settledFee)}.`,
      "Disbursement complete"
    );

    setPhase("done");
    setTimeout(resetForm, 2500);
  };

  const isDigitalPhase = (p: PayPhase): p is DigitalPayPhase =>
    p === "form" ||
    p === "card_await_tap" ||
    p === "card_await_api" ||
    p === "transfer_await_api" ||
    p === "transfer_detected" ||
    p === "disburse";

  const isCashToBankPhase = (p: PayPhase): p is CashToBankPhase =>
    p === "form" || p === "send_collect" || p === "send_processing";

  return (
    <div className="space-y-6 w-full font-sans">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <Banknote className="absolute right-6 top-6 w-24 h-24 opacity-15" />
        <span className="px-3 py-1 bg-white/15 rounded-full text-[10px] font-bold uppercase tracking-widest">
          Cash point · Walk-in service
        </span>
        <h2 className="font-display font-extrabold text-3xl mt-3 mb-1">Cash collection & payout</h2>
        <p className="text-sm text-white/85 max-w-2xl">
          Pay out cash when customers pay digitally, or collect cash and send to any Nigerian bank account.
        </p>
      </div>

      <ServiceModeToggle serviceMode={serviceMode} onSwitch={switchServiceMode} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)] xl:grid-cols-[minmax(0,1fr)_24rem] gap-4 lg:gap-5">
        <div className="min-w-0 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          {phase === "done" && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
              <p className="font-bold text-slate-800">Transaction recorded</p>
            </div>
          )}

          {phase !== "done" && serviceMode === "digital_to_cash" && isDigitalPhase(phase) && (
            <DigitalToCashFlow
              phase={phase}
              currencySymbol={currencySymbol}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              chargeAmountInput={chargeAmountInput}
              setChargeAmountInput={setChargeAmountInput}
              chargeAmount={chargeAmount}
              cardPreview={cardPreview}
              drawerBalance={drawerBalance}
              receiveAccount={receiveAccount}
              refreshReceiveAccount={refreshReceiveAccount}
              paymentRef={paymentRef}
              apiSessionId={apiSessionId}
              settledPayment={settledPayment}
              settledCash={settledCash}
              settledFee={settledFee}
              onStartFlow={startFlow}
              onCardTapped={handleCardTapped}
              onCardChargeConfirmed={handleCardChargeConfirmed}
              onTransferDetected={handleTransferDetected}
              onConfirmTransferPayout={confirmTransferPayout}
              onCompleteDisbursement={completeDisbursement}
              onBackToForm={() => setPhase("form")}
              onBackToTransferListen={() => setPhase("transfer_await_api")}
            />
          )}

          {phase !== "done" && serviceMode === "cash_to_bank" && isCashToBankPhase(phase) && (
            <CashToBankFlow
              phase={phase}
              currencySymbol={currencySymbol}
              senderName={senderName}
              setSenderName={setSenderName}
              cashCollectInput={cashCollectInput}
              setCashCollectInput={setCashCollectInput}
              cashCollectAmount={cashCollectAmount}
              sendPreview={sendPreview}
              destBank={destBank}
              setDestBank={setDestBank}
              destAccountNo={destAccountNo}
              setDestAccountNo={setDestAccountNo}
              destAccountName={destAccountName}
              setDestAccountName={setDestAccountName}
              onStartCashSend={startCashSend}
              onConfirmCashCollected={confirmCashCollected}
              onCompleteCashSend={completeCashSend}
              onBackToForm={() => setPhase("form")}
              onBackToCollect={() => setPhase("send_collect")}
            />
          )}
        </div>

        <div className="min-w-0 space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-5 h-5 text-amber-600" />
              <h4 className="text-xs font-bold uppercase text-slate-500">Drawer balance</h4>
            </div>
            <p className="font-display text-3xl font-black text-slate-900">{format(drawerBalance)}</p>
            <p className="text-[10px] text-slate-400 mt-2">Terminal 04 · live float</p>
          </div>

          <TransactionHistoryPanel
            transactionHistory={transactionHistory}
            currencySymbol={currencySymbol}
          />
        </div>
      </div>
    </div>
  );
}
