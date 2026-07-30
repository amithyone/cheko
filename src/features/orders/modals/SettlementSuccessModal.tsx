import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { DeliveryOrder } from "@/types";

interface SettlementSuccessModalProps {
  order: DeliveryOrder;
  currencySymbol: string;
  onClose: () => void;
}

export function SettlementSuccessModal({
  order,
  currencySymbol,
  onClose,
}: SettlementSuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-slate-100 relative text-center animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
        >
          <span className="text-base font-bold font-mono">✕</span>
        </button>

        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5 ring-4 ring-emerald-50">
          <CheckCircle2 className="w-11 h-11 text-emerald-500" strokeWidth={2.5} />
        </div>

        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[9px] font-extrabold uppercase tracking-widest mb-3">
          Payment successful
        </span>

        <h3 className="font-display font-black text-2xl text-slate-900 mb-2">
          Settlement confirmed
        </h3>

        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 px-2">
          <span className="font-bold text-slate-700">{order.bankName}</span> confirmed
          transfer received. Order{" "}
          <span className="font-mono font-bold text-indigo-600">{order.id}</span> is
          queued for dispatch.
        </p>

        <div className="p-4 bg-emerald-50/80 border border-emerald-100 rounded-2xl text-left text-xs space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-500 uppercase text-[10px] font-bold">Amount paid</span>
            <span className="font-black text-emerald-700 font-display">
              {currencySymbol}
              {order.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 uppercase text-[10px] font-bold">Bank</span>
            <span className="font-bold text-slate-800">{order.bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 uppercase text-[10px] font-bold">Status</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> API webhook verified
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase rounded-xl tracking-wider shadow-md shadow-emerald-100 cursor-pointer transition-all active:scale-[0.98]"
        >
          Continue to orders
        </button>
      </div>
    </div>
  );
}
