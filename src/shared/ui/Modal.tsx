import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useInteractionModeOptional } from "@/context/InteractionModeContext";
import { useVisualViewport } from "@/hooks/useVisualViewport";

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
  zIndex?: number;
}

export function Modal({
  open,
  onClose,
  children,
  className,
  panelClassName,
  zIndex = 50,
}: ModalProps) {
  const interaction = useInteractionModeOptional();
  const isTouch = interaction?.isTouch ?? false;
  const viewport = useVisualViewport(open && isTouch);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !isTouch) return;

    const scrollFocusedField = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return;
      if (!target.matches("input, textarea, select")) return;

      requestAnimationFrame(() => {
        target.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
      });
    };

    const onFocusIn = (event: FocusEvent) => scrollFocusedField(event.target);
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [open, isTouch]);

  useEffect(() => {
    if (!open || !isTouch || !viewport.keyboardOpen) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.matches("input, textarea, select")) {
      requestAnimationFrame(() => {
        active.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
      });
    }
  }, [open, isTouch, viewport.keyboardOpen, viewport.height]);

  if (!open) return null;

  const overlayStyle: React.CSSProperties = isTouch
    ? {
        top: viewport.offsetTop,
        left: viewport.offsetLeft,
        width: viewport.width,
        height: viewport.height,
        zIndex,
      }
    : { zIndex };

  return (
    <div
      className={cn(
        "fixed flex items-center justify-center p-4",
        isTouch ? "inset-auto" : "inset-0",
        className
      )}
      style={overlayStyle}
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        ref={panelRef}
        className={cn(
          "relative bg-white w-full shadow-2xl border border-slate-100 overflow-y-auto overscroll-contain",
          isTouch
            ? cn(
                "rounded-2xl max-w-2xl mx-auto transition-[max-height] duration-200 ease-out",
                viewport.keyboardOpen ? "max-h-full p-5" : "max-h-[min(92%,720px)] p-6 sm:p-8"
              )
            : "rounded-3xl max-w-md p-6 sm:p-8 max-h-[92vh]",
          panelClassName
        )}
        style={
          isTouch
            ? {
                maxHeight: `${Math.max(200, viewport.height - 32)}px`,
              }
            : undefined
        }
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "absolute top-4 right-4 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center justify-center touch-manipulation z-10",
              isTouch ? "min-w-[48px] min-h-[48px] p-3" : "p-1.5"
            )}
            aria-label="Close"
          >
            <X className={isTouch ? "w-6 h-6" : "w-4 h-4"} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function ModalHeader({ title, subtitle, className }: ModalHeaderProps) {
  const interaction = useInteractionModeOptional();
  const isTouch = interaction?.isTouch ?? false;

  return (
    <div className={cn("mb-6 pr-8", isTouch && "pr-14 mb-8", className)}>
      <h3 className={cn("font-display font-bold text-slate-900", isTouch ? "text-2xl" : "text-lg")}>
        {title}
      </h3>
      {subtitle && (
        <p className={cn("text-slate-500 mt-1", isTouch ? "text-sm" : "text-xs")}>{subtitle}</p>
      )}
    </div>
  );
}
