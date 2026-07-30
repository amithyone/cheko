import { useState, useCallback, useMemo } from "react";
import type {
  CabinClass,
  CreateFlightBookingPayload,
  FlightBooking,
  FlightLegSnapshot,
  FlightOffer,
  FlightSearchParams,
  Product,
} from "@/types";
import { FLIGHT_OFFERS, generatePnr, CABIN_MULTIPLIER } from "@/mock/flights";
import { INITIAL_FLIGHT_BOOKINGS } from "@/mock/flight-bookings";

export interface FlightSearchResult {
  outbound: FlightOffer[];
  returnFlights: FlightOffer[];
}

export function priceForOffer(offer: FlightOffer, cabin: CabinClass, passengers: number): number {
  const cabinBase = offer.basePrice * (CABIN_MULTIPLIER[cabin] / CABIN_MULTIPLIER[offer.cabinClass]);
  return Math.round(cabinBase * passengers);
}

function offerToLeg(
  offer: FlightOffer,
  departDate: string,
  cabin: CabinClass,
  passengers: number
): FlightLegSnapshot {
  return {
    airline: offer.airline,
    flightNumber: offer.flightNumber,
    originCode: offer.originCode,
    destinationCode: offer.destinationCode,
    originCity: offer.originCity,
    destinationCity: offer.destinationCity,
    departTime: offer.departTime,
    arriveTime: offer.arriveTime,
    duration: offer.duration,
    departDate,
    cabinClass: cabin,
    price: priceForOffer(offer, cabin, passengers),
  };
}

export function flightBookingToProduct(booking: FlightBooking): Product {
  const route = `${booking.outbound.originCode} → ${booking.outbound.destinationCode}`;
  const pax = booking.passengers.length;
  return {
    sku: `#FLT-${booking.pnr}`,
    name: `${route} · ${booking.outbound.airline} · ${pax} pax · PNR ${booking.pnr}`,
    category: "Flights",
    price: booking.totalAmount,
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80",
    size: booking.tripType === "round_trip" ? "Round trip" : "One way",
    color: booking.outbound.cabinClass,
    stock: 1,
    stockIntegrity: "Optimal",
    segment: "Limited",
  };
}

export function useFlightBooking(initialBookings = INITIAL_FLIGHT_BOOKINGS) {
  const [bookings, setBookings] = useState<FlightBooking[]>(initialBookings);
  const [searchResults, setSearchResults] = useState<FlightSearchResult | null>(null);
  const [lastSearch, setLastSearch] = useState<FlightSearchParams | null>(null);
  const [selectedOutboundId, setSelectedOutboundId] = useState<string | null>(null);
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === "confirmed" || b.status === "checked_in").length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const revenue = bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((s, b) => s + b.totalAmount, 0);
    return { confirmed, pending, total: bookings.length, revenue };
  }, [bookings]);

  const searchFlights = useCallback((params: FlightSearchParams) => {
    if (params.originCode === params.destinationCode) {
      throw new Error("Origin and destination must be different");
    }
    const passengers = params.adults + params.children;
    const outbound = FLIGHT_OFFERS.filter(
      (f) =>
        f.originCode === params.originCode &&
        f.destinationCode === params.destinationCode &&
        f.seatsLeft >= passengers
    );

    let returnFlights: FlightOffer[] = [];
    if (params.tripType === "round_trip" && params.returnDate) {
      returnFlights = FLIGHT_OFFERS.filter(
        (f) =>
          f.originCode === params.destinationCode &&
          f.destinationCode === params.originCode &&
          f.seatsLeft >= passengers
      );
    }

    setLastSearch(params);
    setSearchResults({ outbound, returnFlights });
    setSelectedOutboundId(outbound[0]?.id ?? null);
    setSelectedReturnId(returnFlights[0]?.id ?? null);
    return { outbound, returnFlights };
  }, []);

  const createBooking = useCallback((payload: CreateFlightBookingPayload): FlightBooking => {
    const pax = payload.adults + payload.children;
    const outboundLeg = offerToLeg(
      payload.outbound,
      payload.departDate,
      payload.cabinClass,
      pax
    );

    let returnLeg: FlightLegSnapshot | undefined;
    if (payload.returnOffer && payload.returnDate) {
      returnLeg = offerToLeg(
        payload.returnOffer,
        payload.returnDate,
        payload.cabinClass,
        pax
      );
    }

    const booking: FlightBooking = {
      id: `bk-${Date.now()}`,
      pnr: generatePnr(),
      status: "confirmed",
      tripType: payload.tripType,
      passengers: payload.passengers,
      outbound: outboundLeg,
      returnLeg,
      totalAmount: outboundLeg.price + (returnLeg?.price ?? 0),
      bookedAt: new Date().toISOString(),
      contactEmail: payload.passengers[0]?.email ?? "",
    };

    setBookings((prev) => [booking, ...prev]);
    return booking;
  }, []);

  const cancelBooking = useCallback((id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b))
    );
  }, []);

  const checkInBooking = useCallback((id: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id && b.status === "confirmed" ? { ...b, status: "checked_in" as const } : b
      )
    );
  }, []);

  const getSelectedOffers = useCallback(() => {
    if (!searchResults || !selectedOutboundId) return null;
    const outbound = searchResults.outbound.find((f) => f.id === selectedOutboundId);
    const returnOffer = selectedReturnId
      ? searchResults.returnFlights.find((f) => f.id === selectedReturnId)
      : undefined;
    return { outbound, returnOffer };
  }, [searchResults, selectedOutboundId, selectedReturnId]);

  const computeSelectedTotal = useCallback(() => {
    if (!lastSearch) return 0;
    const offers = getSelectedOffers();
    if (!offers?.outbound) return 0;
    const pax = lastSearch.adults + lastSearch.children;
    let total = priceForOffer(offers.outbound, lastSearch.cabinClass, pax);
    if (offers.returnOffer) {
      total += priceForOffer(offers.returnOffer, lastSearch.cabinClass, pax);
    }
    return total;
  }, [lastSearch, getSelectedOffers]);

  return {
    bookings,
    searchResults,
    lastSearch,
    selectedOutboundId,
    selectedReturnId,
    setSelectedOutboundId,
    setSelectedReturnId,
    stats,
    searchFlights,
    createBooking,
    cancelBooking,
    checkInBooking,
    getSelectedOffers,
    computeSelectedTotal,
  };
}

export type FlightBookingManagement = ReturnType<typeof useFlightBooking>;
