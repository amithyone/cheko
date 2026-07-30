import { Fragment, useMemo, useState } from "react";
import {
  History,
  Search,
  Store,
  Truck,
  ChevronDown,
  ChevronUp,
  Receipt,
  Banknote,
} from "lucide-react";
import type { CashDisbursementRecord, OrderHistoryRow, Transaction } from "@/types";
import { COMPLETED_ONLINE_ORDER_HISTORY } from "@/mock/order-history";
import { Badge, StatTile } from "@/shared/ui";
import { formatCurrency } from "@/shared/utils/money";

interface OrderHistoryPageProps {
  transactions: Transaction[];
  cashPointHistory: CashDisbursementRecord[];
  currencySymbol?: string;
}

type ChannelFilter = "all" | "in_store" | "online" | "cash_point";

function transactionToRow(tx: Transaction): OrderHistoryRow {
  return {
    id: tx.id,
    channel: "in_store",
    summary: tx.productName,
    amount: tx.amount,
    status: "completed",
    source: tx.terminalName,
    timestamp: tx.timestamp,
  };
}

function cashPointToRow(
  record: CashDisbursementRecord,
  currencySymbol: string
): OrderHistoryRow {
  const isCashSend = record.method === "Cash Send";
  const amount = isCashSend
    ? record.paymentReceived || record.cashCollected || 0
    : record.paymentReceived;

  const summary = isCashSend
    ? `Cash collected → ${record.destinationBank ?? "bank transfer"}`
    : `${record.method} → cash payout`;

  const detailLines = [
    `Reference: ${record.paymentRef}`,
    `Payment received: ${formatCurrency(record.paymentReceived, currencySymbol)}`,
    `Service fee (5%): ${formatCurrency(record.feeAmount, currencySymbol)}`,
  ];

  if (isCashSend) {
    detailLines.push(
      `Cash collected: ${formatCurrency(record.cashCollected ?? 0, currencySymbol)}`,
      `Sent to account: ${record.destinationAccount ?? "—"}`
    );
    if (record.senderName) detailLines.unshift(`Sender: ${record.senderName}`);
  } else {
    detailLines.push(
      `Cash disbursed: ${formatCurrency(record.cashDisbursed, currencySymbol)}`
    );
  }

  return {
    id: record.id,
    channel: "cash_point",
    summary,
    customer: record.senderName ?? record.paymentRef,
    amount,
    status: "completed",
    source: "CASH_POINT",
    timestamp: record.timestamp,
    paymentMethod: record.method,
    detailLines,
  };
}

const statusVariant: Record<
  OrderHistoryRow["status"],
  "success" | "warning" | "danger" | "default"
> = {
  completed: "success",
  delivered: "success",
  refunded: "danger",
};

function ChannelIcon({ channel }: { channel: OrderHistoryRow["channel"] }) {
  if (channel === "in_store") return <Store className="w-3.5 h-3.5 text-indigo-500" />;
  if (channel === "online") return <Truck className="w-3.5 h-3.5 text-emerald-500" />;
  return <Banknote className="w-3.5 h-3.5 text-amber-500" />;
}

function channelLabel(channel: OrderHistoryRow["channel"]) {
  if (channel === "in_store") return "In-store";
  if (channel === "online") return "Online";
  return "Cash Point";
}

