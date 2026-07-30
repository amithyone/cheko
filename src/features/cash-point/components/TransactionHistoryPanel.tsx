import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpFromLine,
  Send,
} from "lucide-react";
import { CashDisbursementRecord } from "@/types";
import { formatCurrency } from "@/shared/utils/money";

interface TransactionHistoryPanelProps {
  transactionHistory: CashDisbursementRecord[];
  currencySymbol: string;
}

export default function TransactionHistoryPanel({
  transactionHistory,
  currencySymbol,
}: TransactionHistoryPanelProps) {
  const format = (n: number) => formatCurrency(n, currencySymbol);

  const historyTotals = transactionHistory.reduce(
    (acc, h) => ({
      cashOut: acc.cashOut + h.cashDisbursed,
      cashIn: acc.cashIn + (h.cashCollected ?? 0),
      fees: acc.fees + h.feeAmount,
      received: acc.received + h.paymentReceived,
    }),
    { cashOut: 0, cashIn: 0, fees: 0, received: 0 }
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col min-h-[360px] lg:min-h-[420px] max-h-[calc(100vh-10rem)]">
      <div className="p-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wide">
              Transaction history
            </h4>
          </div>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {transactionHistory.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
            <p className="text-slate-500 uppercase font-bold">Cash out</p>
            <p className="font-black text-amber-800">{format(historyTotals.cashOut)}</p>
          </div>
          <div className="bg-teal-50 border border-teal-100 rounded-lg p-2">
            <p className="text-slate-500 uppercase font-bold">Cash in</p>
            <p className="font-black text-teal-800">{format(historyTotals.cashIn)}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 col-span-2">
            <p className="text-slate-500 uppercase font-bold">Fees kept</p>
            <p className="font-black text-emerald-800">{format(historyTotals.fees)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {transactionHistory.length === 0 ? (
          <div className="text-center py-12 px-4">
            <History className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">No transactions yet</p>
            <p className="text-[10px] text-slate-400 mt-1">Completed payouts appear here</p>
          </div>
        ) : (
          transactionHistory.map((h) => (
            <div
              key={h.id}
              className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                    h.method === "Bank Transfer"
                      ? "bg-indigo-100 text-indigo-700"
                      : h.method === "Cash Send"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-primary/10 text-primary"
                  }`}
                >
                  {h.method === "Bank Transfer"
                    ? "Transfer"
                    : h.method === "Cash Send"
                      ? "Cash send"
                      : "Card"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{h.timestamp}</span>
              </div>
              <p className="text-[11px] font-bold text-slate-800 leading-snug mb-2 truncate" title={h.paymentRef}>
                {h.paymentRef}
              </p>
              {h.senderName && (
                <p className="text-[10px] text-slate-500 mb-1.5">Sender: {h.senderName}</p>
              )}
              <div className="space-y-1 text-[10px]">
                {h.method === "Cash Send" ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <ArrowUpFromLine className="w-3 h-3 text-teal-500" /> Cash in
                      </span>
                      <span className="font-bold text-teal-700">{format(h.cashCollected ?? 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Send className="w-3 h-3 text-emerald-500" /> Sent
                      </span>
                      <span className="font-bold text-emerald-700">{format(h.paymentReceived)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-emerald-500" /> Received
                      </span>
                      <span className="font-bold text-emerald-700">{format(h.paymentReceived)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3 text-amber-500" /> Cash out
                      </span>
                      <span className="font-bold text-amber-700">{format(h.cashDisbursed)}</span>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                  <span className="text-slate-400">Fee</span>
                  <span className="font-bold text-slate-600">{format(h.feeAmount)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
