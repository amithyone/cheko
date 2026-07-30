import { useEffect, useRef, useState } from "react";
import { Clock, ChevronDown, Radio, Trash2 } from "lucide-react";
import type { ParkedPayment } from "@/types";

interface ParkedPaymentsNavProps {
  payments: ParkedPayment[];
  currencySymbol?: string;
  onOpen: (payment: ParkedPayment) => void;
  onDismiss: (id: string) => void;
}

export function ParkedPaymentsNav({
  payments,
  currencySymbol = "₦",
  onOpen,
  onDismiss,
}: ParkedPaymentsNavProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (payments.length === 0) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center gap-2 px-3 py-2 rounded-full border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 transition-colors"
        title="Parked payments awaiting webhook"
      >
        <Clock className="w-4 h-4" />
        <span className="text-xs font-bold hidden sm:inline">Parked payments</span>
        <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">
          {payments.length}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-indigo-50/60">
            <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-2">
              <Radio className="w-3.5 h-3.5" />
              Awaiting payment / webhook
            </p>
            <p className="text-[10px] text-indigo-700/80 mt-0.5">
              Open to confirm status or complete checkout
            </p>
          </div>
          <ul className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {payments.map((pp) => (
              <li key={pp.id} className="px-4 py-3 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{pp.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {pp.method}
                      {pp.phase === "select_method" ? " · Pay at Shop live" : ""} · {pp.timestamp}
                    </p>
                    <p className="text-xs font-black text-slate-900 mt-1">
                      {currencySymbol}
                      {pp.totalDue.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    {pp.broadcastSessionId && (
                      <p className="text-[10px] font-mono text-sky-600 mt-1">
                        BLE session {pp.broadcastSessionId.slice(0, 8)}…
                      </p>
                    )}
                    <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {pp.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onOpen(pp);
                        setOpen(false);
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => onDismiss(pp.id)}
                      className="p-1 text-slate-400 hover:text-red-500 self-center"
                      title="Dismiss"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
