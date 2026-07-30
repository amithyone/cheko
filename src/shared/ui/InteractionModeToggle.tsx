import { MousePointer2, Hand } from "lucide-react";
import { useInteractionMode, type InteractionMode } from "@/context/InteractionModeContext";
import { cn } from "@/shared/utils/cn";

interface InteractionModeToggleProps {
  compact?: boolean;
  className?: string;
}

export function InteractionModeToggle({ compact, className }: InteractionModeToggleProps) {
  const { mode, setMode } = useInteractionMode();

  const options: { id: InteractionMode; label: string; icon: typeof MousePointer2; desc: string }[] = [
    { id: "mouse", label: "Mouse", icon: MousePointer2, desc: "Compact desktop layout" },
    { id: "touch", label: "Touch", icon: Hand, desc: "Large targets for kiosks & tablets" },
  ];

  if (compact) {
    const active = mode === "touch";
    return (
      <button
        type="button"
        onClick={() => setMode(active ? "mouse" : "touch")}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer min-h-[44px]",
          active
            ? "bg-indigo-50 border-indigo-200 text-indigo-700"
            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100",
          className
        )}
        title={active ? "Touch mode on — tap to switch to mouse" : "Mouse mode — tap for touch mode"}
      >
        {active ? <Hand className="w-4 h-4" /> : <MousePointer2 className="w-4 h-4" />}
        <span className="hidden sm:inline">{active ? "Touch" : "Mouse"}</span>
      </button>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", className)}>
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = mode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setMode(opt.id)}
            className={cn(
              "flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer min-h-[72px]",
              active
                ? "border-primary bg-primary/5 text-primary"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            )}
          >
            <div
              className={cn(
                "p-2.5 rounded-xl shrink-0",
                active ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">{opt.label} mode</p>
              <p className="text-xs opacity-80 mt-0.5">{opt.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
