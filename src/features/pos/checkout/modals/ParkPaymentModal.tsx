import React from "react";
import { Clock } from "lucide-react";

interface ParkPaymentModalProps {
  open: boolean;
  label: string;
  onLabelChange: (value: string) => void;
  amountLabel: string;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function ParkPaymentModal({
  open,
  label,
  onLabelChange,
  amountLabel,
  onSubmit,
  onClose,
}: ParkPaymentModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-150">
        <h3 className="font-display text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Clock className="text-indigo-500 w-5 h-5" />
          Park payment
        </h3>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Keep {amountLabel} waiting for CheckoutNow or gateway webhook in the background. You can
          serve the next customer — a new BLE session starts for the next payment.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Ticket / customer label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => onLabelChange(e.target.value)}
              placeholder="e.g. Table 4 — awaiting transfer"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
              required
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Park &amp; next customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
