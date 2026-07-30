import React from "react";
import { cn } from "@/shared/utils/cn";
import { useInteractionModeOptional } from "@/context/InteractionModeContext";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "success";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent",
  secondary: "bg-slate-900 hover:bg-slate-800 text-white border-transparent",
  danger: "bg-rose-500 hover:bg-rose-600 text-white border-transparent",
  ghost: "bg-transparent hover:bg-slate-100 text-slate-600 border-slate-200",
  success: "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "py-2 px-3 text-[10px]",
  md: "py-3 px-4 text-xs",
  lg: "py-4 px-6 text-xs",
};

const touchSizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-[44px] py-3 px-4 text-xs",
  md: "min-h-[48px] py-3.5 px-5 text-sm",
  lg: "min-h-[56px] py-4 px-6 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const interaction = useInteractionModeOptional();
  const isTouch = interaction?.isTouch ?? false;

  return (
    <button
      type={type}
      className={cn(
        "font-black uppercase tracking-wider rounded-xl border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 touch-manipulation",
        variantClasses[variant],
        isTouch ? touchSizeClasses[size] : sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
