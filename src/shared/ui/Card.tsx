import React from "react";
import { cn } from "@/shared/utils/cn";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6 sm:p-8",
};

export function Card({ children, className, padding = "md" }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-2xl shadow-sm",
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "primary";
  className?: string;
}

const badgeVariants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-rose-100 text-rose-700",
  info: "bg-indigo-100 text-indigo-700",
  primary: "bg-primary/10 text-primary",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "text-[9px] font-black uppercase px-1.5 py-0.5 rounded inline-flex items-center",
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  tone?: "default" | "amber" | "emerald" | "teal" | "indigo";
  className?: string;
}

const toneClasses: Record<NonNullable<StatTileProps["tone"]>, string> = {
  default: "bg-white border-slate-200",
  amber: "bg-amber-50 border-amber-100",
  emerald: "bg-emerald-50 border-emerald-100",
  teal: "bg-teal-50 border-teal-100",
  indigo: "bg-indigo-50 border-indigo-100",
};

export function StatTile({ label, value, hint, icon, tone = "default", className }: StatTileProps) {
  return (
    <div className={cn("border rounded-xl p-4", toneClasses[tone], className)}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wide">{label}</p>
      </div>
      <p className="font-display text-2xl font-black text-slate-900">{value}</p>
      {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
