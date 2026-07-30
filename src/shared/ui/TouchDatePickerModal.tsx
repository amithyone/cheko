import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, X } from "lucide-react";
import { useVisualViewport } from "@/hooks/useVisualViewport";
import { formatHotelDate, todayIso } from "@/shared/utils/hotel";
import { TouchCalendar } from "./TouchCalendar";
import { Button } from "./Button";

export interface TouchDatePickerModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  value?: string;
  min?: string;
  max?: string;
  onConfirm: (iso: string) => void;
  zIndex?: number;
}

export function TouchDatePickerModal({
  open,
  onClose,
  title = "Select date",
  value,
  min,
  max,
  onConfirm,
  zIndex = 70,
}: TouchDatePickerModalProps) {
  const viewport = useVisualViewport(open);
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => {
    if (open) {
      setDraft(value ?? "");
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const canConfirm = Boolean(draft) && (!min || draft >= min) && (!max || draft <= max);

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(draft);
    onClose();
  };

  const handleToday = () => {
    const today = todayIso();
    if (min && today < min) return;
    if (max && today > max) return;
    setDraft(today);
  };

  return createPortal(
    <div
      className="fixed flex items-center justify-center p-4"
      style={{
        top: viewport.offsetTop,
        left: viewport.offsetLeft,
        width: viewport.width,
        height: viewport.height,
        zIndex,
      }}
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
        style={{ maxHeight: `${Math.max(320, viewport.height - 24)}px` }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Date picker
            </p>
            <h3 className="font-display font-bold text-xl text-slate-900 mt-0.5 truncate">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[48px] min-h-[48px] rounded-xl text-slate-500 hover:bg-slate-100 flex items-center justify-center touch-manipulation shrink-0"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-5 py-4 bg-indigo-50 border-b border-indigo-100 shrink-0">
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Selected</p>
          <p className="font-display font-black text-3xl text-indigo-900 mt-1 tabular-nums">
            {draft ? formatHotelDate(draft) : "—"}
          </p>
          {draft && (
            <p className="text-xs text-indigo-600/80 mt-0.5 font-mono">{draft}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <TouchCalendar
            size="large"
            value={draft || undefined}
            min={min}
            max={max}
            onChange={setDraft}
            className="border-0 bg-transparent p-0 shadow-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 p-4 border-t border-slate-100 bg-white shrink-0">
          <Button type="button" variant="ghost" size="lg" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="secondary" size="lg" fullWidth onClick={handleToday}>
            Today
          </Button>
          <Button type="button" size="lg" fullWidth onClick={handleConfirm} disabled={!canConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
