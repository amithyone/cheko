import type { FolioEntry, HotelRoom } from "@/types";

export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatHotelDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getRoomNights(room: HotelRoom): number {
  if (!room.checkInDate || !room.checkOutDate) return 0;
  return calculateNights(room.checkInDate, room.checkOutDate);
}

export function getFolioTotal(entries: FolioEntry[]): number {
  return entries.reduce((sum, e) => sum + e.amount, 0);
}

export function getRoomFolioBalance(room: HotelRoom): number {
  return getFolioTotal(room.folioEntries);
}

export const ROOM_TYPE_LABELS: Record<HotelRoom["type"], string> = {
  standard: "Standard",
  deluxe: "Deluxe",
  suite: "Suite",
};

export const ROOM_TYPE_RATES: Record<HotelRoom["type"], number> = {
  standard: 42000,
  deluxe: 65000,
  suite: 95000,
};

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
