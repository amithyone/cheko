import { useMemo, useState } from "react";
import {
  BedDouble,
  Plus,
  LogIn,
  LogOut,
  Receipt,
  CalendarPlus,
  Wrench,
  Trash2,
  Search,
  Building2,
  Users,
  Wallet,
  DoorOpen,
} from "lucide-react";
import type { HotelManagement } from "@/hooks/useHotelManagement";
import type { HotelRoom, HotelRoomStatus } from "@/types";
import { useNotice } from "@/context/NoticeContext";
import { formatCurrency } from "@/shared/utils/money";
import {
  formatHotelDate,
  getRoomNights,
  getRoomFolioBalance,
  ROOM_TYPE_LABELS,
  addDaysIso,
} from "@/shared/utils/hotel";
import { Badge, Button, StatTile, TouchDateInput } from "@/shared/ui";
import { useInteractionMode } from "@/context/InteractionModeContext";
import { cn } from "@/shared/utils/cn";
import { AddRoomModal } from "./AddRoomModal";
import { CheckInModal } from "./CheckInModal";

interface HotelManagementPanelProps {
  hotel: HotelManagement;
  currencySymbol: string;
  cartItemCount: number;
  cartTotal: number;
  onFolioPosted?: () => void;
}

type StatusFilter = "all" | HotelRoomStatus;

const STATUS_BADGE: Record<
  HotelRoomStatus,
  "success" | "default" | "warning" | "danger"
> = {
  occupied: "success",
  vacant: "default",
  checkout_pending: "warning",
  maintenance: "danger",
};

