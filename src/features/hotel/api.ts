/**
 * Hotel / property management API
 * Base path: /api/v1/hotel/*
 */

import type { AddRoomPayload, CheckInPayload, FolioEntry, HotelRoom } from "@/types";

/** GET /api/v1/hotel/rooms */
export async function listRooms(): Promise<HotelRoom[]> {
  throw new Error("Not implemented");
}

/** POST /api/v1/hotel/rooms */
export async function createRoom(_payload: AddRoomPayload): Promise<HotelRoom> {
  throw new Error("Not implemented");
}

/** DELETE /api/v1/hotel/rooms/:id */
export async function deleteRoom(_roomId: string): Promise<void> {
  throw new Error("Not implemented");
}

/** PATCH /api/v1/hotel/rooms/:id/status */
export async function updateRoomStatus(
  _roomId: string,
  _status: HotelRoom["status"]
): Promise<HotelRoom> {
  throw new Error("Not implemented");
}

/** POST /api/v1/hotel/rooms/:id/check-in */
export async function checkInGuest(_payload: CheckInPayload): Promise<HotelRoom> {
  throw new Error("Not implemented");
}

/** POST /api/v1/hotel/rooms/:id/check-out */
export async function checkOutGuest(_roomId: string): Promise<HotelRoom> {
  throw new Error("Not implemented");
}

/** POST /api/v1/hotel/rooms/:id/extend-stay */
export async function extendStay(_roomId: string, _newCheckOutDate: string): Promise<HotelRoom> {
  throw new Error("Not implemented");
}

/** POST /api/v1/hotel/rooms/:id/folio */
export async function postFolioCharge(
  _roomId: string,
  _entry: Omit<FolioEntry, "id">
): Promise<FolioEntry> {
  throw new Error("Not implemented");
}
