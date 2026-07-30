import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight,
  Calculator,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  BadgeCent,
  TrendingDown,
  Clock,
  ExternalLink,
  ChevronRight,
  Database,
  Building2,
  Lock
} from "lucide-react";
import { Store, Transaction } from "@/types";
import { TerminalAudit } from "@/types";
import { useNotice } from "@/context/NoticeContext";

interface DashboardViewProps {
  stores: Store[];
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
  transactions: Transaction[];
  totalEcosystemRevenue: number;
  currencySymbol: string;
  terminalAudits: TerminalAudit[];
  setTerminalAudits: React.Dispatch<React.SetStateAction<TerminalAudit[]>>;
}

interface DisputeTicket {
  id: string;
  terminal: string;
  type: "OVERCHARGE" | "REFUND";
  description: string;
  amount: number;
  status: "PENDING" | "RESOLVED";
  timestamp: string;
}

export default function DashboardView({ 
  stores, 
  setStores, 
  transactions, 
  totalEcosystemRevenue,
  currencySymbol,
  terminalAudits,
  setTerminalAudits
}: DashboardViewProps) {
  const notice = useNotice();
  const [reconnectingStoreId, setReconnectingStoreId] = useState<string | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<"hourly" | "method_distribution">("hourly");
  
  // Simulated overcharge & refund disputes workspace
  const [disputes, setDisputes] = useState<DisputeTicket[]>([
    {
      id: "disp-101",
      terminal: "Terminal 01",
      type: "OVERCHARGE",
      description: "Double scan item (Irish Bread)",
      amount: 45.00,
      status: "PENDING",
      timestamp: "10:42 AM"
    },
    {
      id: "disp-102",
      terminal: "Terminal 03",
      type: "REFUND",
      description: "Customer paid over expected index cash",
      amount: 120.00,
      status: "PENDING",
      timestamp: "11:05 AM"
    },
    {
      id: "disp-103",
      terminal: "Terminal 04",
      type: "OVERCHARGE",
      description: "NFC Reader double token latency",
      amount: 85.50,
      status: "PENDING",
      timestamp: "11:32 AM"
    }
  ]);

  // Simulated tips accumulators
  const [tipsPool, setTipsPool] = useState<number>(3482.50);

  // Computed live metrics from real audits state
  const cashOnDrawers = terminalAudits.reduce((acc, t) => acc + t.cashDrawer, 0);
  const moneyInBank = terminalAudits.reduce((acc, t) => acc + t.bankTransfer, 0) + 450000; // base deposit + live wire updates
  const cardGatewayBalance = terminalAudits.reduce((acc, t) => acc + t.cardNfc, 0);

  // Compute pending state parameters
  const pendingOverchargesCount = disputes.filter(d => d.type === "OVERCHARGE" && d.status === "PENDING").length;
  const pendingRefundsCount = disputes.filter(d => d.type === "REFUND" && d.status === "PENDING").length;

  // Resolve Dispute Ticket Handler
  const handleResolveDispute = (id: string, actionType: "APPROVE_REFUND" | "REJECT") => {
    const ticket = disputes.find(d => d.id === id);
    if (!ticket) return;

    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: "RESOLVED" } : d));

    if (actionType === "APPROVE_REFUND") {
      // If of Type OVERCHARGE or REFUND, we logically refund the cash back to client pool, decreasing active revenue
      notice.showSuccess(
        `Ticket ${id} resolved for ${currencySymbol}${ticket.amount.toFixed(2)}. Customer account corrected.`,
        "Refund authorized"
      );
      
      // Update cash drawer or bank transfers to simulate physical payouts if REFUND
      if (ticket.type === "REFUND") {
        setTerminalAudits(prev => prev.map(term => {
          if (term.id === "term-4") {
            return {
              ...term,
              cashDrawer: Math.max(0, term.cashDrawer - ticket.amount),
              totalSales: term.totalSales - ticket.amount
            };
          }
          return term;
        }));
      }
    } else {
      notice.showInfo(
        `Ticket ${id} tagged for secondary corporate review.`,
        "Dispute rejected"
      );
    }
  };

  const handleReconnectStore = (storeId: string) => {
    setReconnectingStoreId(storeId);
    setTimeout(() => {
      setStores(prev => 
        prev.map(s => s.id === storeId ? { ...s, status: "ONLINE", latencyMs: Math.floor(Math.random() * 30) + 10 } : s)
      );
      setReconnectingStoreId(null);
    }, 1250);
  };

  const handleStoreClick = (storeId: string) => {
    setStores(prev =>
      prev.map(s => {
        if (s.id === storeId && s.status === "ONLINE") {
          return { ...s, latencyMs: Math.floor(Math.random() * 60) + 8 };
        }
        return s;
      })
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Reorganized Telemetry & Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Core Bank Settlement balance info card */}
        <div id="telemetry-bank-card" className="bg-white border border-slate-205 border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-350 transition-all min-w-0">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Money in Bank</span>
            <Building2 className="w-4 h-4 text-blue-600 animate-pulse" />
          </div>
          <div>
            <h2 id="bank-balance-title" className="font-display text-base sm:text-lg lg:text-xl font-black text-slate-900 leading-tight truncate">
              {currencySymbol}{moneyInBank.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
              Central settlement Node
            </p>
          </div>
        </div>

        {/* Cash in Drawers Pool dynamic accumulator card */}
        <div id="telemetry-cash-card" className="bg-white border border-slate-205 border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-350 transition-all min-w-0">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Cash on Drawers</span>
            <Calculator className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 id="cash-balance-title" className="font-display text-base sm:text-lg lg:text-xl font-black text-emerald-600 leading-tight truncate">
              {currencySymbol}{cashOnDrawers.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
              Summed cash register tills
            </p>
          </div>
        </div>

        {/* Dedicated tips tracker card */}
        <div id="telemetry-tips-card" className="bg-white border border-slate-205 border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-350 transition-all min-w-0">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Accumulated Tips</span>
            <BadgeCent className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h2 id="tips-balance-title" className="font-display text-base sm:text-lg lg:text-xl font-black text-slate-800 leading-tight truncate">
              {currencySymbol}{tipsPool.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wider flex gap-1 items-center">
              <button 
                onClick={() => {
                  setTipsPool(0);
                  notice.showSuccess(
                    "Tips pool cleared and dispatched to cashier wallets.",
                    "Tips distributed"
                  );
                }} 
                className="text-primary hover:underline text-[9px] font-extrabold uppercase outline-none"
              >
                Dispatch tips
              </button>
            </p>
          </div>
        </div>

        {/* Pending overcharge alert notifications tracker */}
        <div id="telemetry-overcharges-card" className="bg-white border border-slate-210 border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-350 transition-all min-w-0">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Overcharges Pending</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <h2 id="overcharges-count-title" className={`font-display text-base sm:text-lg lg:text-xl font-black leading-tight truncate ${pendingOverchargesCount > 0 ? "text-rose-600" : "text-slate-800"}`}>
              {pendingOverchargesCount} {pendingOverchargesCount === 1 ? "alert" : "alerts"}
            </h2>
            <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
              Double-scan dispute items
            </p>
          </div>
        </div>

      </div>

      {/* Main information zone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: System Status lights + High-Fidelity Informative Chart Workspace */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status of Everything LED layout */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
              Real-Time Core System Status Node
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
              <div className="p-3 bg-slate-50 border rounded-xl flex flex-col justify-between gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[10px] uppercase">Ecosystem Core</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
                </div>
                <p className="font-bold text-slate-800 text-[11px] mt-1">ONLINE / SYNCHRONAL</p>
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl flex flex-col justify-between gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[10px] uppercase">Postgres DB pool</span>
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="font-bold text-slate-800 text-[11px] mt-1">14 CONNS ACTIVE</p>
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl flex flex-col justify-between gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[10px] uppercase">Visa/NFC Gateway</span>
                  <Lock className="w-3.5 h-3.5 text-indigo-650 text-indigo-500" />
                </div>
                <p className="font-bold text-slate-800 text-[11px] mt-1">KEY TRUST ROTATING</p>
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl flex flex-col justify-between gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[10px] uppercase">Audit Ledger Integrity</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <p className="font-bold text-slate-800 text-[11px] mt-1">0 DRIFT ENFORCED</p>
              </div>
            </div>
          </div>

          {/* Core Interactive Graph Area (Informative Replacement) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[390px]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h3 className="font-display font-black text-slate-800 text-base">Ecosystem Sales Flow & Density Analyzer</h3>
                <p className="text-xs text-slate-400 font-medium">Visualizing live transaction queues & currency splits</p>
              </div>

              <div className="flex bg-slate-100 p-0.5 rounded-lg border">
                <button
                  onClick={() => setActiveChartTab("hourly")}
                  className={`px-3 py-1 rounded text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                    activeChartTab === "hourly" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Hourly Receipt Stream
                </button>
                <button
                  onClick={() => setActiveChartTab("method_distribution")}
                  className={`px-3 py-1 rounded text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                    activeChartTab === "method_distribution" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Payment Splits Density
                </button>
              </div>
            </div>

            {/* Render informative visual graphs */}
            <div className="flex-1 min-h-[220px] relative flex items-center justify-center pt-4">
              {activeChartTab === "hourly" ? (
                /* Beautiful dual-curve high fidelity mockup */
                <div className="w-full h-full flex flex-col justify-between">
                  {/* High contrast custom vector graph plotting real trends */}
                  <div className="relative w-full h-44 bg-slate-50/50 rounded-2xl border border-dotted border-slate-200 overflow-hidden">
                    
                    {/* Y-axis metrics markings */}
                    <div className="absolute left-3 top-3 text-[8px] font-extrabold text-slate-400 font-mono">
                      {currencySymbol}100,000 / hr
                    </div>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[8px] font-extrabold text-slate-400 font-mono">
                      {currencySymbol}50,000 / hr
                    </div>
                    <div className="absolute left-3 bottom-3 text-[8px] font-extrabold text-slate-400 font-mono">
                      {currencySymbol}0 / hr
                    </div>

                    <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="curve1" x1="0" x2="0" y1="y1" y2="1">
                          <stop offset="0%" stopColor="#1978e5" stopOpacity="0.15"></stop>
                          <stop offset="100%" stopColor="#1978e5" stopOpacity="00"></stop>
                        </linearGradient>
                        <linearGradient id="curve2" x1="0" x2="0" y1="y1" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.15"></stop>
                          <stop offset="100%" stopColor="#10b981" stopOpacity="00"></stop>
                        </linearGradient>
                      </defs>
                      {/* Grid wires */}
                      <line x1="0" y1="37" x2="500" y2="37" stroke="#e2e8f0" strokeDasharray="3 3" />
                      <line x1="0" y1="75" x2="500" y2="75" stroke="#e2e8f0" strokeDasharray="3 3" />
                      <line x1="0" y1="112" x2="500" y2="112" stroke="#e2e8f0" strokeDasharray="3 3" />
                      
                      {/* Blue Line: Manager Target Sales */}
                      <path 
                        d="M0,130 C100,110 120,40 200,60 C280,80 320,10 400,30 C450,40 480,80 500,90" 
                        fill="none" 
                        stroke="#1978e5" 
                        strokeLinecap="round" 
                        strokeWidth="3.5"
                      />
                      <path 
                        d="M0,130 C100,110 120,40 200,60 C280,80 320,10 400,30 C450,40 480,80 500,90 L500,150 L0,150 Z" 
                        fill="url(#curve1)"
                      />

                      {/* Green Line: Active Physical cash Receipts inside terminals */}
                      <path 
                        d="M0,140 C80,135 150,70 230,80 C310,90 340,30 420,50 C460,60 485,110 500,120" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeLinecap="round" 
                        strokeWidth="2.5"
                      />
                      <path 
                        d="M0,140 C80,135 150,70 230,80 C310,90 340,30 420,50 C460,60 485,110 500,120 L500,150 L0,150 Z" 
                        fill="url(#curve2)"
                      />
                    </svg>
                  </div>

                  {/* Legends and coordinate points descriptions */}
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 font-mono select-none px-2 mt-2">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-primary rounded"></span> Central bank stream</span>
                    <span>10:30 AM</span>
                    <span>12:45 PM</span>
                    <span>03:15 PM</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-emerald-500 rounded"></span> Terminal Cash drawer split</span>
                  </div>
                </div>
              ) : (
                /* Dynamic currency payment gate distribution splits visual charts representation */
                <div className="w-full space-y-4 font-sans text-xs">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Physical Coin Cash (Tendered to drawers directly)</span>
                        <span>{currencySymbol}{cashOnDrawers.toLocaleString("en-US", { maximumFractionDigits: 0 })} ({((cashOnDrawers / (totalEcosystemRevenue || 1)) * 10).toFixed(1)}%)</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-lg overflow-hidden flex">
                        <div className="bg-emerald-500 h-full rounded-l-lg transition-all duration-1000" style={{ width: `${Math.min(100, (cashOnDrawers / (totalEcosystemRevenue || 1)) * 340)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Central Bank Wire settlement Network</span>
                        <span>{currencySymbol}{moneyInBank.toLocaleString("en-US", { maximumFractionDigits: 0 })} ({((moneyInBank / (totalEcosystemRevenue || 1)) * 100).toFixed(1)}%)</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-lg overflow-hidden">
                        <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${Math.min(100, (moneyInBank / (totalEcosystemRevenue || 1)) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Contactless Card / NFC gateway processing</span>
                        <span>{currencySymbol}{cardGatewayBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })} ({((cardGatewayBalance / (totalEcosystemRevenue || 1)) * 10).toFixed(1)}%)</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-lg overflow-hidden">
                        <div className="bg-purple-600 h-full transition-all duration-1000" style={{ width: `${Math.min(100, (cardGatewayBalance / (totalEcosystemRevenue || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-semibold italic text-center text-sans mt-2">
                    * Interactive channels balanced according to real-time physical tills audits. No software discrepancies detected within POS network.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100/60 text-xs text-slate-400 font-bold flex justify-between items-center select-none bg-slate-50/50 -mx-6 -mb-6 p-4 rounded-b-3xl">
              <span>Updated: Just Now (Auto)</span>
              <button 
                onClick={() =>
                  notice.showInfo(
                    "Printing active terminal audit ledger summaries…",
                    "Print queued"
                  )
                }
                className="text-primary hover:underline uppercase flex items-center gap-1 font-extrabold text-[10px]"
              >
                Export Matrix Dataset <ExternalLink className="w-3 h-3" />
              </button>
            </div>

          </div>

        </div>

        {/* Right Side Column (1 column) */}
        <div className="col-span-1 space-y-6">
          
          {/* Dedicated Overcharges & Refunds dispute desk */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
            <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-display font-black text-slate-850 text-slate-800 text-sm">Disputes & Refund Desk</h3>
                <p className="text-[10px] text-slate-405 font-bold uppercase tracking-wider mt-0.5">Manager keys authorization</p>
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-805 font-extrabold px-2.5 py-1 rounded-full border border-amber-100">
                {disputes.filter(d => d.status === "PENDING").length} active
              </span>
            </div>

            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[250px] pr-1 mt-2 menu-scroll">
              {disputes.filter(d => d.status === "PENDING").map((disp) => {
                const isOvercharge = disp.type === "OVERCHARGE";
                return (
                  <div key={disp.id} className="py-3 flex flex-col gap-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            isOvercharge ? "bg-red-50 text-rose-600 border border-red-105" : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                          }`}>
                            {disp.type}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">{disp.terminal}</span>
                        </div>
                        <p className="font-sans font-bold text-slate-700 text-[11px] mt-1 italic">
                          " {disp.description} "
                        </p>
                      </div>
                      <span className="font-display font-black text-slate-800 text-xs">
                        {currencySymbol}{disp.amount.toFixed(2)}
                      </span>
                    </div>

                    {/* Authorized decisions triggers */}
                    <div className="flex gap-2 justify-end text-[9px] font-black uppercase">
                      <button
                        onClick={() => handleResolveDispute(disp.id, "REJECT")}
                        className="py-1 px-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded"
                      >
                        File Reject
                      </button>
                      <button
                        onClick={() => handleResolveDispute(disp.id, "APPROVE_REFUND")}
                        className="py-1 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded shadow-sm"
                      >
                        {isOvercharge ? "Authorize Refund" : "Approve Payout"}
                      </button>
                    </div>
                  </div>
                );
              })}

              {disputes.filter(d => d.status === "PENDING").length === 0 && (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold font-sans">All sales dispute tickets cleared.</p>
                </div>
              )}
            </div>
          </div>

          {/* Store Connectivity Status */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col shadow-sm">
            <h3 className="font-display text-sm font-black text-slate-800 mb-4 flex items-center justify-between uppercase tracking-widest">
              <span>Store Terminal Nodes</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 rounded-full border border-slate-100 text-slate-500 uppercase">
                4 total nodes
              </span>
            </h3>

            <div className="space-y-3">
              {stores.map((store) => {
                const isConnecting = reconnectingStoreId === store.id;
                return (
                  <div 
                    key={store.id} 
                    onClick={() => handleStoreClick(store.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      store.status === "ONLINE" 
                        ? "bg-slate-50/50 hover:bg-slate-50 border-slate-150" 
                        : "bg-red-50/40 hover:bg-red-50/60 border-red-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-2 h-2 rounded-full ${store.status === "ONLINE" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500 animate-pulse"}`} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-800">{store.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          {store.status === "ONLINE" ? `Latency: ${store.latencyMs}ms` : "Reconnecting..."}
                        </p>
                      </div>
                    </div>

                    <div>
                      {store.status === "ONLINE" ? (
                        <Wifi className="w-4 h-4 text-slate-300" />
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReconnectStore(store.id);
                          }}
                          disabled={isConnecting}
                          className="px-2 py-1 bg-red-100 hover:bg-red-200 transition-colors rounded text-[9px] font-bold text-red-700 uppercase tracking-widest flex items-center gap-1"
                        >
                          {isConnecting ? (
                            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <WifiOff className="w-2.5 h-2.5" />
                          )}
                          Reconnect
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Live Transaction Feed at Bottom */}
      <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
        <div className="pb-4 border-b border-slate-100 flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="font-display font-black text-slate-800 text-base">Ecosystem Terminal Audit Stream</h3>
            <p className="text-xs text-slate-400 font-medium">Verified stream of cashier journal entries</p>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-widest">
            <span className="w-1 h-1 rounded-full bg-primary animate-pulse"></span>
            Streaming live journal entries
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {transactions.map((tx) => (
            <div 
              key={tx.id} 
              className="flex items-center gap-3.5 p-3.5 hover:bg-slate-50/50 transition-colors rounded-xl border border-slate-150/40"
            >
              <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-600 text-xs">
                {currencySymbol}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-1 font-sans">
                  <p className="font-bold text-xs text-slate-800 truncate">{tx.productName}</p>
                  <p className="font-display text-xs font-black text-slate-900">{currencySymbol}{tx.amount.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 font-mono">
                  <span>{tx.terminalName}</span>
                  <span>{tx.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
