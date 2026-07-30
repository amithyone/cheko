import { useState, useEffect, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wifi,
  Banknote,
  Landmark,
  Split,
  Lock,
  Printer,
  CheckCircle,
  Loader2,
  Sparkles,
  CreditCard,
  Radio,
  Wallet,
  ChevronRight,
  X,
} from "lucide-react";
import { CartItem } from "@/types";
import { useNotice } from "@/context/NoticeContext";
import {
  usePaymentProvider,
  providerSupportsMethod,
} from "@/context/PaymentProviderContext";
import { hardwareBridge } from "@/shared/hardware/bridge";
import { buildReceiptPayload, printReceipt } from "./api";
import type { VirtualAccount } from "@/types/payment-provider";
import {
  type PayMethod,
  type PaymentPhase,
  SPLIT_CASH_RATIO,
  SPLIT_TRANSFER_1_RATIO,
  SPLIT_TRANSFER_2_RATIO,
} from "./hooks/usePaymentFlow";

interface TerminalPayModalProps {
  totalDue: number;
  cart: CartItem[];
  onCancel: () => void;
  onSuccess: (method: string, processedTotal: number) => void;
  currencySymbol?: string;
}

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export default function TerminalPayModal({
  totalDue,
  cart,
  onCancel,
  onSuccess,
  currencySymbol = "₦",
}: TerminalPayModalProps) {
  const notice = useNotice();
  const { adapter, capabilities, summary } = usePaymentProvider();
  const [phase, setPhase] = useState<PaymentPhase>("select_method");
  const [selectedMethod, setSelectedMethod] = useState<PayMethod | null>(null);
  const [printStatus, setPrintStatus] = useState<"none" | "printing" | "printed">("none");
  const [apiPulse, setApiPulse] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccount | null>(null);
  const [processing, setProcessing] = useState(false);

  const [cashReceivedInput, setCashReceivedInput] = useState("");
  const [splitCashReceivedInput, setSplitCashReceivedInput] = useState("");
  const [transferRef] = useState(
    () => `TRF-${Math.floor(Math.random() * 900000) + 100000}`
  );
  const [nfcAuthRef] = useState(
    () => `NFC-${Math.floor(Math.random() * 900000) + 100000}`
  );

  const [splitStepsDone, setSplitStepsDone] = useState({ cash: false, t1: false, t2: false });

  const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const splitCashDue = roundMoney(totalDue * SPLIT_CASH_RATIO);
  const splitTransfer1Due = roundMoney(totalDue * SPLIT_TRANSFER_1_RATIO);
  const splitTransfer2Due = roundMoney(totalDue * SPLIT_TRANSFER_2_RATIO);

  const formatMoney = (n: number) =>
    `${currencySymbol}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const finishSuccess = useCallback(async () => {
    if (selectedMethod && printStatus === "none") {
      setPrintStatus("printing");
      try {
        const payload = buildReceiptPayload(
          cart,
          totalDue,
          selectedMethod,
          currencySymbol,
          transferRef,
          summary.terminalId ?? "TERMINAL_04"
        );
        await printReceipt(payload);
        setPrintStatus("printed");
      } catch {
        setPrintStatus("printed");
      }
    }
    setPhase("success");
  }, [selectedMethod, printStatus, cart, totalDue, currencySymbol, transferRef, summary.terminalId]);

  const completeAndReturn = useCallback(() => {
    if (selectedMethod) {
      onSuccess(selectedMethod, totalDue);
    }
  }, [onSuccess, selectedMethod, totalDue]);

  const handleSendToPosPrinter = async () => {
    if (printStatus === "printing") return;
    setPrintStatus("printing");
    try {
      const payload = buildReceiptPayload(
        cart,
        totalDue,
        selectedMethod ?? "Receipt",
        currencySymbol,
        transferRef,
        summary.terminalId ?? "TERMINAL_04"
      );
      await printReceipt(payload);
      setPrintStatus("printed");
      notice.showToast("Receipt sent to POS thermal printer", "success");
    } catch {
      setPrintStatus("printed");
      notice.showToast("Receipt queued (stub)", "info");
    }
  };

  useEffect(() => {
    if (phase !== "success") return;
    const t = setTimeout(() => {
      completeAndReturn();
    }, 3500);
    return () => clearTimeout(t);
  }, [phase, completeAndReturn]);

  const openCashDrawer = async () => {
    await hardwareBridge.openCashDrawer();
    notice.showToast("Cash drawer opened", "info");
  };

  const closeCashDrawer = () => {
    notice.showToast("Cash drawer closed", "info");
  };

  const startMethod = async (method: PayMethod) => {
    if (!providerSupportsMethod(capabilities, method)) {
      notice.showWarning(
        `${summary.provider} does not support this method. Switch to CheckoutNow in Settings for full coverage.`,
        "Payment method unavailable"
      );
      return;
    }

    setSelectedMethod(method);
    setCashReceivedInput("");
    setSplitCashReceivedInput("");
    setSplitStepsDone({ cash: false, t1: false, t2: false });
    setVirtualAccount(null);

    switch (method) {
      case "NFC/Card":
        setPhase("nfc_await_card");
        break;
      case "Cash":
        void openCashDrawer();
        setPhase("cash_amount");
        break;
      case "Bank Transfer":
        setProcessing(true);
        try {
          const va = await adapter.createVirtualAccount(totalDue, transferRef);
          setVirtualAccount(va);
        } finally {
          setProcessing(false);
        }
        setPhase("transfer_await");
        break;
      case "Split":
        setPhase("split_overview");
        break;
    }
  };

  const simulateApiNotification = (label: string) => {
    setApiPulse(true);
    setTimeout(() => {
      setApiPulse(false);
      notice.showToast(`${label} confirmed via API`, "success");
    }, 600);
  };

  const handleCardTapped = () => {
    setPhase("nfc_await_api");
  };

  const handleNfcApiConfirmed = async () => {
    setProcessing(true);
    try {
      const res = await adapter.chargeCard({
        terminalId: summary.terminalId ?? "TERMINAL_04",
        amount: totalDue,
        reference: nfcAuthRef,
      });
      if (res.approved) {
        simulateApiNotification("Card transaction");
        setTimeout(() => void finishSuccess(), 800);
      } else {
        notice.showWarning("Card declined", "Payment failed");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleCashAmountConfirm = () => {
    const received = parseFloat(cashReceivedInput) || 0;
    if (received < totalDue) {
      notice.showWarning(
        `Customer must pay at least ${formatMoney(totalDue)}. Received: ${formatMoney(received)}.`,
        "Insufficient cash"
      );
      return;
    }
    closeCashDrawer();
    void finishSuccess();
  };

  const handleTransferApiConfirmed = async () => {
    setProcessing(true);
    try {
      const res = await adapter.verifyTransfer(transferRef, totalDue);
      if (res.credited) {
        simulateApiNotification("Bank transfer");
        setTimeout(() => void finishSuccess(), 800);
      }
    } finally {
      setProcessing(false);
    }
  };

  const startSplitFlow = () => {
    void openCashDrawer();
    setPhase("split_cash_amount");
  };

  const handleSplitCashConfirm = () => {
    const received = parseFloat(splitCashReceivedInput) || 0;
    if (received < splitCashDue) {
      notice.showWarning(
        `Cash portion is ${formatMoney(splitCashDue)}. Enter at least that amount received.`,
        "Insufficient cash"
      );
      return;
    }
    closeCashDrawer();
    setSplitStepsDone((s) => ({ ...s, cash: true }));
    setPhase("split_transfer_1");
  };

  const handleSplitTransfer1Confirmed = () => {
    simulateApiNotification("Transfer 1");
    setSplitStepsDone((s) => ({ ...s, t1: true }));
    setPhase("split_transfer_2");
  };

  const handleSplitTransfer2Confirmed = () => {
    simulateApiNotification("Transfer 2");
    setSplitStepsDone((s) => ({ ...s, t2: true }));
    setTimeout(() => void finishSuccess(), 800);
  };

  const methodButtons: { method: PayMethod; enabled: boolean }[] = [
    { method: "NFC/Card", enabled: providerSupportsMethod(capabilities, "NFC/Card") },
    { method: "Cash", enabled: providerSupportsMethod(capabilities, "Cash") },
    { method: "Bank Transfer", enabled: providerSupportsMethod(capabilities, "Bank Transfer") },
    { method: "Split", enabled: providerSupportsMethod(capabilities, "Split") },
  ];

  const cashChange =
    parseFloat(cashReceivedInput) > totalDue
      ? roundMoney(parseFloat(cashReceivedInput) - totalDue)
      : 0;
  const splitCashChange =
    parseFloat(splitCashReceivedInput) > splitCashDue
      ? roundMoney(parseFloat(splitCashReceivedInput) - splitCashDue)
      : 0;

  const backToMethods = () => {
    setPhase("select_method");
    setSelectedMethod(null);
  };

  const renderWaitingPanel = (
    title: string,
    subtitle: string,
    icon: ReactNode,
    children: ReactNode
  ) => (
    <motion.div
      key={phase}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="text-center space-y-6 bg-white p-10 rounded-3xl border border-slate-150 shadow-2xl max-w-lg w-full mx-auto"
    >
      <div className="flex justify-center">{icon}</div>
      <div className="space-y-1">
        <h3 className="font-display font-bold text-xl text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">{subtitle}</p>
      </div>
      {apiPulse && (
        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest animate-pulse">
          API webhook received
        </p>
      )}
      {children}
      <button
        type="button"
        onClick={backToMethods}
        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider"
      >
        ← Change payment method
      </button>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 bg-slate-100 z-50 flex flex-col justify-between p-6 sm:p-8 font-sans overflow-y-auto">
      <div className="flex justify-between items-center w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-primary font-display font-bold text-lg">
          <Wifi className="w-5 h-5 rotate-90" />
          <span>cheko PAY</span>
        </div>
        <div className="flex items-center gap-2 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          TERMINAL_04
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center max-w-5xl w-full mx-auto my-4">
        <AnimatePresence mode="wait">
          {phase === "select_method" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="text-center w-full space-y-8"
            >
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">Total due</p>
                <h1 className="font-display font-bold text-5xl sm:text-6xl text-slate-950 tracking-tight">
                  {formatMoney(totalDue)}
                </h1>
                <p className="text-sm text-slate-400 font-semibold">
                  {totalItems} {totalItems === 1 ? "item" : "items"} in basket
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl mx-auto px-2">
                {methodButtons.map(({ method, enabled }) => {
                  const onClick = () => void startMethod(method);
                  if (method === "NFC/Card") {
                    return (
                      <button
                        key={method}
                        type="button"
                        disabled={!enabled}
                        onClick={onClick}
                        className={`flex flex-col items-center justify-between p-6 rounded-3xl shadow-xl min-h-[200px] cursor-pointer transition-all ${
                          enabled
                            ? "bg-primary hover:bg-primary-hover text-white hover:-translate-y-0.5"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <CreditCard className="w-12 h-12" strokeWidth={1.5} />
                        <div className="text-center space-y-2">
                          <p className="font-bold text-sm">NFC / Card</p>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full text-[9px] font-bold uppercase">
                            Tap to pay
                          </span>
                        </div>
                      </button>
                    );
                  }
                  if (method === "Cash") {
                    return (
                      <button
                        key={method}
                        type="button"
                        disabled={!enabled}
                        onClick={onClick}
                        className="flex flex-col items-center justify-between p-6 bg-white hover:bg-slate-50 text-slate-800 rounded-3xl shadow-md border border-slate-100 min-h-[200px] cursor-pointer disabled:opacity-60"
                      >
                        <Banknote className="w-12 h-12 text-slate-400" strokeWidth={1.5} />
                        <div className="text-center">
                          <p className="font-bold text-sm">Cash</p>
                          <p className="text-[10px] text-slate-400 mt-1">Opens cash drawer</p>
                        </div>
                      </button>
                    );
                  }
                  if (method === "Bank Transfer") {
                    return (
                      <button
                        key={method}
                        type="button"
                        disabled={!enabled}
                        onClick={onClick}
                        className="flex flex-col items-center justify-between p-6 bg-white hover:bg-slate-50 text-slate-800 rounded-3xl shadow-md border border-slate-100 min-h-[200px] cursor-pointer disabled:opacity-60"
                      >
                        <Landmark className="w-12 h-12 text-slate-400" strokeWidth={1.5} />
                        <div className="text-center">
                          <p className="font-bold text-sm">Bank transfer</p>
                          <p className="text-[10px] text-slate-400 mt-1">Virtual account</p>
                        </div>
                      </button>
                    );
                  }
                  return (
                    <button
                      key={method}
                      type="button"
                      disabled={!enabled}
                      onClick={onClick}
                      className="flex flex-col items-center justify-between p-6 bg-white hover:bg-slate-50 text-slate-800 rounded-3xl shadow-md border border-slate-100 min-h-[200px] cursor-pointer disabled:opacity-60"
                    >
                      <Split className="w-12 h-12 text-slate-400" strokeWidth={1.5} />
                      <div className="text-center">
                        <p className="font-bold text-sm">Split</p>
                        <p className="text-[10px] text-slate-400 mt-1">Cash + 2 transfers</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {!summary.configured && (
                <p className="text-xs text-amber-600 font-medium">
                  Configure a payment provider in Settings to enable gateway features.
                </p>
              )}
            </motion.div>
          )}

          {phase === "nfc_await_card" &&
            renderWaitingPanel(
              "Awaiting card",
              "Ask customer to tap or insert card on the terminal.",
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-2 rounded-full border-4 border-t-primary border-r-transparent animate-spin" />
                <CreditCard className="absolute inset-0 m-auto w-10 h-10 text-primary" />
              </div>,
              <button
                type="button"
                onClick={handleCardTapped}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Simulate card tap
              </button>
            )}

          {phase === "nfc_await_api" &&
            renderWaitingPanel(
              "Processing payment",
              `Waiting for transaction notification from CheckoutPay API. Auth: ${nfcAuthRef}`,
              <Loader2 className="w-14 h-14 text-primary animate-spin" />,
              <button
                type="button"
                onClick={handleNfcApiConfirmed}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4" />
                Simulate API approval
              </button>
            )}

          {phase === "cash_amount" && (
            <motion.div
              key="cash_amount"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-3xl border border-slate-150 shadow-2xl max-w-md w-full mx-auto space-y-6"
            >
              <div className="text-center">
                <Wallet className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <h3 className="font-display font-bold text-xl text-slate-800">Cash received</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Store keeper: enter amount customer handed you.
                </p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-amber-800 uppercase">Amount due</p>
                <p className="text-2xl font-black text-slate-900 font-display">{formatMoney(totalDue)}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                  Amount received from customer
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  autoFocus
                  value={cashReceivedInput}
                  onChange={(e) => setCashReceivedInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 text-lg font-black text-center border-2 border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
                {cashChange > 0 && (
                  <p className="text-center text-sm font-bold text-emerald-600 mt-2">
                    Change to give: {formatMoney(cashChange)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleCashAmountConfirm}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
              >
                Confirm cash & complete
              </button>
              <button type="button" onClick={backToMethods} className="w-full text-[10px] text-slate-400 font-bold uppercase">
                ← Change method
              </button>
            </motion.div>
          )}

          {phase === "transfer_await" &&
            renderWaitingPanel(
              "Awaiting bank transfer",
              virtualAccount
                ? `Pay ${formatMoney(totalDue)} to ${virtualAccount.bankName} · ${virtualAccount.accountNumber} · ${virtualAccount.accountName}`
                : `Listening for incoming transfer. Reference: ${transferRef}. Total: ${formatMoney(totalDue)}`,
              <div className="relative">
                <Landmark className="w-14 h-14 text-indigo-500" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
              </div>,
              <button
                type="button"
                disabled={processing}
                onClick={() => void handleTransferApiConfirmed()}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Radio className="w-4 h-4" />
                {processing ? "Verifying…" : "Simulate transfer received (API)"}
              </button>
            )}

          {phase === "split_overview" && (
            <motion.div
              key="split_overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl border border-slate-150 shadow-2xl max-w-md w-full mx-auto space-y-5"
            >
              <h3 className="font-display font-bold text-xl text-slate-800 text-center flex items-center justify-center gap-2">
                <Split className="w-5 h-5 text-indigo-500" />
                Split payment plan
              </h3>
              <p className="text-xs text-slate-500 text-center">Total {formatMoney(totalDue)} — collect in 3 steps</p>
              <div className="space-y-2 text-sm font-semibold">
                <div className="flex justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <span>1. Cash (drawer)</span>
                  <span className="font-black">{formatMoney(splitCashDue)}</span>
                </div>
                <div className="flex justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <span>2. Transfer A (API)</span>
                  <span className="font-black">{formatMoney(splitTransfer1Due)}</span>
                </div>
                <div className="flex justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <span>3. Transfer B (API)</span>
                  <span className="font-black">{formatMoney(splitTransfer2Due)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={startSplitFlow}
                className="w-full py-3.5 bg-primary text-white rounded-xl text-xs font-black uppercase cursor-pointer flex items-center justify-center gap-2"
              >
                Start split collection
                <ChevronRight className="w-4 h-4" />
              </button>
              <button type="button" onClick={backToMethods} className="w-full text-[10px] text-slate-400 font-bold uppercase">
                ← Change method
              </button>
            </motion.div>
          )}

          {phase === "split_cash_amount" && (
            <motion.div
              key="split_cash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full mx-auto space-y-5"
            >
              <p className="text-[10px] font-extrabold text-amber-700 uppercase text-center">
                Split step 1 of 3 — Cash
              </p>
              <h3 className="font-display font-bold text-lg text-center">Cash portion</h3>
              <p className="text-xs text-slate-500 text-center">
                Enter cash received for this portion ({formatMoney(splitCashDue)}).
              </p>
              <input
                type="number"
                min="0"
                step="0.01"
                value={splitCashReceivedInput}
                onChange={(e) => setSplitCashReceivedInput(e.target.value)}
                placeholder="Amount received"
                className="w-full px-4 py-3 text-lg font-black text-center border-2 rounded-xl outline-none focus:border-primary"
              />
              {splitCashChange > 0 && (
                <p className="text-center text-sm font-bold text-emerald-600">
                  Change: {formatMoney(splitCashChange)}
                </p>
              )}
              <button
                type="button"
                onClick={handleSplitCashConfirm}
                className="w-full py-3 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
              >
                Cash confirmed — wait for transfers
              </button>
            </motion.div>
          )}

          {phase === "split_transfer_1" &&
            renderWaitingPanel(
              "Split step 2 of 3 — Transfer A",
              `Waiting for first transfer (${formatMoney(splitTransfer1Due)}) via API notification.`,
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />,
              <button
                type="button"
                onClick={handleSplitTransfer1Confirmed}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
              >
                Simulate transfer A received
              </button>
            )}

          {phase === "split_transfer_2" &&
            renderWaitingPanel(
              "Split step 3 of 3 — Transfer B",
              `Waiting for second transfer (${formatMoney(splitTransfer2Due)}) via API notification.`,
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />,
              <>
                <div className="flex gap-1 justify-center text-[9px] font-bold uppercase">
                  <span className={splitStepsDone.cash ? "text-emerald-600" : "text-slate-300"}>Cash ✓</span>
                  <span className={splitStepsDone.t1 ? "text-emerald-600" : "text-slate-300"}>T1 ✓</span>
                  <span className={splitStepsDone.t2 ? "text-emerald-600" : "text-slate-300"}>T2</span>
                </div>
                <button
                  type="button"
                  onClick={handleSplitTransfer2Confirmed}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
                >
                  Simulate transfer B received
                </button>
              </>
            )}

          {phase === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-5 bg-white p-10 rounded-3xl border border-emerald-100 shadow-2xl max-w-xl w-full mx-auto"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-50">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <h2 className="font-display font-bold text-2xl text-slate-800">Payment complete</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedMethod} — returning to register…
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left font-mono text-[11px] space-y-1">
                <div className="flex justify-between font-bold border-b border-dashed pb-2 mb-2">
                  <span>cheko receipt</span>
                  <span>#TX-{Math.floor(Math.random() * 90000) + 10000}</span>
                </div>
                {cart.map((item) => (
                  <div key={item.product.sku} className="flex justify-between text-slate-600">
                    <span className="truncate pr-2">
                      {item.product.name} ×{item.quantity}
                    </span>
                    <span>{formatMoney(item.product.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-black text-slate-900 pt-2 border-t border-dashed">
                  <span>Total</span>
                  <span>{formatMoney(totalDue)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSendToPosPrinter}
                  disabled={printStatus === "printing"}
                  className="flex-1 py-3 border rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  {printStatus === "none" && "Send to POS printer"}
                  {printStatus === "printing" && "Sending to printer…"}
                  {printStatus === "printed" && "Sent to printer"}
                </button>
                <button
                  type="button"
                  onClick={completeAndReturn}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Back to register
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-4 pt-4 border-t border-slate-200/80">
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          CheckoutPay API · encrypted terminal
        </p>
        {phase === "select_method" && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-slate-200/80 hover:bg-slate-200 rounded-full text-xs font-bold text-slate-700 uppercase cursor-pointer flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