export default function OrderHistoryPage({
  transactions,
  cashPointHistory,
  currencySymbol = "₦",
}: OrderHistoryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allRows = useMemo(() => {
    const inStore = transactions.map(transactionToRow);
    const cashPoint = cashPointHistory.map((r) => cashPointToRow(r, currencySymbol));
    const combined = [...inStore, ...COMPLETED_ONLINE_ORDER_HISTORY, ...cashPoint];
    return combined.sort((a, b) => {
      if (a.timestamp === "JUST NOW") return -1;
      if (b.timestamp === "JUST NOW") return 1;
      return 0;
    });
  }, [transactions, cashPointHistory, currencySymbol]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allRows.filter((row) => {
      if (channelFilter !== "all" && row.channel !== channelFilter) return false;
      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q) ||
        row.summary.toLowerCase().includes(q) ||
        row.customer?.toLowerCase().includes(q) ||
        row.source.toLowerCase().includes(q) ||
        row.paymentMethod?.toLowerCase().includes(q)
      );
    });
  }, [allRows, channelFilter, searchQuery]);

  const stats = useMemo(() => {
    const inStoreCount = allRows.filter((r) => r.channel === "in_store").length;
    const onlineCount = allRows.filter((r) => r.channel === "online").length;
    const cashPointCount = allRows.filter((r) => r.channel === "cash_point").length;
    const totalVolume = allRows.reduce((acc, r) => acc + r.amount, 0);
    const refunded = allRows.filter((r) => r.status === "refunded").length;
    return { inStoreCount, onlineCount, cashPointCount, totalVolume, refunded };
  }, [allRows]);

  const channelTabs: { id: ChannelFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "in_store", label: "In-store" },
    { id: "online", label: "Online" },
    { id: "cash_point", label: "Cash Point" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">
              Transaction ledger
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight">
            Order History
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            In-store sales, online deliveries, and cash point settlements in one ledger.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatTile
          label="Total records"
          value={String(allRows.length)}
          hint="All channels combined"
          icon={<Receipt className="w-4 h-4" />}
        />
        <StatTile
          label="In-store"
          value={String(stats.inStoreCount)}
          hint="POS checkouts"
          tone="indigo"
          icon={<Store className="w-4 h-4" />}
        />
        <StatTile
          label="Online"
          value={String(stats.onlineCount)}
          hint="Delivered orders"
          tone="emerald"
          icon={<Truck className="w-4 h-4" />}
        />
        <StatTile
          label="Cash Point"
          value={String(stats.cashPointCount)}
          hint="Payouts & cash send"
          tone="amber"
          icon={<Banknote className="w-4 h-4" />}
        />
        <StatTile
          label="Volume logged"
          value={formatCurrency(stats.totalVolume, currencySymbol)}
          hint={stats.refunded > 0 ? `${stats.refunded} refund(s)` : "Gross recorded"}
          tone="teal"
        />
      </div>

      <div className="arch-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {channelTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setChannelFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer ${
                  channelFilter === tab.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, customer, method…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Summary</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                    No orders match your filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const isExpanded = expandedId === row.id;
                  const hasDetail =
                    (row.items?.length ?? 0) > 0 || (row.detailLines?.length ?? 0) > 0;
                  return (
                    <Fragment key={row.id}>
                      <tr className="hover:bg-slate-50/80 transition-colors text-sm">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-slate-800">
                          {row.id}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
                            <ChannelIcon channel={row.channel} />
                            {channelLabel(row.channel)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate">
                          {row.summary}
                          {row.customer && (
                            <span className="block text-[10px] text-slate-400 font-bold mt-0.5 truncate">
                              {row.customer}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-black text-slate-900">
                          {formatCurrency(row.amount, currencySymbol)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-500">
                          {row.source}
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">
                          {row.timestamp}
                        </td>
                        <td className="px-4 py-3">
                          {hasDetail && (
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : row.id)}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
                              title="Details"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && hasDetail && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={8} className="px-4 py-3">
                            <div className="flex flex-wrap gap-4 text-xs">
                              {row.paymentMethod && (
                                <span className="font-bold text-slate-500">
                                  Method:{" "}
                                  <span className="text-slate-800">{row.paymentMethod}</span>
                                </span>
                              )}
                              {row.detailLines && (
                                <ul className="space-y-1 text-slate-600">
                                  {row.detailLines.map((line, idx) => (
                                    <li key={idx}>{line}</li>
                                  ))}
                                </ul>
                              )}
                              {row.items && (
                                <ul className="space-y-1">
                                  {row.items.map((item, idx) => (
                                    <li key={idx} className="text-slate-600">
                                      <span className="font-bold">{item.productName}</span>
                                      {" × "}
                                      {item.qty}
                                      {" — "}
                                      {formatCurrency(
                                        item.unitPrice * item.qty,
                                        currencySymbol
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
