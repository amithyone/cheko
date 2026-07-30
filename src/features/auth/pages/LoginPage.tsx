import React, { useState } from "react";
import { 
  Lock, 
  User, 
  Shield, 
  ShoppingCart, 
  Truck, 
  ChevronRight, 
  AlertCircle,
  Sparkles,
  Banknote
} from "lucide-react";

import { UserRole } from "@/types";
import { DesignerCredit } from "@/shared/layout/DesignerCredit";

interface LoginViewProps {
  onLoginSuccess: (role: UserRole) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>("Store Manager");
  const [username, setUsername] = useState("alex_rivera");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick profiles for seamless demoing
  const PRESET_PROFILES = [
    {
      role: "Store Manager" as const,
      name: "Alex Rivera (Manager)",
      desc: "Full administrative, core catalog, and global audit oversight",
      icon: Shield,
      color: "border-blue-200 bg-blue-50/50 text-blue-700 hover:border-blue-400"
    },
    {
      role: "Sales Rep" as const,
      name: "Sarah Jenkins (Cashier)",
      desc: "Fast in-store POS checkout register line clearance",
      icon: ShoppingCart,
      color: "border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:border-emerald-400"
    },
    {
      role: "Online Sales Dispatcher" as const,
      name: "Logistics Dispatcher",
      desc: "Track dispatch channels, courier routes, and online order deliveries",
      icon: Truck,
      color: "border-purple-200 bg-purple-50/50 text-purple-705 text-purple-700 hover:border-purple-400"
    },
    {
      role: "Cash Point Officer" as const,
      name: "Cash Point Officer",
      desc: "Walk-in cash payout — transfer or card in, cash out minus 5% fee",
      icon: Banknote,
      color: "border-amber-200 bg-amber-50/50 text-amber-800 hover:border-amber-400"
    }
  ];

  const handleProfileSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === "Store Manager") {
      setUsername("alex_rivera");
    } else if (role === "Sales Rep") {
      setUsername("sarah_cashier");
    } else if (role === "Cash Point Officer") {
      setUsername("cash_point_officer");
    } else {
      setUsername("logistics_dispatcher");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate database secure sync
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(selectedRole);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative select-none">
      
      {/* Background soft ambient glowing blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl"></div>

      <div className="w-full max-w-2xl bg-white border border-slate-150 rounded-3xl p-8 sm:p-12 shadow-xl relative z-10 flex flex-col md:flex-row gap-8 items-stretch">
        
        {/* Left segment - brand info */}
        <div className="flex-1 flex flex-col justify-between pr-0 md:pr-4 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0">
          <div>
            <div className="flex items-center gap-2 text-primary font-black text-lg mb-6">
              <div className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center font-display shadow-md">
                c
              </div>
              <span>cheko</span>
            </div>
            
            <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">
              Ecosystem Control Gateway
            </h1>
            <p className="text-xs text-slate-400 font-medium leading-relaxed font-sans">
              Connect to the store-network interface to dispatch retail, logistics, and multi-lane terminal audits.
            </p>
          </div>

          <div className="mt-8 space-y-3.5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Profiles</h4>
            <div className="space-y-2">
              {PRESET_PROFILES.map((profile) => {
                const isSelected = selectedRole === profile.role;
                const IconComp = profile.icon;
                return (
                  <button
                    key={profile.role}
                    type="button"
                    onClick={() => handleProfileSelect(profile.role)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-3 items-start ${
                      isSelected 
                        ? "bg-slate-900 border-slate-950 text-white shadow-md active:scale-98" 
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-lg ${isSelected ? "bg-white/10 text-white" : "bg-white border text-slate-500"}`}>
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-800"}`}>{profile.name}</p>
                      <p className={`text-[10px] truncate leading-tight mt-0.5 ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
                        {profile.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right segment - actual form credentials */}
        <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Secure Login ID</label>
                <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 rounded-full text-slate-500 font-mono">
                  {selectedRole.toUpperCase()}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Ecosystem Password</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-mono"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl flex items-start gap-2 border border-red-100 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="font-semibold leading-relaxed">{error}</p>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white rounded-xl font-bold text-xs shadow-md tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Connect Terminal <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-center">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Secure terminal session for authorized staff only.</span>
            </div>
          </div>
        </form>

      </div>

      <DesignerCredit className="relative z-10 mt-6" />
    </div>
  );
}
