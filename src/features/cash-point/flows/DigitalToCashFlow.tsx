import {
  Landmark,
  CreditCard,
  Loader2,
  CheckCircle2,
  Radio,
  Wifi,
  ArrowDownToLine,
} from "lucide-react";
import { CashPointReceiveAccount } from "@/types";
import { formatCurrency } from "@/shared/utils/money";
import AccountDetailsCard from "@/features/cash-point/components/AccountDetailsCard";

export type PaymentMethod = "Bank Transfer" | "NFC/Card";

export type DigitalPayPhase =
  | "form"
  | "card_await_tap"
  | "card_await_api"
  | "transfer_await_api"
  | "transfer_detected"
  | "disburse";

interface DigitalToCashFlowProps {
  phase: DigitalPayPhase;
  currencySymbol: string;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  chargeAmountInput: string;
  setChargeAmountInput: (value: string) => void;
  chargeAmount: number;
  cardPreview: { paymentReceived: number; cashToGive: number; feeAmount: number };
  drawerBalance: number;
  receiveAccount: CashPointReceiveAccount;
  refreshReceiveAccount: () => void;
  paymentRef: string;
  apiSessionId: string;
  settledPayment: number;
  settledCash: number;
  settledFee: number;
  onStartFlow: () => void;
  onCardTapped: () => void;
  onCardChargeConfirmed: () => void;
  onTransferDetected: () => void;
  onConfirmTransferPayout: () => void;
  onCompleteDisbursement: () => void;
  onBackToForm: () => void;
  onBackToTransferListen: () => void;
}

