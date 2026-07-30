import React from "react";
import { cn } from "@/shared/utils/cn";
import { useInteractionModeOptional } from "@/context/InteractionModeContext";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, className, id, ...props }: InputProps) {
  const interaction = useInteractionModeOptional();
  const isTouch = interaction?.isTouch ?? false;
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "block font-bold text-slate-500 uppercase mb-1.5",
            isTouch ? "text-xs" : "text-[10px]"
          )}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 bg-white touch-manipulation",
          isTouch ? "min-h-[52px] px-4 py-3 text-base" : "px-3 py-2.5 text-sm",
          error && "border-rose-300 focus:ring-rose-100",
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
      {error && <p className="text-[10px] text-rose-600 mt-1 font-bold">{error}</p>}
    </div>
  );
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
}

export function Select({ label, hint, className, id, children, ...props }: SelectProps) {
  const interaction = useInteractionModeOptional();
  const isTouch = interaction?.isTouch ?? false;
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className={cn(
            "block font-bold text-slate-500 uppercase mb-1.5",
            isTouch ? "text-xs" : "text-[10px]"
          )}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "w-full border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 bg-white touch-manipulation",
          isTouch ? "min-h-[52px] px-4 py-3 text-base" : "px-3 py-2.5 text-sm",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 bg-white resize-none",
          className
        )}
        {...props}
      />
    </div>
  );
}
