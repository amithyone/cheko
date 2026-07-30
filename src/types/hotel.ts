export type HotelRoomType = "standard" | "deluxe" | "suite";
export type HotelRoomStatus = "occupied" | "vacant" | "checkout_pending" | "maintenance";

export type FolioCategory = "room" | "service" | "minibar" | "spa" | "other";

export interface FolioEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: FolioCategory;
}

export interface HotelRoom {
  id: string;
  number: string;
  floor: number;
  type: HotelRoomType;
  nightlyRate: number;
  status: HotelRoomStatus;
  guestName: string;
  guestPhone: string;
  checkInDate: string | null;
  checkOutDate: string | null;
  folioEntries: FolioEntry[];
}

export interface CheckInPayload {
  roomId: string;
  guestName: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
}

export interface AddRoomPayload {
  number: string;
  floor: number;
  type: HotelRoomType;
  nightlyRate: number;
}
