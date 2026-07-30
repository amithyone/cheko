import React, { useState } from "react";
import { 
  DollarSign, 
  Settings, 
  ShieldCheck, 
  Store,
  Check,
  RefreshCw,
  Terminal,
  Hand,
} from "lucide-react";
import { BusinessType, StaffAccount, TerminalAudit } from "@/types";
import { BUSINESS_TYPE_OPTIONS } from "@/shared/utils/business-types";
import { InteractionModeToggle } from "@/shared/ui";
import { useInteractionMode } from "@/context/InteractionModeContext";
import { DesignerCredit } from "@/shared/layout/DesignerCredit";
import { AccountManagerPanel } from "../components/AccountManagerPanel";
import { PaymentProviderPanel } from "../components/PaymentProviderPanel";
import { DesktopHardwarePanel } from "../components/DesktopHardwarePanel";

interface SettingsViewProps {
  currencySymbol: string;
  setCurrencySymbol: (symbol: string) => void;
  businessType: BusinessType;
  setBusinessType: (type: BusinessType) => void;
  staffAccounts: StaffAccount[];
  setStaffAccounts: React.Dispatch<React.SetStateAction<StaffAccount[]>>;
  terminalAudits: TerminalAudit[];
  setTerminalAudits: React.Dispatch<React.SetStateAction<TerminalAudit[]>>;
}

