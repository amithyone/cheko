import React, { useEffect, useRef, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { ChatMessage } from "@/types";

interface IntercomDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chatMessages: ChatMessage[];
  onSendChatMessage: (text: string) => void;
}

export function IntercomDrawer({
  isOpen,
  onOpenChange,
  chatMessages,
  onSendChatMessage,
}: IntercomDrawerProps) {
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isOpen]);

  const sendIntercomText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendChatMessage(chatInput);
    setChatInput("");
  };

  return (
    <>
      {/* POS Intercom Chat Feature Panel (Collapsible slide sidebar on the right) */}
      <div
        className={`fixed right-0 top-0 h-screen w-80 bg-white border-l border-slate-200 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 bg-primary text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-white animate-pulse" />
            <div>
              <h3 className="font-display font-bold text-sm">Terminal Intercom</h3>
              <p className="text-[10px] text-white/70">Connected to Manager, Cashier T1 & T3</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-white bg-white/10 hover:bg-white/25 px-2 py-1 rounded-lg text-xs font-bold"
          >
            Hide
          </button>
        </div>

        {/* Chat History Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 scrollbar">
          {chatMessages.map((msg) => {
            const isMe = msg.sender === "Cashier (You)";
            const isSystem = msg.role === "system";
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {isSystem ? (
                  <div className="bg-slate-200/80 text-slate-600 text-[10px] py-1 px-2.5 rounded-full border border-slate-300 w-full text-center font-mono font-medium">
                    {msg.text}
                  </div>
                ) : (
                  <>
                    <span className="text-[10px] text-slate-400 font-bold mb-0.5 px-1">{msg.sender}</span>
                    <div
                      className={`max-w-[85%] p-2.5 rounded-2xl text-xs break-words shadow-sm ${
                        isMe
                          ? "bg-primary text-white rounded-tr-none"
                          : msg.role === "manager"
                          ? "bg-amber-100 text-amber-900 rounded-tl-none border border-amber-200"
                          : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-slate-400 mt-0.5 px-1">{msg.timestamp}</span>
                  </>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Intercom input text field */}
        <form onSubmit={sendIntercomText} className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
            placeholder="Intercom keyword (e.g. price, manager)..."
          />
          <button
            type="submit"
            className="p-2 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Helper suggestions panel */}
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 text-[10px] text-slate-500 font-medium">
          <span className="font-bold text-slate-600">Quick Keywords:</span>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {[
              "Price check on Bananas",
              "Need manager authorization",
              "Price check on Fries",
              "Shift starting soon",
            ].map((suggest) => (
              <button
                key={suggest}
                type="button"
                onClick={() => setChatInput(suggest)}
                className="bg-white hover:bg-slate-200 px-1.5 py-0.5 rounded border border-slate-200 text-slate-705 transition-colors cursor-pointer"
              >
                {suggest}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Intercom trigger tag when chat is closed (Icon Only) */}
      {!isOpen && (
        <button
          onClick={() => onOpenChange(true)}
          className="fixed bottom-28 right-10 z-40 bg-primary hover:bg-primary-hover text-white h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-92 cursor-pointer group"
          title="Open Intercom Chat"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6 text-white animate-bounce" />
            {chatMessages.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm ring-1 ring-red-300">
                {chatMessages.length}
              </span>
            )}
          </div>
        </button>
      )}
    </>
  );
}
