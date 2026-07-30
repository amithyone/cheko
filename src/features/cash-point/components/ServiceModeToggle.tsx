import { Send } from "lucide-react";

export type ServiceMode = "digital_to_cash" | "cash_to_bank";

interface ServiceModeToggleProps {
  serviceMode: ServiceMode;
  onSwitch: (mode: ServiceMode) => void;
}

export default function ServiceModeToggle({ serviceMode, onSwitch }: ServiceModeToggleProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSwitch("digital_to_cash")}
        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide border-2 transition-all cursor-pointer ${
          serviceMode === "digital_to_cash"
            ? "border-amber-500 bg-amber-50 text-amber-900"
            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
        }`}
      >
        Digital → Cash payout
      </button>
      <button
        type="button"
        onClick={() => onSwitch("cash_to_bank")}
        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
          serviceMode === "cash_to_bank"
            ? "border-emerald-500 bg-emerald-50 text-emerald-900"
            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
        }`}
      >
        <Send className="w-3.5 h-3.5" />
        Collect cash → Send to bank
      </button>
    </div>
  );
}
