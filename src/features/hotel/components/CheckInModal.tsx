import { useState, useEffect, useMemo } from "react";
import type { HotelRoom } from "@/types";
import { Modal, ModalHeader, Button, Input, Select, TouchDateInput } from "@/shared/ui";
import { useInteractionMode } from "@/context/InteractionModeContext";
import { formatCurrency } from "@/shared/utils/money";
import {
  addDaysIso,
  calculateNights,
  formatHotelDate,
  ROOM_TYPE_LABELS,
  todayIso,
} from "@/shared/utils/hotel";

interface CheckInModalProps {
  open: boolean;
  onClose: () => void;
  vacantRooms: HotelRoom[];
  preselectedRoomId?: string;
  onSubmit: (payload: {
    roomId: string;
    guestName: string;
    guestPhone: string;
    checkInDate: string;
    checkOutDate: string;
  }) => void;
  currencySymbol: string;
}

export function CheckInModal({
  open,
  onClose,
  vacantRooms,
  preselectedRoomId,
  onSubmit,
  currencySymbol,
}: CheckInModalProps) {
  const { isTouch } = useInteractionMode();
  const [roomId, setRoomId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkInDate, setCheckInDate] = useState(todayIso());
  const [checkOutDate, setCheckOutDate] = useState(addDaysIso(todayIso(), 1));

  useEffect(() => {
    if (open) {
      setRoomId(preselectedRoomId ?? vacantRooms[0]?.id ?? "");
      setGuestName("");
      setGuestPhone("");
      setCheckInDate(todayIso());
      setCheckOutDate(addDaysIso(todayIso(), 1));
    }
  }, [open, preselectedRoomId, vacantRooms]);

  const selectedRoom = vacantRooms.find((r) => r.id === roomId);
  const nights = useMemo(
    () => (checkInDate && checkOutDate ? calculateNights(checkInDate, checkOutDate) : 0),
    [checkInDate, checkOutDate]
  );
  const estimatedRoomCharge = selectedRoom && nights > 0 ? selectedRoom.nightlyRate * nights : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ roomId, guestName, guestPhone, checkInDate, checkOutDate });
  };

  return (
    <Modal open={open} onClose={onClose} panelClassName={isTouch ? "max-w-2xl" : "max-w-lg"}>
      <ModalHeader title="Guest check-in" subtitle="Multi-night stay with automatic room charges" />
      <form onSubmit={handleSubmit} className={isTouch ? "space-y-5 mt-2" : "space-y-4 mt-4"}>
        <Select
          label="Room"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          required
        >
          {vacantRooms.length === 0 ? (
            <option value="">No vacant rooms</option>
          ) : (
            vacantRooms.map((r) => (
              <option key={r.id} value={r.id}>
                #{r.number} — {ROOM_TYPE_LABELS[r.type]} ({formatCurrency(r.nightlyRate, currencySymbol)}/night)
              </option>
            ))
          )}
        </Select>

        <div className={isTouch ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-3"}>
          <Input
            label="Guest name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
          />
          <Input
            label="Phone"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="+234 …"
          />
        </div>

        <div className={isTouch ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-3"}>
          <TouchDateInput
            label="Check-in date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            required
          />
          <TouchDateInput
            label="Check-out date"
            value={checkOutDate}
            min={checkInDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            required
          />
        </div>

        {nights > 0 && selectedRoom && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm space-y-1">
            <p className="font-bold text-indigo-900">
              {nights} night{nights > 1 ? "s" : ""} · {formatHotelDate(checkInDate)} → {formatHotelDate(checkOutDate)}
            </p>
            <p className="text-indigo-700">
              Room charge posted to folio:{" "}
              <span className="font-black">{formatCurrency(estimatedRoomCharge, currencySymbol)}</span>
            </p>
          </div>
        )}

        {nights <= 0 && checkInDate && checkOutDate && (
          <p className="text-xs font-bold text-rose-600">Check-out must be after check-in.</p>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="submit" fullWidth disabled={vacantRooms.length === 0 || nights < 1}>
            Complete check-in
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
