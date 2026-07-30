import { useState } from "react";
import { Calendar, UserPlus, Clock, Briefcase } from "lucide-react";
import { useNotice } from "@/context/NoticeContext";
import { useInteractionMode } from "@/context/InteractionModeContext";
import { cn } from "@/shared/utils/cn";

export function ServiceQuickActions() {
  const notice = useNotice();
  const { isTouch } = useInteractionMode();
  const [walkInQueue, setWalkInQueue] = useState(3);
  const actionBtn = cn(
    "rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-2 touch-manipulation",
    isTouch ? "flex-1 min-w-[140px] min-h-[48px] px-5 py-3 text-sm justify-center" : "px-4 py-2 text-xs"
  );
  const actionBtnOutline = cn(actionBtn, "bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700");
  const actionBtnPrimary = cn(actionBtn, "bg-indigo-600 text-white hover:bg-indigo-700");

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-100 rounded-2xl p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Service desk</p>
          <h4 className="font-display font-bold text-sm text-slate-800">Walk-ins & appointments</h4>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
          {walkInQueue} in queue
        </span>
      </div>
      <div className={cn("flex flex-wrap gap-2", isTouch && "flex-col sm:flex-row")}>
        <button
          type="button"
          onClick={() => {
            setWalkInQueue((q) => q + 1);
            notice.showSuccess("Walk-in added to service queue.", "Queue updated");
          }}
          className={actionBtnOutline}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add walk-in
        </button>
        <button
          type="button"
          onClick={() =>
            notice.showInfo("Next slot: Today 2:30 PM — Consultation room B.", "Appointment booked")
          }
          className={actionBtnOutline}
        >
          <Calendar className="w-3.5 h-3.5" />
          Book appointment
        </button>
        <button
          type="button"
          onClick={() =>
            notice.showInfo("Service timer started for active bay — 45 min estimate.", "Job started")
          }
          className={actionBtnOutline}
        >
          <Clock className="w-3.5 h-3.5" />
          Start service timer
        </button>
        <button
          type="button"
          onClick={() =>
            notice.showSuccess("Membership renewal reminder sent to client.", "Membership")
          }
          className={actionBtnPrimary}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Renew membership
        </button>
      </div>
    </div>
  );
}
