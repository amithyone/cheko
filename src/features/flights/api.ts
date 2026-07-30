/**
 * Flight booking / travel desk API
 * Base path: /api/v1/flights/*
 */

import type {
  CreateFlightBookingPayload,
  FlightBooking,
  FlightOffer,
  FlightSearchParams,
} from "@/types";

export interface FlightSearchResponse {
  outbound: FlightOffer[];
  returnFlights: FlightOffer[];
}

/** GET /api/v1/flights/airports */
export async function listAirports(): Promise<{ code: string; city: string; name: string }[]> {
  throw new Error("Not implemented");
}

/** POST /api/v1/flights/search */
export async function searchFlights(_params: FlightSearchParams): Promise<FlightSearchResponse> {
  throw new Error("Not implemented — integrate GDS or airline API");
}

/** GET /api/v1/flights/bookings */
export async function listBookings(): Promise<FlightBooking[]> {
  throw new Error("Not implemented");
}

/** POST /api/v1/flights/bookings */
export async function createBooking(
  _payload: CreateFlightBookingPayload
): Promise<FlightBooking> {
  throw new Error("Not implemented");
}

/** POST /api/v1/flights/bookings/:id/check-in */
export async function checkInBooking(_bookingId: string): Promise<FlightBooking> {
  throw new Error("Not implemented");
}

/** POST /api/v1/flights/bookings/:id/cancel */
export async function cancelBooking(_bookingId: string): Promise<FlightBooking> {
  throw new Error("Not implemented");
}
