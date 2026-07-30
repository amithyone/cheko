import React from "react";
import {
  Truck,
  MapPin,
  User,
  Package,
  CheckCircle2,
  ShieldCheck,
  Building,
  Terminal,
} from "lucide-react";
import { DeliveryOrder } from "@/types";

interface OrderCardProps {
  order: DeliveryOrder;
  currencySymbol: string;
  driversList: string[];
  onPromoteStatus: (orderId: string, nextStatus: "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED") => void;
  onAssignDriver: (orderId: string, driver: string) => void;
}

export function OrderCard({
  order,
  currencySymbol,
  driversList,
  onPromoteStatus,
  onAssignDriver,
}: OrderCardProps) {
  let progressPct = "w-1/4 bg-rose-500";
  let statusBadge = "bg-rose-50 text-rose-700 border-rose-100";
  if (order.status === "PREPARING") {
    progressPct = "w-2/4 bg-amber-500";
    statusBadge = "bg-amber-50 text-amber-700 border-amber-100";
  } else if (order.status === "OUT_FOR_DELIVERY") {
    progressPct = "w-3/4 bg-indigo-600";
    statusBadge = "bg-indigo-50 text-indigo-700 border-indigo-150";
  } else if (order.status === "DELIVERED") {
    progressPct = "w-full bg-emerald-500";
    statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-100";
  }

  return (
    <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm hover:border-slate-300 transition-all space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-sm font-black text-indigo-600 flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-indigo-500" /> {order.id}
          </span>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${statusBadge}`}>
            {order.status.replace(/_/g, " ")}
          </span>
          <span className="text-[10px] text-slate-400 font-bold font-mono">
            Queue index: {order.timestamp}
          </span>
        </div>

        <span className="font-display font-black text-base text-slate-900">
          {currencySymbol}{order.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs font-semibold">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5 select-none">
            <User className="w-3.5 h-3.5 text-slate-400" /> Customer info
          </p>
          <div>
            <h4 className="font-bold text-slate-800 text-[13px]">{order.customerName}</h4>
            <p className="text-slate-500 font-mono mt-0.5">{order.phone}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5 select-none">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Shipping Destination
          </p>
          <div>
            <p className="text-slate-705 text-slate-700 leading-snug line-clamp-2">{order.address}</p>
            <p className="text-[11px] text-indigo-600 font-medium italic mt-1 font-mono">
              " {order.deliveryInstructions} "
            </p>
          </div>
        </div>

        <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-dotted border-slate-200">
          <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5 select-none font-mono">
            <Truck className="w-3.5 h-3.5 text-slate-400" /> Carrier & Transit Details
          </p>
          <div>
            <span className="font-bold text-slate-800 tracking-tight block">
              {order.assignedDriver}
            </span>
            <span className="text-[10px] text-primary font-bold mt-1 inline-block uppercase tracking-wider font-mono">
              ETA: {order.eta}
            </span>
          </div>
        </div>
      </div>

      {order.bankAccountNo && (
        <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl flex items-center justify-between text-[11px] text-indigo-900 font-semibold font-mono">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-500" />
            <span>
              Settled via <strong className="text-indigo-950">{order.bankName}</strong> Account no:{" "}
              <strong className="text-indigo-950 font-bold select-all bg-indigo-50 px-1 rounded">
                {order.bankAccountNo}
              </strong>
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 bg-emerald-55 px-2 py-0.5 rounded uppercase">
            <ShieldCheck className="w-3.5 h-3.5" /> API Credited
          </span>
        </div>
      )}

      <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 flex flex-wrap gap-2 items-center text-xs">
        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest shrink-0">
          Cargo Manifest:
        </span>
        {order.items.map((it, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 font-bold flex gap-1 items-center"
          >
            <Package className="w-3 h-3 text-slate-400" />
            {it.productName} (x{it.qty} @ {currencySymbol}{it.unitPrice.toFixed(0)})
          </span>
        ))}
      </div>

      <div className="space-y-1 bg-slate-50/30 p-1.5 rounded-xl">
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${progressPct}`}></div>
        </div>
        <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-450 uppercase tracking-wider px-1 pt-0.5 select-none font-mono">
          <span className={order.status === "PENDING" ? "text-rose-600 font-bold" : ""}>Pending Check</span>
          <span className={order.status === "PREPARING" ? "text-amber-600 font-bold" : ""}>Assembling</span>
          <span className={order.status === "OUT_FOR_DELIVERY" ? "text-indigo-600" : ""}>Transit</span>
          <span className={order.status === "DELIVERED" ? "text-emerald-600 font-bold" : ""}>Delivered</span>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-1.5 flex-wrap text-xs font-semibold">
        {order.status === "PENDING" && (
          <button
            type="button"
            onClick={() => onPromoteStatus(order.id, "PREPARING")}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm cursor-pointer active:scale-95 transition-all text-xs"
          >
            Confirm Order & Assemble in Lane
          </button>
        )}

        {order.status === "PREPARING" && (
          <div className="flex gap-2 items-center flex-wrap">
            <select
              onChange={(e) => onAssignDriver(order.id, e.target.value)}
              className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-600"
              defaultValue=""
            >
              <option value="" disabled>Assign Courier...</option>
              {driversList.map((driver) => (
                <option key={driver} value={driver}>{driver}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onPromoteStatus(order.id, "OUT_FOR_DELIVERY")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm cursor-pointer active:scale-95 transition-all"
            >
              Dispatch Driver for Delivery
            </button>
          </div>
        )}

        {order.status === "OUT_FOR_DELIVERY" && (
          <button
            type="button"
            onClick={() => onPromoteStatus(order.id, "DELIVERED")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Handover Arrived & Completed
          </button>
        )}

        {order.status === "DELIVERED" && (
          <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest flex items-center gap-1.5 py-1.5 px-3 bg-emerald-50 rounded-lg">
            <ShieldCheck className="w-4 h-4" /> Delivered & Settled inside cashflows
          </span>
        )}
      </div>
    </div>
  );
}