export default function DigitalToCashFlow({
  phase,
  currencySymbol,
  paymentMethod,
  setPaymentMethod,
  chargeAmountInput,
  setChargeAmountInput,
  chargeAmount,
  cardPreview,
  drawerBalance,
  receiveAccount,
  refreshReceiveAccount,
  paymentRef,
  apiSessionId,
  settledPayment,
  settledCash,
  settledFee,
  onStartFlow,
  onCardTapped,
  onCardChargeConfirmed,
  onTransferDetected,
  onConfirmTransferPayout,
  onCompleteDisbursement,
  onBackToForm,
  onBackToTransferListen,
}: DigitalToCashFlowProps) {
  const format = (n: number) => formatCurrency(n, currencySymbol);

  if (phase === "form") {
    return (
      <>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">
            Payment method
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setPaymentMethod("Bank Transfer");
                setChargeAmountInput("");
                refreshReceiveAccount();
              }}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                paymentMethod === "Bank Transfer"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <Landmark className="w-6 h-6" />
              <span className="text-xs font-bold">Bank transfer</span>
              <span className="text-[9px] text-slate-500 text-center leading-tight">
                Share account number — API attaches sender
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("NFC/Card")}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                paymentMethod === "NFC/Card"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <CreditCard className="w-6 h-6" />
              <span className="text-xs font-bold">NFC / Card</span>
              <span className="text-[9px] text-slate-500 text-center leading-tight">
                Enter debit amount — card data from terminal
              </span>
            </button>
          </div>
        </div>

        {paymentMethod === "Bank Transfer" ? (
          <AccountDetailsCard receiveAccount={receiveAccount} />
        ) : (
          <>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                Amount to debit from card / NFC
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={chargeAmountInput}
                onChange={(e) => setChargeAmountInput(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 text-xl font-black text-center border-2 border-slate-200 rounded-xl outline-none focus:border-amber-400"
              />
            </div>

            {chargeAmount > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Debit on terminal</span>
                  <span className="font-black">{format(cardPreview.paymentReceived)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Service fee (5%)</span>
                  <span className="font-bold">{format(cardPreview.feeAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-amber-200 font-bold text-emerald-800">
                  <span>Cash to tender from drawer</span>
                  <span>{format(cardPreview.cashToGive)}</span>
                </div>
                {cardPreview.cashToGive > drawerBalance && (
                  <p className="text-[10px] text-rose-600 font-bold pt-1">
                    Exceeds drawer balance ({format(drawerBalance)})
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <button
          type="button"
          onClick={onStartFlow}
          disabled={
            paymentMethod === "NFC/Card" &&
            (chargeAmount <= 0 || cardPreview.cashToGive > drawerBalance)
          }
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
        >
          {paymentMethod === "Bank Transfer" ? "Start listening for transfer" : "Charge card / NFC"}
        </button>
      </>
    );
  }

  if (phase === "card_await_tap") {
    return (
      <div className="text-center space-y-5 py-4">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <CreditCard className="absolute inset-0 m-auto w-9 h-9 text-primary" />
        </div>
        <h3 className="font-display font-bold text-lg">Debit {format(chargeAmount)}</h3>
        <p className="text-xs text-slate-500">Ask customer to tap or insert card</p>
        <button
          type="button"
          onClick={onCardTapped}
          className="w-full py-3 bg-primary text-white rounded-xl text-xs font-black uppercase cursor-pointer"
        >
          Simulate card tap
        </button>
        <button type="button" onClick={onBackToForm} className="text-[10px] text-slate-400 font-bold uppercase">
          ← Back
        </button>
      </div>
    );
  }

  if (phase === "card_await_api") {
    return (
      <div className="text-center space-y-5 py-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
        <h3 className="font-display font-bold text-lg">Processing card debit</h3>
        <p className="text-xs text-slate-500">
          Debiting {format(chargeAmount)} · Card details will attach on approval
        </p>
        <button
          type="button"
          onClick={onCardChargeConfirmed}
          className="w-full py-3 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase cursor-pointer flex items-center justify-center gap-2"
        >
          <Wifi className="w-4 h-4 rotate-90" />
          Simulate charge approved
        </button>
        <button type="button" onClick={onBackToForm} className="text-[10px] text-slate-400 font-bold uppercase">
          ← Back
        </button>
      </div>
    );
  }

  if (phase === "transfer_await_api") {
    return (
      <div className="space-y-5 py-2">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg">Listening for incoming transfer</h3>
          <p className="text-[10px] text-center text-slate-400 mt-1">
            Waiting for {receiveAccount.bankName} API credit alert…
          </p>
        </div>
        <AccountDetailsCard receiveAccount={receiveAccount} compact />
        <button
          type="button"
          onClick={onTransferDetected}
          className="w-full py-3 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase cursor-pointer flex items-center justify-center gap-2"
        >
          <Radio className="w-4 h-4" />
          Simulate transfer received
        </button>
        <button
          type="button"
          onClick={onBackToForm}
          className="w-full text-[10px] text-slate-400 font-bold uppercase"
        >
          ← Back
        </button>
      </div>
    );
  }

  if (phase === "transfer_detected") {
    return (
      <div className="space-y-5 py-2">
        <div className="text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-display font-bold text-lg">Transfer received</h3>
          <p className="text-xs text-slate-500">{paymentRef}</p>
          {apiSessionId && (
            <p className="text-[10px] text-slate-400 font-mono mt-1">{apiSessionId}</p>
          )}
        </div>
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Transfer received</span>
            <span className="font-black text-emerald-800">{format(settledPayment)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Service fee (5%)</span>
            <span className="font-bold">{format(settledFee)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-emerald-200 font-bold text-slate-900">
            <span>Cash to tender from drawer</span>
            <span className="text-amber-700">{format(settledCash)}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onConfirmTransferPayout}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
        >
          Open drawer & pay out {format(settledCash)}
        </button>
        <button
          type="button"
          onClick={onBackToTransferListen}
          className="w-full text-[10px] text-slate-400 font-bold uppercase"
        >
          ← Keep listening
        </button>
      </div>
    );
  }

  if (phase === "disburse") {
    return (
      <div className="text-center space-y-5 py-4">
        <ArrowDownToLine className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
        <h3 className="font-display font-bold text-lg">Tender {format(settledCash)}</h3>
        <div className="p-4 bg-slate-50 border rounded-xl text-xs space-y-1 text-left">
          <div className="flex justify-between">
            <span className="text-slate-500">Payer (from API)</span>
            <span className="font-bold text-right max-w-[60%]">{paymentRef}</span>
          </div>
          {apiSessionId && (
            <div className="flex justify-between">
              <span className="text-slate-500">Ref</span>
              <span className="font-mono text-[10px]">{apiSessionId}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">
              {paymentMethod === "Bank Transfer" ? "Transfer received" : "Card debited"}
            </span>
            <span className="font-bold">{format(settledPayment)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Fee (5%)</span>
            <span className="font-bold">{format(settledFee)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t font-black text-emerald-700">
            <span>From drawer</span>
            <span>{format(settledCash)}</span>
          </div>
        </div>
        <p className="text-xs text-slate-500">Hand cash to customer, then confirm.</p>
        <button
          type="button"
          onClick={onCompleteDisbursement}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
        >
          Cash handed out — close drawer
        </button>
      </div>
    );
  }

  return null;
}
