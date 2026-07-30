import React from "react";
import { Trash2, ShieldAlert, Lock, ChevronDown } from "lucide-react";

interface CustomKeypadProps {
  isUnlocked: boolean;
  onKeyPress: (val: string) => void;
  onBackspace: () => void;
  onRequestUnlock: () => void;
  onLock: () => void;
}

export function CustomKeypad({
  isUnlocked,
  onKeyPress,
  onBackspace,
  onRequestUnlock,
  onLock,
}: CustomKeypadProps) {
  if (!isUnlocked) {
    return (
      <button
        type="button"
        onClick={onRequestUnlock}
        className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-150 border border-dashed border-slate-300 rounded-xl flex items-center justify-between text-left cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-400 group-hover:text-primary" />
          <div>
            <p className="text-[10px] font-bold text-slate-600 uppercase">Custom tender pad</p>
            <p className="text-[9px] text-slate-400">Manager password required to override amount</p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-emerald-700 uppercase flex items-center gap-1">
          <ShieldAlert className="w-3 h-3" /> Override active
        </span>
        <button
          type="button"
          onClick={onLock}
          className="text-[9px] font-bold text-slate-400 hover:text-rose-600 uppercase cursor-pointer flex items-center gap-0.5"
        >
          <Lock className="w-3 h-3" /> Lock
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1.5 font-sans">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((btn) => (
          <button
            key={btn}
            type="button"
            onClick={() => onKeyPress(btn)}
            className="h-10 bg-slate-50 border border-slate-200 rounded-lg font-display text-sm font-bold text-slate-700 hover:bg-primary hover:text-white transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          >
            {btn}
          </button>
        ))}
        <button
          type="button"
          onClick={onBackspace}
          className="h-10 bg-slate-50 border border-slate-250 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white text-slate-500 cursor-pointer"
          title="Backspace"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
