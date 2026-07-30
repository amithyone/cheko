import { useId, useState } from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useInteractionModeOptional } from "@/context/InteractionModeContext";
import { formatHotelDate } from "@/shared/utils/hotel";
import { TouchDatePickerModal } from "./TouchDatePickerModal";

export interface TouchDateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  hint?: string;
}

export function TouchDateInput({
  label,
  hint,
  className,
  id,
  value,
  onChange,
  min,
  max,
  required,
  disabled,
  ...props
}: TouchDateInputProps) {
  const interaction = useInteractionModeOptional();
  const isTouch = interaction?.isTouch ?? false;
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [pickerOpen, setPickerOpen] = useState(false);
  const stringValue = typeof value === "string" ? value : "";

  const emitChange = (iso: string) => {
    onChange?.({ target: { value: iso } } as React.ChangeEvent<HTMLInputElement>);
  };

  if (isTouch) {
    return (
      <>
        <div className="w-full">
          {label && (
            <label
              htmlFor={inputId}
              className="block font-bold text-slate-500 uppercase mb-1.5 text-xs"
            >
              {label}
              {required && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
          )}
          <button
            id={inputId}
            type="button"
            disabled={disabled}
            onClick={() => setPickerOpen(true)}
            aria-haspopup="dialog"
            className={cn(
              "w-full border border-slate-200 rounded-xl outline-none bg-white font-semibold text-slate-800 touch-manipulation flex items-center justify-between gap-3 min-h-[52px] px-4 py-3 text-base active:bg-slate-50 active:border-primary/40",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
          >
            <span className="flex items-center gap-3 min-w-0">
              <Calendar className="w-5 h-5 text-primary shrink-0" />
              <span className={cn("truncate", !stringValue && "text-slate-400")}>
                {stringValue ? formatHotelDate(stringValue) : "Tap to pick date"}
              </span>
            </span>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
          </button>

          {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
          {required && (
            <input
              tabIndex={-1}
              aria-hidden
              required
              value={stringValue}
              readOnly
              onChange={() => {}}
              className="sr-only"
            />
          )}
        </div>

        <TouchDatePickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          title={label ?? "Select date"}
          value={stringValue || undefined}
          min={typeof min === "string" ? min : undefined}
          max={typeof max === "string" ? max : undefined}
          onConfirm={emitChange}
        />
      </>
    );
  }

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block font-bold text-slate-500 uppercase mb-1.5 text-[10px]">
          {label}
        </label>
      )}
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
        <input
          id={inputId}
          type="date"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          required={required}
          disabled={disabled}
          className={cn(
            "w-full border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white font-semibold text-slate-800 touch-manipulation min-h-[42px] pl-10 pr-3 py-2.5 text-sm",
            className
          )}
          {...props}
        />
      </div>
      {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