export function HotelManagementPanel({
  hotel,
  currencySymbol,
  cartItemCount,
  cartTotal,
  onFolioPosted,
}: HotelManagementPanelProps) {
  const notice = useNotice();
  const { isTouch } = useInteractionMode();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [extendDate, setExtendDate] = useState("");

  const vacantRooms = useMemo(
    () => hotel.rooms.filter((r) => r.status === "vacant"),
    [hotel.rooms]
  );

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return hotel.rooms.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.number.includes(q) ||
        r.guestName.toLowerCase().includes(q) ||
        ROOM_TYPE_LABELS[r.type].toLowerCase().includes(q)
      );
    });
  }, [hotel.rooms, statusFilter, search]);

  const room = hotel.selectedRoom;

  const handleCheckInSubmit = (payload: Parameters<typeof hotel.checkIn>[0]) => {
    try {
      hotel.checkIn(payload);
      setShowCheckIn(false);
      notice.showSuccess("Guest checked in. Room charges posted to folio.", "Check-in complete");
    } catch (err) {
      notice.showError(err instanceof Error ? err.message : "Check-in failed");
    }
  };

  const handleAddRoom = (payload: Parameters<typeof hotel.addRoom>[0]) => {
    try {
      hotel.addRoom(payload);
      setShowAddRoom(false);
      notice.showSuccess(`Room ${payload.number} added to property.`, "Room registered");
    } catch (err) {
      notice.showError(err instanceof Error ? err.message : "Could not add room");
    }
  };

  const handleCheckOut = () => {
    if (!room || room.status === "vacant") return;
    notice.showConfirm({
      title: "Process checkout?",
      message: `Settle folio for ${room.guestName} (Room ${room.number}) — ${formatCurrency(getRoomFolioBalance(room), currencySymbol)}.`,
      confirmLabel: "Check out",
      onConfirm: () => {
        hotel.checkOut(room.id);
        notice.showSuccess(`Room ${room.number} is now vacant.`, "Checkout complete");
      },
    });
  };

  const handlePostCart = () => {
    if (!room || room.status === "vacant") {
      notice.showWarning("Select an occupied room first.");
      return;
    }
    if (cartItemCount === 0) {
      notice.showWarning("Add items to the cart before posting.");
      return;
    }
    hotel.postChargesToFolio(
      room.id,
      cartTotal,
      `POS charges — ${cartItemCount} item${cartItemCount > 1 ? "s" : ""}`,
      "service"
    );
    onFolioPosted?.();
    notice.showSuccess(
      `${formatCurrency(cartTotal, currencySymbol)} posted to Room ${room.number}.`,
      "Folio updated"
    );
  };

  const handleExtendStay = () => {
    if (!room?.checkOutDate || !extendDate) return;
    try {
      hotel.extendStay(room.id, extendDate);
      setExtendDate("");
      notice.showSuccess("Stay extended. Additional nights charged to folio.", "Extended");
    } catch (err) {
      notice.showError(err instanceof Error ? err.message : "Could not extend stay");
    }
  };

  const handleRemoveRoom = () => {
    if (!room) return;
    notice.showConfirm({
      title: "Remove room?",
      message: `Delete room ${room.number} from the property registry?`,
      confirmLabel: "Remove",
      variant: "danger",
      onConfirm: () => {
        try {
          hotel.removeRoom(room.id);
          notice.showSuccess(`Room ${room.number} removed.`);
        } catch (err) {
          notice.showError(err instanceof Error ? err.message : "Cannot remove room");
        }
      },
    });
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/80">
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Property management
            </p>
            <h4 className="font-display font-bold text-lg text-slate-900">Guest folio & room control</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => setShowAddRoom(true)}>
              <Plus className="w-3.5 h-3.5" />
              Add room
            </Button>
            <Button type="button" size="sm" onClick={() => setShowCheckIn(true)}>
              <LogIn className="w-3.5 h-3.5" />
              Check in guest
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-slate-100 border-b border-slate-100">
          <StatTile label="Total rooms" value={String(hotel.stats.total)} icon={<BedDouble className="w-4 h-4" />} className="rounded-none border-0" />
          <StatTile label="Occupied" value={String(hotel.stats.occupied)} tone="emerald" icon={<Users className="w-4 h-4" />} className="rounded-none border-0" />
          <StatTile label="Vacant" value={String(hotel.stats.vacant)} icon={<DoorOpen className="w-4 h-4" />} className="rounded-none border-0" />
          <StatTile label="Departing" value={String(hotel.stats.checkoutPending)} tone="amber" icon={<LogOut className="w-4 h-4" />} className="rounded-none border-0" />
          <StatTile label="Open folios" value={formatCurrency(hotel.stats.totalFolio, currencySymbol)} tone="indigo" icon={<Wallet className="w-4 h-4" />} className="rounded-none border-0" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 min-h-[320px]">
          {/* Room list */}
          <div className="xl:col-span-5 border-b xl:border-b-0 xl:border-r border-slate-100 flex flex-col">
            <div className="p-4 space-y-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search room or guest…"
                  className={cn(
                    "w-full pl-9 pr-3 rounded-xl border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-primary/10 touch-manipulation",
                    isTouch ? "py-3 text-sm min-h-[48px]" : "py-2 text-xs"
                  )}
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["all", "occupied", "vacant", "checkout_pending", "maintenance"] as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={cn(
                      "rounded-lg font-bold uppercase cursor-pointer transition-colors touch-manipulation",
                      isTouch ? "px-4 py-2.5 text-xs min-h-[44px]" : "px-2.5 py-1 text-[10px]",
                      statusFilter === s
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {s === "all" ? "All" : s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className={cn("flex-1 overflow-y-auto divide-y divide-slate-50", isTouch ? "max-h-[480px]" : "max-h-[360px]")}>
              {filteredRooms.map((r) => (
                <RoomListItem
                  key={r.id}
                  room={r}
                  selected={r.id === hotel.selectedRoomId}
                  currencySymbol={currencySymbol}
                  isTouch={isTouch}
                  onSelect={() => hotel.setSelectedRoomId(r.id)}
                />
              ))}
              {filteredRooms.length === 0 && (
                <p className="p-8 text-center text-xs text-slate-400">No rooms match filters.</p>
              )}
            </div>
          </div>

          {/* Detail panel */}
          <div className="xl:col-span-7 p-5 space-y-4">
            {!room ? (
              <p className="text-sm text-slate-400 text-center py-12">Select a room to manage.</p>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-display font-black text-2xl text-slate-900">Room {room.number}</h5>
                      <Badge variant={STATUS_BADGE[room.status]}>{room.status.replace("_", " ")}</Badge>
                      <span className="text-xs font-bold text-slate-500">
                        Floor {room.floor} · {ROOM_TYPE_LABELS[room.type]}
                      </span>
                    </div>
                    {room.guestName ? (
                      <p className="text-sm font-medium text-slate-600 mt-1">
                        {room.guestName}
                        {room.guestPhone && (
                          <span className="text-slate-400"> · {room.guestPhone}</span>
                        )}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 mt-1">No guest assigned</p>
                    )}
                  </div>
                  <p className="font-display font-black text-xl text-primary shrink-0">
                    {formatCurrency(getRoomFolioBalance(room), currencySymbol)}
                  </p>
                </div>

                {room.checkInDate && room.checkOutDate && (
                  <div className="grid grid-cols-3 gap-3">
                    <InfoChip label="Check-in" value={formatHotelDate(room.checkInDate)} />
                    <InfoChip label="Check-out" value={formatHotelDate(room.checkOutDate)} />
                    <InfoChip
                      label="Nights"
                      value={String(getRoomNights(room))}
                      highlight
                    />
                  </div>
                )}

                {/* Folio ledger */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Folio ledger
                  </p>
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    {room.folioEntries.length === 0 ? (
                      <p className="p-4 text-xs text-slate-400 text-center">No charges yet.</p>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-500 uppercase">
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2">Description</th>
                            <th className="px-3 py-2 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {room.folioEntries.map((e) => (
                            <tr key={e.id}>
                              <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{formatHotelDate(e.date)}</td>
                              <td className="px-3 py-2 font-medium text-slate-800">{e.description}</td>
                              <td className="px-3 py-2 text-right font-bold">{formatCurrency(e.amount, currencySymbol)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {room.status === "vacant" && (
                    <Button type="button" size="sm" onClick={() => { hotel.setSelectedRoomId(room.id); setShowCheckIn(true); }}>
                      <LogIn className="w-3.5 h-3.5" /> Check in
                    </Button>
                  )}
                  {(room.status === "occupied" || room.status === "checkout_pending") && (
                    <>
                      <Button type="button" size="sm" onClick={handlePostCart}>
                        <Receipt className="w-3.5 h-3.5" /> Post cart ({cartItemCount})
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => hotel.markCheckoutPending(room.id)}>
                        <LogOut className="w-3.5 h-3.5" /> Mark departing
                      </Button>
                      <Button type="button" size="sm" variant="danger" onClick={handleCheckOut}>
                        Check out & settle
                      </Button>
                    </>
                  )}
                  {room.status === "occupied" && room.checkOutDate && (
                    <div className={cn("flex items-end gap-2 w-full sm:w-auto mt-1 sm:mt-0", isTouch && "flex-col items-stretch")}>
                      <div className={isTouch ? "flex-1" : ""}>
                        <TouchDateInput
                          label={isTouch ? "New check-out date" : undefined}
                          value={extendDate || room.checkOutDate}
                          min={addDaysIso(room.checkOutDate, 1)}
                          onChange={(e) => setExtendDate(e.target.value)}
                          className={!isTouch ? "min-h-[36px] text-xs py-1.5" : undefined}
                        />
                      </div>
                      <Button type="button" size={isTouch ? "md" : "sm"} variant="ghost" onClick={handleExtendStay} fullWidth={isTouch}>
                        <CalendarPlus className="w-3.5 h-3.5" /> Extend stay
                      </Button>
                    </div>
                  )}
                  {room.status === "vacant" && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => hotel.setRoomStatus(room.id, "maintenance")}>
                      <Wrench className="w-3.5 h-3.5" /> Maintenance
                    </Button>
                  )}
                  {room.status === "maintenance" && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => hotel.setRoomStatus(room.id, "vacant")}>
                      Mark vacant
                    </Button>
                  )}
                  {room.status !== "occupied" && (
                    <Button type="button" size="sm" variant="ghost" onClick={handleRemoveRoom}>
                      <Trash2 className="w-3.5 h-3.5" /> Remove room
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <AddRoomModal
        open={showAddRoom}
        onClose={() => setShowAddRoom(false)}
        onSubmit={handleAddRoom}
        currencySymbol={currencySymbol}
      />
      <CheckInModal
        open={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        vacantRooms={vacantRooms}
        preselectedRoomId={room?.status === "vacant" ? room.id : undefined}
        onSubmit={handleCheckInSubmit}
        currencySymbol={currencySymbol}
      />
    </>
  );
}

function RoomListItem({
  room,
  selected,
  currencySymbol,
  isTouch,
  onSelect,
}: {
  room: HotelRoom;
  selected: boolean;
  currencySymbol: string;
  isTouch: boolean;
  onSelect: () => void;
}) {
  const nights = getRoomNights(room);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left transition-colors cursor-pointer touch-manipulation",
        isTouch ? "px-5 py-4 min-h-[72px]" : "px-4 py-3",
        selected ? "bg-indigo-50 border-l-2 border-l-primary" : "hover:bg-slate-50"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("font-mono font-black text-slate-900", isTouch ? "text-base" : "text-sm")}>#{room.number}</span>
        <Badge variant={STATUS_BADGE[room.status]}>{room.status.replace("_", " ")}</Badge>
      </div>
      <p className="text-[11px] text-slate-500 mt-0.5">
        {ROOM_TYPE_LABELS[room.type]} · Floor {room.floor}
      </p>
      {room.guestName && (
        <p className="text-xs font-bold text-slate-700 mt-1 truncate">{room.guestName}</p>
      )}
      {room.checkInDate && room.checkOutDate && (
        <p className="text-[10px] text-slate-400 mt-0.5">
          {formatHotelDate(room.checkInDate)} → {formatHotelDate(room.checkOutDate)} ({nights}n)
        </p>
      )}
      {room.folioEntries.length > 0 && (
        <p className="text-[10px] font-bold text-primary mt-0.5">
          Folio {formatCurrency(getRoomFolioBalance(room), currencySymbol)}
        </p>
      )}
    </button>
  );
}

function InfoChip({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
      <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
      <p className={`text-sm font-black ${highlight ? "text-primary" : "text-slate-800"}`}>{value}</p>
    </div>
  );
}