export default function SettingsView({
  currencySymbol,
  setCurrencySymbol,
  businessType,
  setBusinessType,
  staffAccounts,
  setStaffAccounts,
  terminalAudits,
  setTerminalAudits,
}: SettingsViewProps) {
  const { mode, isTouch } = useInteractionMode();
  const [managerCode, setManagerCode] = useState("MG-9941");
  const [hardwareTerminal, setHardwareTerminal] = useState("mevon-04a-NFC");
  const [taxRateSetting, setTaxRateSetting] = useState(8.5);
  const [successToast, setSuccessToast] = useState("");

  const displayPresets = [
    { symbol: "₦", name: "Nigerian Naira (NGN)", country: "Nigeria" },
    { symbol: "$", name: "US Dollar (USD)", country: "United States" },
    { symbol: "€", name: "Euro (EUR)", country: "European Union" },
    { symbol: "£", name: "British Pound (GBP)", country: "United Kingdom" },
    { symbol: "¥", name: "Yen / Yuan", country: "Japan / China" },
    { symbol: "₵", name: "Ghanaian Cedi (GHS)", country: "Ghana" },
    { symbol: "₹", name: "Indian Rupee (INR)", country: "India" },
  ];

  const handleApplyPreset = (symbol: string) => {
    setCurrencySymbol(symbol);
    showToast(`Currency symbol successfully updated to ${symbol}`);
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast("");
    }, 4000);
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-850 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 z-50 animate-bounce">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold font-sans tracking-wide">{successToast}</span>
        </div>
      )}

      {/* Hero Welcome banner */}
      <div className="bg-gradient-to-r from-primary to-primary-hover p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Settings className="w-48 h-48 animate-spin" style={{ animationDuration: "25s" }} />
        </div>
        <span className="px-3 py-1 bg-white/10 rounded-full font-mono text-[10px] uppercase font-bold tracking-widest text-white/90">
          Terminal ID: #{hardwareTerminal}
        </span>
        <h2 className="font-display font-extrabold text-3xl tracking-tight mt-3 mb-1.5">
          Manager Console
        </h2>
        <p className="text-sm text-white/80 max-w-xl font-medium">
          Configure multi-location localization variables, active registry rules, tax settings, and peripheral terminal configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Localization & Currency presets */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display font-bold text-base text-slate-800 mb-2 flex items-center gap-2">
              <Hand className="w-5 h-5 text-primary" />
              Interaction mode
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-4">
              Switch between compact mouse layout and large touch targets for kiosks, tablets, and front-desk terminals.
              Hotel check-in, flight booking, and service modals scale automatically in touch mode.
            </p>
            <InteractionModeToggle />
            <p className="text-[10px] text-slate-400 mt-3 font-medium">
              Active: <span className="font-bold text-primary uppercase">{mode}</span>
              {isTouch && " — larger buttons, date pickers, and bottom-sheet modals"}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display font-bold text-base text-slate-800 mb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Currency Localization Symbol
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-4">
              Switch the active currency character used to render prices and invoice metrics globally across all terminals. Default options are NGN (₦) or USD ($).
            </p>

            {/* Presets Grid */}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Preset Sign Options</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-5">
                {displayPresets.map((preset) => {
                  const isActive = currencySymbol === preset.symbol;
                  return (
                    <button
                      key={preset.symbol}
                      onClick={() => handleApplyPreset(preset.symbol)}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all ${
                        isActive
                          ? "bg-primary/5 border-primary text-primary"
                          : "bg-white border-slate-150 hover:border-slate-350 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-display text-xl font-bold px-2 py-0.5 bg-slate-100 rounded-lg shrink-0">
                          {preset.symbol}
                        </span>
                        <div>
                          <p className="text-xs font-bold leading-tight">{preset.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{preset.country}</p>
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom manual symbol input fallback */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Custom Symbol Override</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    maxLength={3}
                    className="px-3.5 py-2 w-24 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm font-bold outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                    placeholder="e.g. ₦"
                  />
                  <div className="self-center text-xs text-slate-500 font-medium">
                    Rendering check: <span className="font-bold text-primary font-display">{currencySymbol}100.00</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Active register business presets configuration */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display font-bold text-base text-slate-800 mb-2 flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Corporate Terminal Type
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-4">
              Select the industry template for this terminal — catalog, categories, and checkout tools adapt automatically.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BUSINESS_TYPE_OPTIONS.map((opt) => {
                const isActive = businessType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => {
                      setBusinessType(opt.type);
                      showToast(`Active terminal template set to ${opt.label}`);
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary/5 border-primary text-primary"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <p className="text-sm font-bold">{opt.label}</p>
                    <p className="text-[10px] opacity-80 mt-1">{opt.summary}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Terminal Hardware Status & Manager verification details */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-sm text-slate-800">Terminal Telemetry</h3>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 font-medium">
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-400">Firmware Build</span>
                <span className="font-mono text-slate-800">mevon-v5.82a</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-400">Hardware Profile</span>
                <span className="font-mono text-slate-800">{hardwareTerminal}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-400">Current Tax Setting</span>
                <span className="text-slate-800">{taxRateSetting}% (Fixed)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Manager Access Code</span>
                <span className="font-mono bg-slate-50 border px-1.5 py-0.5 rounded text-primary">{managerCode}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-6 shadow-lg text-white">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
              <Terminal className="text-primary w-4 h-4" />
              System Status
            </h4>
            <div className="space-y-2 text-[11px] font-mono text-slate-350">
              <p className="text-emerald-400">✓ Security Key Integrity Checked</p>
              <p className="text-emerald-400">✓ Intercom Network Node Connected</p>
              <p className="text-slate-400">• Core API Sync: Nominal (12ms)</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between">
              <button 
                onClick={() => {
                  setHardwareTerminal(`mevon-04a-${Math.random().toString(36).substring(2,6).toUpperCase()}`);
                  showToast("Hardware Terminal identifier successfully cycled!");
                }}
                className="w-full h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Cycle Hardware Identifier
              </button>
            </div>
          </div>
        </div>

      </div>

      <DesignerCredit variant="block" className="max-w-xl" />

      <PaymentProviderPanel onSaved={showToast} />

      <DesktopHardwarePanel onSaved={showToast} />

      <AccountManagerPanel
        accounts={staffAccounts}
        setAccounts={setStaffAccounts}
        terminalAudits={terminalAudits}
        setTerminalAudits={setTerminalAudits}
        onSaved={showToast}
      />
    </div>
  );
}
