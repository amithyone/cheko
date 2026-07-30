import { useState, useEffect } from "react";
import type { HotelRoomType } from "@/types";
import { Modal, ModalHeader, Button, Input, Select } from "@/shared/ui";
import { ROOM_TYPE_RATES } from "@/shared/utils/hotel";

interface AddRoomModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    number: string;
    floor: number;
    type: HotelRoomType;
    nightlyRate: number;
  }) => void;
  currencySymbol: string;
}

export function AddRoomModal({ open, onClose, onSubmit, currencySymbol }: AddRoomModalProps) {
  const [number, setNumber] = useState("");
  const [floor, setFloor] = useState("1");
  const [type, setType] = useState<HotelRoomType>("standard");
  const [nightlyRate, setNightlyRate] = useState(String(ROOM_TYPE_RATES.standard));

  useEffect(() => {
    if (open) {
      setNumber("");
      setFloor("1");
      setType("standard");
      setNightlyRate(String(ROOM_TYPE_RATES.standard));
    }
  }, [open]);

  const handleTypeChange = (t: HotelRoomType) => {
    setType(t);
    setNightlyRate(String(ROOM_TYPE_RATES[t]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      number,
      floor: parseInt(floor, 10) || 1,
      type,
      nightlyRate: parseFloat(nightlyRate) || ROOM_TYPE_RATES[type],
    });
  };

  return (
    <Modal open={open} onClose={onClose} panelClassName="max-w-md">
      <ModalHeader title="Add room" subtitle="Register a new room on the property" />
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Room number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="601"
            required
          />
          <Input
            label="Floor"
            type="number"
            min={0}
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            required
          />
        </div>
        <Select
          label="Room type"
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as HotelRoomType)}
        >
          <option value="standard">Standard</option>
          <option value="deluxe">Deluxe</option>
          <option value="suite">Suite</option>
        </Select>
        <Input
          label={`Nightly rate (${currencySymbol})`}
          type="number"
          min={0}
          value={nightlyRate}
          onChange={(e) => setNightlyRate(e.target.value)}
          required
        />
        <div className="flex gap-2 pt-2">
          <Button type="submit" fullWidth>
            Add room
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
