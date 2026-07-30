import React, { useState } from "react";
import { 
  MessageSquare, 
  Send, 
  Terminal, 
  UserCheck, 
  Bookmark, 
  Zap, 
  AlertCircle,
  Clock,
  CheckCheck,
  BadgeAlert
} from "lucide-react";
import { ChatMessage } from "@/types";

interface ManagerChatViewProps {
  chatMessages: ChatMessage[];
  onManagerSend: (text: string, senderOverride?: string) => void;
  currencySymbol: string;
}

export default function ManagerChatView({ 
  chatMessages, 
  onManagerSend,
  currencySymbol 
}: ManagerChatViewProps) {
  const [inputText, setInputText] = useState("");
  const [activeChannel, setActiveChannel] = useState<string>("All Channels");

  // Pre-configured manager quick actions for immediate store dispatching
  const SUGGESTED_TEMPLATES = [
    { label: "Approve Price Override", text: "Manager remote override accepted. Digital price tags synced." },
    { label: "Dispatch Change (₦5,000)", text: "Cash vault node dispatched. Runner is bringing down ₦5,000 in bills." },
    { label: "Request Lane Balancing", text: "Attention Lane Cashiers: Please execute shift balance auditing." },
    { label: "Resolve Overcharge ticket", text: "Intercom Audit: Checked double charge request. Refunding extraneous amount." }
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onManagerSend(inputText);
    setInputText("");
  };

  const handleApplyTemplate = (text: string) => {
    onManagerSend(text);
  };

  // Filter messages based on channel selected
  const filteredMessages = chatMessages.filter(msg => {
    if (activeChannel === "All Channels") return true;
    if (activeChannel === "Terminal 1 Only" && msg.sender.includes("Terminal 1")) return true;
    if (activeChannel === "Terminal 4 Only" && (msg.sender.includes("Terminal 4") || msg.sender.includes("Alex") || msg.sender.includes("Cashier"))) return true;
    return msg.role === "manager";
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto h-[680px]">
      
      {/* Side channels and metrics drawer (1 column) */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
        <div className="space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-display font-black text-slate-800 text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Intercom Nodes
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 font-semibold font-sans uppercase tracking-wider">
              Secure Central Mesh
            </p>
          </div>

          {/* Channels list selector */}
          <div className="space-y-2 font-sans text-xs">
            {["All Channels", "Terminal 1 Only", "Terminal 4 Only", "Manager Outbox"].map((chan) => {
              const isActive = activeChannel === chan;
              return (
                <button
                  key={chan}
                  onClick={() => setActiveChannel(chan)}
                  className={`w-full py-2.5 px-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isActive 
                      ? "bg-primary/5 text-primary border-primary font-bold shadow-sm" 
                      : "bg-transparent text-slate-600 border-transparent hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{chan}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-primary" : "bg-slate-300"}`} />
                </button>
              );
            })}
          </div>

          {/* Quick status cards */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3 font-sans text-xs">
            <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Mesh Health</h4>
            <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 font-medium">Auto-Replies:</span>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Dynamic</span>
            </div>
            <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 font-medium">Encryption:</span>
              <span className="text-[10px] font-bold bg-indigo-50 text-primary px-2 py-0.5 rounded-full uppercase">SHA-256</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-center font-mono py-2 bg-slate-50 border border-slate-100 rounded-xl">
          NODE GATEWAY: ONLINE
        </div>
      </div>

      {/* Main interactive chat panel (3 columns) */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl flex flex-col overflow-hidden shadow-sm">
        
        {/* Chat header area */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="font-display font-black text-slate-800 text-base">Store Intercom Core</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium font-sans">
              Real-time checkout requests & digital overrides
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Live Supervisor Node
            </span>
          </div>
        </div>

        {/* Message feed stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredMessages.map((msg) => {
            const isManager = msg.role === "manager";
            return (
              <div 
                key={msg.id} 
                className={`flex max-w-[85%] flex-col ${isManager ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-1 select-none">
                  <span className="text-[10px] font-bold text-slate-400">{msg.sender}</span>
                  <span className="text-[8px] text-slate-350"><Clock className="w-2 h-2 inline mr-0.5" />{msg.timestamp}</span>
                </div>
                <div className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm transition-all ${
                  isManager 
                    ? "bg-slate-900 text-white rounded-tr-none" 
                    : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50"
                }`}>
                  <p>{msg.text}</p>
                </div>
                <div className="mt-1 flex gap-1 items-center">
                  {isManager && (
                    <span className="text-[8px] font-bold text-primary flex items-center gap-0.5 uppercase tracking-wider">
                      <CheckCheck className="w-3 h-3 text-primary" /> Transmit Complete
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Operational Templates tray */}
        <div className="px-6 py-3 border-t border-slate-100/80 bg-slate-50 flex items-center gap-2 overflow-x-auto select-none no-scrollbar">
          <span className="text-[9px] font-extrabold font-sans text-slate-400 uppercase tracking-widest flex items-center gap-1 shrink-0">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Quick Dispatch:
          </span>
          {SUGGESTED_TEMPLATES.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyTemplate(item.text)}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full font-bold text-[10px] hover:text-primary hover:border-primary transition-colors cursor-pointer whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Messaging input footer */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-150 flex gap-2 w-full font-sans bg-white">
          <input
            type="text"
            required
            placeholder="Type supervisor instructions, price overrides, or operational commands..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-primary/15 transition-all"
          />
          <button
            type="submit"
            className="p-3 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center cursor-pointer"
            title="Send Intercom Directive"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
