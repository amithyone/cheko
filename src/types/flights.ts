export type CabinClass = "economy" | "premium_economy" | "business";
export type TripType = "one_way" | "round_trip";
export type FlightBookingStatus = "confirmed" | "pending" | "cancelled" | "checked_in";

export interface Airport {
  code: string;
  city: string;
  name: string;
}

export interface FlightOffer {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  stops: number;
  cabinClass: CabinClass;
  basePrice: number;
  seatsLeft: number;
}

export interface FlightLegSnapshot {
  airline: string;
  flightNumber: string;
  originCode: string;
  destinationCode: string;
  originCity: string;
  destinationCity: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  departDate: string;
  cabinClass: CabinClass;
  price: number;
}

export interface PassengerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passportNo?: string;
  seat?: string;
}

export interface FlightBooking {
  id: string;
  pnr: string;
  status: FlightBookingStatus;
  tripType: TripType;
  passengers: PassengerInfo[];
  outbound: FlightLegSnapshot;
  returnLeg?: FlightLegSnapshot;
  totalAmount: number;
  bookedAt: string;
  contactEmail: string;
}

export interface FlightSearchParams {
  originCode: string;
  destinationCode: string;
  tripType: TripType;
  departDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  cabinClass: CabinClass;
}

export interface CreateFlightBookingPayload {
  outbound: FlightOffer;
  returnOffer?: FlightOffer;
  departDate: string;
  returnDate?: string;
  tripType: TripType;
  passengers: PassengerInfo[];
  adults: number;
  children: number;
  cabinClass: CabinClass;
}
