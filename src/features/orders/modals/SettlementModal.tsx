import React from "react";
import { Check, CheckCircle2, Building, Copy, Share2 } from "lucide-react";
import { DeliveryOrder } from "@/types";

interface SettlementModalProps {
  order: DeliveryOrder;
  currencySymbol: string;
  settlementCopyHint: string;
  isVerifyingTransfer: boolean;
  onClose: () => void;
  onCopyDetails: (order: DeliveryOrder) => void;
  onShareDetails: (order: DeliveryOrder) => void;
  onCopyAccountNumber: (accountNo: string) => void;
  onConfirmTransfer: () => void;
}

export function SettlementModal({
  order,
  currencySymbol,
  settlementCopyHint,
  isVerifyingTransfer,
  onClose,
  onCopyDetails,
  onShareDetails,
  onCopyAccountNumber,
  onConfirmTransfer,
}: SettlementModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 select-none border border-slate-100 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <span className="text-base font-bold font-mono">✕</span>
        </button>

        <div className="text-center space-y-2 mb-6 text-xs">
          <span className="px-3 py-1 font-mono text-[9px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full uppercase tracking-wider">
            API Settlement Gateway Active
          </span>
          <h3 className="font-display font-black text-xl text-slate-900 pt-1">
            Awaiting Bank Transfer
          </h3>
          <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
            We have generated a real-time virtual account based on payment APIs. Give the user these transfer credentials to complete order:
          </p>
        </div>

        <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-10/20 border border-indigo-150 rounded-2xl text-xs space-y-3 font-semibold select-text">
          <div className="flex justify-between items-center pb-2 border-b border-indigo-200/50">
            <span className="text-slate-400 text-[10px] uppercase">Amount Payable</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black font-display text-indigo-700">
                {currencySymbol}{order.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <button
                type="button"
                onClick={() => onCopyDetails(order)}
                className="p-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
                title="Copy all payment details"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs gap-2">
            <span className="text-slate-400 text-[10px] uppercase shrink-0">Target Bank</span>
            <span className="font-extrabold text-slate-800 flex items-center gap-1 text-right">
              <Building className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> {order.bankName}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs gap-2">
            <span className="text-slate-400 text-[10px] uppercase shrink-0">Account Number</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-slate-950 text-sm tracking-widest bg-white px-2.5 py-1 rounded-lg border shadow-sm">
                {order.bankAccountNo}
              </span>
              <button
                type="button"
                onClick={() => onCopyAccountNumber(order.bankAccountNo || "")}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 cursor-pointer"
                title="Copy account number"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs gap-2">
            <span className="text-slate-400 text-[10px] uppercase shrink-0">Account Title</span>
            <span className="font-mono text-[11px] font-bold text-slate-700 text-right">
              cheko: {order.customerName}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs pt-1 border-t border-indigo-200/40">
            <span className="text-slate-400 text-[10px] uppercase">Order ID</span>
            <span className="font-mono font-bold text-slate-700">{order.id}</span>
          </div>
        </div>

        {settlementCopyHint && (
          <p className="mt-2 text-center text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1">
            <Check className="w-3.5 h-3.5" /> {settlementCopyHint}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onCopyDetails(order)}
            className="py-2.5 bg-white border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 text-[10px] font-extrabold uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Copy className="w-4 h-4 text-indigo-600" />
            Copy details
          </button>
          <button
            type="button"
            onClick={() => onShareDetails(order)}
            className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        <div className="mt-6 py-4 px-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center gap-3 text-xs text-slate-500 font-semibold">
          <div className="w-4 h-4 border-2 border-indigo-505 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
          <span>Listening for incoming {order.bankName} API credit alerts...</span>
        </div>

        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={onConfirmTransfer}
            disabled={isVerifyingTransfer}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black text-xs uppercase rounded-xl tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-100"
          >
            {isVerifyingTransfer ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                Verifying Settlement webhook...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Simulate Customer Payment Transfer Alert
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer text-center"
          >
            Cancel & Close Gateway
          </button>
        </div>

        <div className="mt-5 text-[9px] text-slate-400 leading-snug text-center font-mono">
          SECURE LEDGER API GATEWAY ID: WG-{order.id}
        </div>
      </div>
    </div>
  );
}
