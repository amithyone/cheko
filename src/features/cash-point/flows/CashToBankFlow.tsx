import { Loader2, Wifi, ArrowUpFromLine, User } from "lucide-react";
import { NIGERIAN_BANKS } from "@/types";
import { formatCurrency } from "@/shared/utils/money";

export type CashToBankPhase = "form" | "send_collect" | "send_processing";

interface CashToBankFlowProps {
  phase: CashToBankPhase;
  currencySymbol: string;
  senderName: string;
  setSenderName: (value: string) => void;
  cashCollectInput: string;
  setCashCollectInput: (value: string) => void;
  cashCollectAmount: number;
  sendPreview: { paymentReceived: number; cashToGive: number; feeAmount: number };
  destBank: string;
  setDestBank: (value: string) => void;
  destAccountNo: string;
  setDestAccountNo: (value: string) => void;
  destAccountName: string;
  setDestAccountName: (value: string) => void;
  onStartCashSend: () => void;
  onConfirmCashCollected: () => void;
  onCompleteCashSend: () => void;
  onBackToForm: () => void;
  onBackToCollect: () => void;
}

export default function CashToBankFlow({
  phase,
  currencySymbol,
  senderName,
  setSenderName,
  cashCollectInput,
  setCashCollectInput,
  cashCollectAmount,
  sendPreview,
  destBank,
  setDestBank,
  destAccountNo,
  setDestAccountNo,
  destAccountName,
  setDestAccountName,
  onStartCashSend,
  onConfirmCashCollected,
  onCompleteCashSend,
  onBackToForm,
  onBackToCollect,
}: CashToBankFlowProps) {
  const format = (n: number) => formatCurrency(n, currencySymbol);

  if (phase === "form") {
    return (
      <>
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 leading-relaxed">
          Customer brings cash — you collect it, then we send to any Nigerian bank. Sender name is required for compliance.
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
            Sender name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Full name of person depositing cash"
              className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
            Cash amount to collect <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="100"
            value={cashCollectInput}
            onChange={(e) => setCashCollectInput(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 text-xl font-black text-center border-2 border-slate-200 rounded-xl outline-none focus:border-emerald-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
              Recipient bank <span className="text-rose-500">*</span>
            </label>
            <select
              value={destBank}
              onChange={(e) => setDestBank(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-white"
            >
              {NIGERIAN_BANKS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
              Account number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={destAccountNo}
              onChange={(e) => setDestAccountNo(e.target.value.replace(/\D/g, ""))}
              placeholder="10-digit NUBAN"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
              Account name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={destAccountName}
              onChange={(e) => setDestAccountName(e.target.value)}
              placeholder="Beneficiary name"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
            />
          </div>
        </div>

        {cashCollectAmount > 0 && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Cash collected</span>
              <span className="font-black">{format(cashCollectAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Service fee (5%)</span>
              <span className="font-bold">{format(sendPreview.feeAmount)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-emerald-200 font-bold text-emerald-800">
              <span>Send to {destBank || "bank"}</span>
              <span>{format(sendPreview.cashToGive)}</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onStartCashSend}
          disabled={
            !senderName.trim() ||
            cashCollectAmount <= 0 ||
            destAccountNo.trim().length < 10 ||
            !destAccountName.trim()
          }
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowUpFromLine className="w-4 h-4" />
          Collect cash & send transfer
        </button>
      </>
    );
  }

  if (phase === "send_collect") {
    return (
      <div className="text-center space-y-5 py-4">
        <ArrowUpFromLine className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="font-display font-bold text-lg">Collect {format(cashCollectAmount)}</h3>
        <p className="text-xs text-slate-500">
          From <strong>{senderName.trim()}</strong> — count notes into drawer
        </p>
        <div className="p-4 bg-slate-50 border rounded-xl text-xs text-left space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Send to</span>
            <span className="font-bold">{destBank}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Account</span>
            <span className="font-mono font-bold">{destAccountNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Name</span>
            <span className="font-bold">{destAccountName}</span>
          </div>
          <div className="flex justify-between pt-1 border-t font-black text-emerald-700">
            <span>Transfer amount</span>
            <span>{format(sendPreview.cashToGive)}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onConfirmCashCollected}
          className="w-full py-3 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
        >
          Cash received — send transfer
        </button>
        <button type="button" onClick={onBackToForm} className="text-[10px] text-slate-400 font-bold uppercase">
          ← Back
        </button>
      </div>
    );
  }

  if (phase === "send_processing") {
    return (
      <div className="text-center space-y-5 py-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
        <h3 className="font-display font-bold text-lg">Sending to {destBank}</h3>
        <p className="text-xs text-slate-500">
          {format(sendPreview.cashToGive)} → {destAccountName} · {destAccountNo}
        </p>
        <p className="text-[10px] text-slate-400">Sender: {senderName.trim()}</p>
        <button
          type="button"
          onClick={onCompleteCashSend}
          className="w-full py-3 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase cursor-pointer flex items-center justify-center gap-2"
        >
          <Wifi className="w-4 h-4 rotate-90" />
          Simulate transfer sent
        </button>
        <button type="button" onClick={onBackToCollect} className="text-[10px] text-slate-400 font-bold uppercase">
          ← Back
        </button>
      </div>
    );
  }

  return null;
}
