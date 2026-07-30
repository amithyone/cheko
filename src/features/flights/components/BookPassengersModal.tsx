import { useState, useEffect, type FormEvent } from "react";
import type { PassengerInfo } from "@/types";
import { Modal, ModalHeader, Button, Input } from "@/shared/ui";
import { useInteractionMode } from "@/context/InteractionModeContext";
import { cn } from "@/shared/utils/cn";

interface BookPassengersModalProps {
  open: boolean;
  onClose: () => void;
  passengerCount: number;
  onSubmit: (passengers: PassengerInfo[]) => void;
}

const emptyPassenger = (): PassengerInfo => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  passportNo: "",
});

export function BookPassengersModal({
  open,
  onClose,
  passengerCount,
  onSubmit,
}: BookPassengersModalProps) {
  const { isTouch } = useInteractionMode();
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);

  useEffect(() => {
    if (open) {
      setPassengers(Array.from({ length: passengerCount }, emptyPassenger));
    }
  }, [open, passengerCount]);

  const update = (idx: number, field: keyof PassengerInfo, value: string) => {
    setPassengers((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const valid = passengers.every((p) => p.firstName.trim() && p.lastName.trim() && p.email.trim());
    if (!valid) return;
    onSubmit(passengers);
  };

  return (
    <Modal open={open} onClose={onClose} panelClassName={isTouch ? "max-w-2xl" : "max-w-lg"}>
      <ModalHeader
        title="Passenger details"
        subtitle={`Enter information for ${passengerCount} traveler${passengerCount > 1 ? "s" : ""}`}
      />
      <form
        onSubmit={handleSubmit}
        className={cn("space-y-5 mt-2 overflow-y-auto", isTouch ? "max-h-none" : "max-h-[60vh]")}
      >
        {passengers.map((p, idx) => (
          <div key={idx} className="border border-slate-100 rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Passenger {idx + 1}
            </p>
            <div className={cn("grid gap-3", isTouch ? "grid-cols-1" : "grid-cols-2")}>
              <Input
                label="First name"
                value={p.firstName}
                onChange={(e) => update(idx, "firstName", e.target.value)}
                required
              />
              <Input
                label="Last name"
                value={p.lastName}
                onChange={(e) => update(idx, "lastName", e.target.value)}
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={p.email}
              onChange={(e) => update(idx, "email", e.target.value)}
              required
            />
            <div className={cn("grid gap-3", isTouch ? "grid-cols-1" : "grid-cols-2")}>
              <Input
                label="Phone"
                value={p.phone}
                onChange={(e) => update(idx, "phone", e.target.value)}
              />
              <Input
                label="Passport no."
                value={p.passportNo ?? ""}
                onChange={(e) => update(idx, "passportNo", e.target.value)}
              />
            </div>
          </div>
        ))}
        <div className={cn("flex gap-2 pt-2 bg-white", isTouch ? "sticky bottom-0 pb-1" : "sticky bottom-0")}>
          <Button type="submit" fullWidth>
            Confirm & add to cart
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
