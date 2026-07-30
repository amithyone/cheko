import React, { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  X, 
  Star,
  CheckCircle,
  HelpCircle
} from "lucide-react";

import type { Customer } from "@/types";
import { INITIAL_CUSTOMERS } from "@/mock";

interface CustomersPageProps {
  currencySymbol?: string;
}

export default function CustomersPage({ currencySymbol = "₦" }: CustomersPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);

  // Form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newFavStore, setNewFavStore] = useState("Flagship NY");
  const [newTier, setNewTier] = useState<"Elite VIP" | "Preferred" | "Regular" | "New Client">("New Client");

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newCust: Customer = {
      id: `CST-${Math.floor(Math.random()*800)+100}`,
      name: newName,
      email: newEmail,
      visits: 1,
      spend: 0,
      loyaltyTier: newTier,
      favStore: newFavStore,
      status: "Active"
    };

    setCustomers(prev => [newCust, ...prev]);
    setIsAddModalOpen(false);
    setNewName("");
    setNewEmail("");
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 relative">
      
      {/* Title block */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Ecosystem Directory</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight leading-tight">Customer Directory</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium font-sans">Track purchase histories, loyalty indexes, and individual shop preferences.</p>
        </div>

        <div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm flex items-center gap-2 hover:scale-102 transition-all shadow-md active:translate-y-0.5"
          >
            <UserPlus className="w-4 h-4" /> Add New Customer
          </button>
        </div>
      </div>

      {/* Search Console */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 rounded-xl bg-white border border-slate-200 flex items-center px-4 h-12 transition-all focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary">
          <Search className="text-slate-400 mr-3 w-5 h-5" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm text-slate-800 placeholder-slate-400" 
            placeholder="Search custom accounts by name, email or secure account ID..."
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Client Reference</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Client Details</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">visits</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Favoured Lounge</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Accumulated Spend</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-105">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-8 py-6 font-display text-sm font-bold text-slate-800">{c.id}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[15px] text-slate-800 leading-snug">{c.name}</p>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            c.loyaltyTier === "Elite VIP" 
                              ? "bg-amber-50 text-amber-700 border border-amber-100" 
                              : c.loyaltyTier === "Preferred" 
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {c.loyaltyTier}
                          </span>
                        </div>
                        <p className="text-xs text-slate-450 font-medium font-sans">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-display font-semibold text-slate-705 text-sm">{c.visits} times</td>
                  <td className="px-8 py-6 text-xs text-slate-600 font-semibold uppercase tracking-wider">{c.favStore}</td>
                  <td className="px-8 py-6 font-display font-bold text-slate-800 text-[15px]">{currencySymbol}{c.spend.toFixed(2)}</td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleDeleteCustomer(c.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-medium font-sans">
                    No active clients match the search parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-slate-100/60 rounded-xl text-xs text-slate-550 font-medium">
        <HelpCircle className="w-4 h-4 text-slate-400" />
        <span>Clients can receive instant notifications of newly scanned shoe models on checkout profiles.</span>
      </div>

      {/* Add customer modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <UserPlus className="text-primary w-5 h-5" />
              Register Client Profile
            </h3>
            
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">First & Last Name</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-405 uppercase mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. eleanor@vance.net"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-405 uppercase mb-1.5">Favourite Store</label>
                  <select 
                    value={newFavStore} 
                    onChange={(e) => setNewFavStore(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  >
                    <option value="Flagship NY">Flagship NY</option>
                    <option value="Pop-up LA">Pop-up LA</option>
                    <option value="Tokyo Boutique">Tokyo Boutique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-405 uppercase mb-1.5">Tier Classification</label>
                  <select 
                    value={newTier} 
                    onChange={(e) => setNewTier(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  >
                    <option value="New Client">New Client</option>
                    <option value="Regular">Regular</option>
                    <option value="Preferred">Preferred</option>
                    <option value="Elite VIP">Elite VIP</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-bold tracking-wide active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Save Client Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
