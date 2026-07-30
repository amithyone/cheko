import React from "react";
import { FolderArchive } from "lucide-react";

interface ParkCartModalProps {
  open: boolean;
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function ParkCartModal({
  open,
  customerName,
  onCustomerNameChange,
  onSubmit,
  onClose,
}: ParkCartModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 border border-slate-100 relative shadow-2xl animate-in zoom-in-95 duration-150">
        <h3 className="font-display text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
          <FolderArchive className="text-amber-500 w-5 h-5" />
          Park Checkout Checkout
        </h3>
        <p className="text-xs text-slate-400 mb-4 font-medium font-sans">
          Enter customer identification or locker label to park current items in memory stack safely.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Customer Name / Ticket Label
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="e.g. Guest on Hold (Forgot Wallet)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/10 select-none accent-primary focus:border-primary"
              required
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/10 flex items-center justify-center gap-2"
            >
              Park Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
