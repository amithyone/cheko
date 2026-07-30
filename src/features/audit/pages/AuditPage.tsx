import React, { useState } from "react";
import { 
  ShieldCheck, 
  HelpCircle, 
  RefreshCw, 
  TrendingUp, 
  Lock, 
  Unlock, 
  Award,
  DollarSign, 
  Landmark, 
  CreditCard, 
  Calculator,
  Printer,
  ChevronRight,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  Users2
} from "lucide-react";
import { useNotice } from "@/context/NoticeContext";
import type { TerminalAudit, Transaction, UserRole } from "@/types";

interface AuditPageProps {
  userRole: UserRole;
  currencySymbol: string;
  terminalAudits: TerminalAudit[];
  setTerminalAudits: React.Dispatch<React.SetStateAction<TerminalAudit[]>>;
  transactions: Transaction[];
}

export default function AuditPage({
  userRole,
  currencySymbol,
  terminalAudits,
  setTerminalAudits,
  transactions
}: AuditPageProps) {
  const notice = useNotice();
  // Local states for inputs
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>("term-4");
  const [actualCashTenderedInput, setActualCashTenderedInput] = useState<string>("");
  const [auditMessage, setAuditMessage] = useState<string>("");
  const [auditSuccess, setAuditSuccess] = useState<boolean | null>(null);

  const selectedTerminal = terminalAudits.find(t => t.id === selectedTerminalId) || terminalAudits[3];

  // Store Manager computed global details
  const totalCashDrawerAll = terminalAudits.reduce((acc, t) => acc + t.cashDrawer, 0);
  const totalBankTransferAll = terminalAudits.reduce((acc, t) => acc + t.bankTransfer, 0);
  const totalCardNfcAll = terminalAudits.reduce((acc, t) => acc + t.cardNfc, 0);
  const totalEcosystemSalesAll = terminalAudits.reduce((acc, t) => acc + t.totalSales, 0);

  const handlePerformAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const cashReported = parseFloat(actualCashTenderedInput);
    if (isNaN(cashReported) || cashReported < 0) {
      setAuditMessage("Please input a valid physical cash tender amount format.");
      setAuditSuccess(false);
      return;
    }

    const diff = cashReported - selectedTerminal.cashDrawer;
    let finalStatus: "RECONCILED" | "OUT_OF_BALANCE" = "RECONCILED";
    
    // Allow up to a ₦10/dollar slight rounding variation, otherwise flag out of balance
    if (Math.abs(diff) > 10) {
      finalStatus = "OUT_OF_BALANCE";
    }

    setTerminalAudits(prev => prev.map(term => {
      if (term.id === selectedTerminal.id) {
        return {
          ...term,
          status: finalStatus,
          reconciliationChecked: true,
          actualCashReported: cashReported
        };
      }
      return term;
    }));

    if (finalStatus === "RECONCILED") {
      setAuditMessage(`Reconciliation completed. terminal balance matches within compliant variance protocols (Diff: ${currencySymbol}${diff.toFixed(2)}).`);
      setAuditSuccess(true);
    } else {
      setAuditMessage(`Audit ALERT: Variance spike detected! Cash Drawer mismatch of ${currencySymbol}${diff.toFixed(2)}. Logged to corporate security ledger.`);
      setAuditSuccess(false);
    }
    setActualCashTenderedInput("");
  };

  const handleResetAudit = (terminalId: string) => {
    setTerminalAudits(prev => prev.map(term => {
      if (term.id === terminalId) {
        return {
          ...term,
          status: "ONLINE",
          reconciliationChecked: false,
          actualCashReported: undefined
        };
      }
      return term;
    }));
    setAuditMessage("");
    setAuditSuccess(null);
  };

  // Switch terminal helper for Managers
  const handleSelectTerminal = (id: string) => {
    setSelectedTerminalId(id);
    setAuditMessage("");
    setAuditSuccess(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Banner Card */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-850 to-indigo-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FileCheck2 className="w-48 h-48 animate-pulse text-indigo-400" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-white/10 rounded-full font-mono text-[10px] uppercase font-bold tracking-widest text-primary">
              Daily Finance & Audit Log Protocol
            </span>
            <h2 className="font-display font-extrabold text-3xl tracking-tight">
              {userRole === "Store Manager" ? "Master Ecosystem Audit Ledger" : "Operator Session Balancing Checkout"}
            </h2>
            <p className="text-sm text-slate-350 max-w-xl font-medium font-sans">
              {userRole === "Store Manager"
                ? "Global monitoring of cash drawer balancing counters, instant direct transfers ledger, card validation pools, and terminal drift."
                : "Complete your shift balancing check. Input precise cash receipts counted in your register drawer below."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`p-4 rounded-2xl ${userRole === "Store Manager" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-primary/10 text-primary border border-primary/20"}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Clearance</p>
              <p className="text-xs font-bold font-mono">{userRole}</p>
            </div>
          </div>
        </div>
      </div>

      {/* manager summary bento grid or Sales Rep summary */}
      {userRole === "Store Manager" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-405 font-bold uppercase tracking-wider font-sans">Total Balanced Sales</span>
              <Award className="w-5 h-5 text-indigo-505 text-primary" />
            </div>
            <p className="font-display text-2xl font-black text-slate-900">{currencySymbol}{totalEcosystemSalesAll.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-bold">Summed across all active terminals</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-405 font-bold uppercase tracking-wider font-sans">Cash in Drawers Pool</span>
              <DollarSign className="w-5 h-5 text-emerald-505 text-emerald-600" />
            </div>
            <p className="font-display text-2xl font-black text-emerald-600">{currencySymbol}{totalCashDrawerAll.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-bold">Physical coins & bills in registers</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-405 font-bold uppercase tracking-wider font-sans">Total Wire Transfers</span>
              <Landmark className="w-5 h-5 text-blue-505 text-blue-600" />
            </div>
            <p className="font-display text-2xl font-black text-blue-600">{currencySymbol}{totalBankTransferAll.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-bold">Confirmed bank clearance logs</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-405 font-bold uppercase tracking-wider font-sans">Merchant Card / NFC</span>
              <CreditCard className="w-5 h-5 text-purple-505 text-purple-600" />
            </div>
            <p className="font-display text-2xl font-black text-purple-600">{currencySymbol}{totalCardNfcAll.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-bold">Stripe/Adyen payment gateways</p>
          </div>

        </div>
      ) : (
        /* Operator Rep specific summary */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm col-span-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">LANE RECONCILIATION TARGET</span>
              <span className="px-2.5 py-1 text-[9px] font-bold bg-amber-100 text-amber-800 rounded-full">ACTIVE SESSION</span>
            </div>
            <p className="font-display text-3xl font-black text-slate-900">{currencySymbol}{selectedTerminal.totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium font-sans">
              Current expected drift count for <span className="font-bold underline">{selectedTerminal.name}</span> shift.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">Drawer Money-In-Cash</p>
            <p className="font-display text-xl font-bold mt-1 text-slate-800">{currencySymbol}{selectedTerminal.cashDrawer.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <span className="text-[9px] text-slate-400 font-bold">Physical money counted expected</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">Non-Cash (Bank Transfer + Card)</p>
            <p className="font-display text-xl font-bold mt-1 text-slate-800">{currencySymbol}{(selectedTerminal.bankTransfer + selectedTerminal.cardNfc).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <span className="text-[9px] text-slate-400 font-bold">Handled automatically by network</span>
          </div>
        </div>
      )}

      {/* Main split dashboard zone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Terminals list - Store manager can click all, Sales Rep only sees Terminal 04 */}
        <div className="col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-display font-black text-base text-slate-800 flex items-center gap-2">
              <Users2 className="w-5 h-5 text-slate-500" />
              Lanes & Operators
            </h3>
            {userRole === "Store Manager" && (
              <span className="text-[9px] bg-indigo-50 text-primary font-bold px-2 py-0.5 rounded-full uppercase">All Active</span>
            )}
          </div>

          <div className="space-y-3">
            {terminalAudits.map((term) => {
              // Hide other terminals from the typical Sales Rep view
              const isMine = term.id === "term-4";
              if (userRole === "Sales Rep" && !isMine) return null;
              if (userRole === "Cash Point Officer" && !isMine) return null;

              const isSelected = selectedTerminalId === term.id;
              
              let badgeBg = "bg-slate-100 text-slate-600";
              let termStatusLabel: string = term.status;
              if (term.status === "ONLINE") {
                badgeBg = "bg-emerald-50 text-emerald-700 animate-pulse border border-emerald-100";
                termStatusLabel = "Active Live";
              } else if (term.status === "RECONCILED") {
                badgeBg = "bg-blue-50 text-blue-700 border border-blue-100";
                termStatusLabel = "Verified Auto";
              } else if (term.status === "OUT_OF_BALANCE") {
                badgeBg = "bg-rose-50 text-rose-700 border border-rose-100";
                termStatusLabel = "Drift Warning";
              }

              return (
                <div
                  key={term.id}
                  onClick={() => userRole === "Store Manager" && handleSelectTerminal(term.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    userRole === "Store Manager" ? "cursor-pointer" : "cursor-default"
                  } ${
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-slate-150 bg-white hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold text-slate-800 font-sans">{term.name}</p>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeBg}`}>
                      {termStatusLabel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                    <span>Cashier: <strong className="text-slate-600 font-semibold">{term.operator}</strong></span>
                    <span className="font-display font-medium text-slate-700">{currencySymbol}{term.totalSales.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                  </div>

                  {/* Tiny progress bars representing method money split */}
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100/60 flex gap-2 text-[9px] font-semibold text-slate-500 font-sans">
                    <div className="flex-1">
                      <div className="flex justify-between text-[8px] mb-0.5 font-bold uppercase text-slate-400">
                        <span>Cash Drawer</span>
                        <span>{currencySymbol}{term.cashDrawer.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, (term.cashDrawer / (term.totalSales || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-[8px] mb-0.5 font-bold uppercase text-slate-400">
                        <span>Wire/Bank</span>
                        <span>{currencySymbol}{term.bankTransfer.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, (term.bankTransfer / (term.totalSales || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Form & Money-In details */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          
          {/* Active Audit workspace details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h3 className="font-display font-black text-slate-800 text-base">
                  Reconciliation Workspace: {selectedTerminal.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium font-sans">
                  Assigned operator: <span className="underline font-bold text-slate-600">{selectedTerminal.operator}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <span className="p-1 px-3 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  ID: #{selectedTerminal.id}
                </span>
              </div>
            </div>

            {/* Split detailed columns breakdown for Money-in channels representing User requirements strictly */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
              
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-[10px] font-bold uppercase tracking-wide">Cash Drawer</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="font-display text-xl font-black text-slate-900 leading-tight">
                  {currencySymbol}{selectedTerminal.cashDrawer.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <div className="text-[9px] text-slate-400 font-medium font-sans">
                  Collected in tactile drawer. Requires manager count audit.
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-[10px] font-bold uppercase tracking-wide">Instant Wire / Transfers</span>
                  <Landmark className="w-4 h-4 text-blue-600" />
                </div>
                <p className="font-display text-xl font-black text-slate-900 leading-tight">
                  {currencySymbol}{selectedTerminal.bankTransfer.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <div className="text-[9px] text-slate-400 font-medium font-sans">
                  Direct wire clearances. Reconciled automatically by Bank API node.
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-[10px] font-bold uppercase tracking-wide">Visa/NFC Gateway</span>
                  <CreditCard className="w-4 h-4 text-purple-600" />
                </div>
                <p className="font-display text-xl font-black text-slate-900 leading-tight">
                  {currencySymbol}{selectedTerminal.cardNfc.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <div className="text-[9px] text-slate-400 font-medium font-sans">
                  Card processors pipeline balance. Cleared over secure mesh network.
                </div>
              </div>

            </div>

            {/* Reconciliation Process Box */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-primary" />
                Shift End Ledger Declaration Entry
              </h4>

              {selectedTerminal.reconciliationChecked ? (
                <div className="space-y-4 font-sans">
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wide">Terminal Shift Audited successfully</p>
                      <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                        Expected drawer: <strong className="font-bold">{currencySymbol}{selectedTerminal.cashDrawer.toFixed(2)}</strong> | Reported drawer: <strong className="font-bold">{currencySymbol}{selectedTerminal.actualCashReported?.toFixed(2)}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResetAudit(selectedTerminal.id)}
                      className="px-4 py-2 border text-slate-600 border-slate-250 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs transition-all cursor-pointer"
                    >
                      Reset & Re-audit Session
                    </button>
                    <button
                      onClick={() =>
                        notice.showSuccess(
                          "Report sent to thermal POS printer.",
                          "Print complete"
                        )
                      }
                      className="px-4 py-2 bg-slate-905 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Certification
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePerformAudit} className="space-y-4 font-sans">
                  <p className="text-xs text-slate-500 font-medium">
                    To perform an **End-of-Day reconciliation**, count the physical banknotes inside the actual register drawer and input the total figure sum below:
                  </p>
                  
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Physical Cash Count in Drawer ({currencySymbol})</label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-display text-sm font-bold">
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={actualCashTenderedInput}
                          onChange={(e) => setActualCashTenderedInput(e.target.value)}
                          placeholder={`e.g. ${selectedTerminal.cashDrawer}`}
                          className="pl-8 pr-4 py-2.5 w-full bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/10"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-sm shrink-0 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" /> Validate Shift Balance
                      </button>
                    </div>
                  </div>

                  {auditMessage && (
                    <div className={`p-4 rounded-xl text-xs font-bold leading-relaxed border ${
                      auditSuccess 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}>
                      <div className="flex items-start gap-2">
                        {auditSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                        <p>{auditMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Smart shortcut helper simulation tag */}
                  <div className="pt-2 text-[10px] text-slate-400 font-medium flex gap-2 items-center">
                    <span>* Simulation shortcut:</span>
                    <button 
                      type="button" 
                      onClick={() => setActualCashTenderedInput(selectedTerminal.cashDrawer.toString())}
                      className="text-primary hover:underline font-bold"
                    >
                      Exact Match ({currencySymbol}{selectedTerminal.cashDrawer.toFixed(2)})
                    </button>
                    <span className="text-slate-200">|</span>
                    <button 
                      type="button" 
                      onClick={() => setActualCashTenderedInput((selectedTerminal.cashDrawer - 45).toString())}
                      className="text-rose-500 hover:underline font-bold"
                    >
                      Variance Mismatch (-₦45.00)
                    </button>
                  </div>
                </form>
              )}

            </div>

          </div>

          {/* Core ledger sync telemetry info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h4 className="font-display font-extrabold text-sm text-slate-800 mb-3">POS Audit Log history & Central Bank Sync Logs</h4>
            <div className="space-y-3 font-sans text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <p className="font-bold text-slate-800">Direct Wire Transfer clearing node</p>
                    <p className="text-[10px] text-slate-400">Inter-node clearance verified with central systems</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] bg-slate-200/60 px-2 py-0.5 rounded text-slate-600 font-semibold font-sans">STATUS: OK</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <p className="font-bold text-slate-800">Tap-To-Pay NFC contactless terminal keys</p>
                    <p className="text-[10px] text-slate-400">Card tokenization rotation active (256-bit payload)</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] bg-slate-200/60 px-2 py-0.5 rounded text-slate-600 font-semibold font-sans">STATUS: ACTIVE</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
