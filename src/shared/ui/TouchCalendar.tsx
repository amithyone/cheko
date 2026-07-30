import { useMemo, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import {
  formatMonthYear,
  getCalendarCells,
  isoToParts,
  isIsoInRange,
  partsToIso,
  WEEKDAY_LABELS,
} from "@/shared/utils/calendar";
import { todayIso } from "@/shared/utils/hotel";

export interface TouchCalendarProps {
  value?: string;
  onChange: (iso: string) => void;
  min?: string;
  max?: string;
  className?: string;
  size?: "default" | "large";
}

export function TouchCalendar({
  value,
  onChange,
  min,
  max,
  className,
  size = "default",
}: TouchCalendarProps) {
  const isLarge = size === "large";
  const initial = value ? isoToParts(value) : isoToParts(todayIso());
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  useEffect(() => {
    if (value) {
      const parts = isoToParts(value);
      setViewYear(parts.year);
      setViewMonth(parts.month);
    }
  }, [value]);

  const cells = useMemo(() => getCalendarCells(viewYear, viewMonth), [viewYear, viewMonth]);
  const today = todayIso();

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const navButtonClass = cn(
    "rounded-2xl border border-slate-200 bg-white text-slate-700 flex items-center justify-center touch-manipulation active:bg-slate-100 active:scale-95 transition-transform",
    isLarge ? "min-h-[56px] min-w-[56px]" : "min-h-[48px] min-w-[48px]"
  );

  const dayCellMin = isLarge ? "min-h-[56px]" : "min-h-[48px]";
  const dayText = isLarge ? "text-lg" : "text-base";
  const gridGap = isLarge ? "gap-2" : "gap-1.5";

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-slate-50 touch-manipulation",
        isLarge ? "p-4" : "p-3 sm:p-4",
        className
      )}
      role="application"
      aria-label="Date picker calendar"
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <button type="button" onClick={() => shiftMonth(-1)} className={navButtonClass} aria-label="Previous month">
          <ChevronLeft className={isLarge ? "w-7 h-7" : "w-6 h-6"} />
        </button>
        <p
          className={cn(
            "font-display font-bold text-slate-900 text-center flex-1",
            isLarge ? "text-xl" : "text-base sm:text-lg"
          )}
        >
          {formatMonthYear(viewYear, viewMonth)}
        </p>
        <button type="button" onClick={() => shiftMonth(1)} className={navButtonClass} aria-label="Next month">
          <ChevronRight className={isLarge ? "w-7 h-7" : "w-6 h-6"} />
        </button>
      </div>

      <div className={cn("grid grid-cols-7 mb-2", isLarge ? "gap-2" : "gap-1")}>
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className={cn(
              "text-center font-bold uppercase text-slate-400",
              isLarge ? "text-xs py-1.5" : "text-[11px] py-1"
            )}
          >
            {label}
          </div>
        ))}
      </div>

      <div className={cn("grid grid-cols-7", gridGap)}>
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} aria-hidden className={dayCellMin} />;
          }

          const iso = partsToIso(viewYear, viewMonth, day);
          const disabled = !isIsoInRange(iso, min, max);
          const selected = value === iso;
          const isToday = iso === today;

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onChange(iso)}
              className={cn(
                dayCellMin,
                dayText,
                "rounded-2xl font-bold transition-all touch-manipulation active:scale-95",
                disabled && "opacity-30 cursor-not-allowed",
                selected
                  ? "bg-primary text-white shadow-lg ring-2 ring-primary/30"
                  : isToday
                    ? "bg-white border-2 border-primary text-primary"
                    : "bg-white border border-slate-200 text-slate-800 active:bg-slate-100"
              )}
              aria-label={iso}
              aria-pressed={selected}
            >
              {day}
            </button>
          );
        })}
      </div>

      {(min || max) && (
        <p className={cn("text-slate-400 mt-4 text-center", isLarge ? "text-xs" : "text-[10px]")}>
          {min && `From ${min}`}
          {min && max && " · "}
          {max && `Until ${max}`}
        </p>
      )}
    </div>
  );
}
