import { useMemo, useState } from "react";
import {
  Plane,
  Search,
  ArrowRightLeft,
  Calendar,
  Users,
  Ticket,
  XCircle,
  CheckCircle2,
  Luggage,
} from "lucide-react";
import type { Product, TripType, CabinClass, FlightOffer } from "@/types";
import type { FlightBookingManagement } from "@/hooks/useFlightBooking";
import { flightBookingToProduct, priceForOffer } from "@/hooks/useFlightBooking";
import { AIRPORTS, CABIN_LABELS } from "@/mock/flights";
import { useNotice } from "@/context/NoticeContext";
import { formatCurrency } from "@/shared/utils/money";
import { cn } from "@/shared/utils/cn";
import { todayIso, addDaysIso } from "@/shared/utils/hotel";
import { Badge, Button, StatTile, Select, Input, TouchDateInput } from "@/shared/ui";
import { useInteractionMode } from "@/context/InteractionModeContext";
import { BookPassengersModal } from "./BookPassengersModal";

interface FlightBookingPanelProps {
  flights: FlightBookingManagement;
  currencySymbol: string;
  onAddToCart: (product: Product) => void;
}

type PanelTab = "search" | "bookings";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default" | "info"> = {
  confirmed: "success",
  checked_in: "info",
  pending: "warning",
  cancelled: "danger",
};

export function FlightBookingPanel({
  flights,
  currencySymbol,
  onAddToCart,
}: FlightBookingPanelProps) {
  const notice = useNotice();
  const { isTouch } = useInteractionMode();
  const [tab, setTab] = useState<PanelTab>("search");
  const [tripType, setTripType] = useState<TripType>("one_way");
  const [originCode, setOriginCode] = useState("LOS");
  const [destinationCode, setDestinationCode] = useState("ABV");
  const [departDate, setDepartDate] = useState(todayIso());
  const [returnDate, setReturnDate] = useState(addDaysIso(todayIso(), 7));
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [cabinClass, setCabinClass] = useState<CabinClass>("economy");
  const [showPassengers, setShowPassengers] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<string>("all");

  const passengerCount = adults + children;
  const selectedTotal = flights.computeSelectedTotal();

  const filteredBookings = useMemo(() => {
    if (bookingFilter === "all") return flights.bookings;
    return flights.bookings.filter((b) => b.status === bookingFilter);
  }, [flights.bookings, bookingFilter]);

  const handleSearch = () => {
    try {
      const result = flights.searchFlights({
        originCode,
        destinationCode,
        tripType,
        departDate,
        returnDate: tripType === "round_trip" ? returnDate : undefined,
        adults,
        children,
        cabinClass,
      });
      if (result.outbound.length === 0) {
        notice.showWarning("No flights found for this route. Try another airport pair.");
      } else {
        notice.showSuccess(`${result.outbound.length} outbound flight(s) found.`, "Search complete");
      }
    } catch (err) {
      notice.showError(err instanceof Error ? err.message : "Search failed");
    }
  };

  const handleSwapAirports = () => {
    setOriginCode(destinationCode);
    setDestinationCode(originCode);
  };

  const handleBook = (passengerForms: Parameters<typeof flights.createBooking>[0]["passengers"]) => {
    const offers = flights.getSelectedOffers();
    if (!offers?.outbound || !flights.lastSearch) {
      notice.showWarning("Select a flight first.");
      return;
    }
    if (flights.lastSearch.tripType === "round_trip" && !offers.returnOffer) {
      notice.showWarning("Select a return flight.");
      return;
    }

    const booking = flights.createBooking({
      outbound: offers.outbound,
      returnOffer: offers.returnOffer,
      departDate,
      returnDate: tripType === "round_trip" ? returnDate : undefined,
      tripType,
      passengers: passengerForms,
      adults,
      children,
      cabinClass,
    });

    onAddToCart(flightBookingToProduct(booking));
    setShowPassengers(false);
    setTab("bookings");
    notice.showSuccess(`Booking confirmed — PNR ${booking.pnr}`, "Ticket issued");
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5" />
              Travel desk
            </p>
            <h4 className="font-display font-bold text-lg text-slate-900">Flight booking</h4>
          </div>
          <div className={cn("flex gap-1 bg-slate-100 p-1 rounded-xl", isTouch && "p-1.5")}>
            {(["search", "bookings"] as PanelTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-lg font-bold uppercase cursor-pointer transition-colors",
                  isTouch ? "flex-1 px-4 py-3 text-sm min-h-[48px]" : "px-4 py-2 text-xs",
                  tab === t ? "bg-white text-primary shadow-sm" : "text-slate-500"
                )}
              >
                {t === "search" ? "Search" : "Bookings"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100 border-b border-slate-100">
          <StatTile label="Total bookings" value={String(flights.stats.total)} icon={<Ticket className="w-4 h-4" />} className="rounded-none border-0" />
          <StatTile label="Confirmed" value={String(flights.stats.confirmed)} tone="emerald" icon={<CheckCircle2 className="w-4 h-4" />} className="rounded-none border-0" />
          <StatTile label="Pending" value={String(flights.stats.pending)} tone="amber" icon={<Luggage className="w-4 h-4" />} className="rounded-none border-0" />
          <StatTile label="Ticket revenue" value={formatCurrency(flights.stats.revenue, currencySymbol)} tone="indigo" icon={<Plane className="w-4 h-4" />} className="rounded-none border-0" />
        </div>

        {tab === "search" && (
          <div className="p-5 space-y-5">
            {/* Search form */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-4">
              <div className={cn("flex gap-2", isTouch && "flex-col sm:flex-row")}>
                {(["one_way", "round_trip"] as TripType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTripType(t)}
                    className={cn(
                      "rounded-xl font-bold cursor-pointer",
                      isTouch ? "flex-1 px-5 py-3 text-sm min-h-[48px]" : "px-4 py-2 text-xs",
                      tripType === t ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-600"
                    )}
                  >
                    {t === "one_way" ? "One way" : "Round trip"}
                  </button>
                ))}
              </div>

              <div className={isTouch ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 md:grid-cols-12 gap-3 items-end"}>
                <div className={isTouch ? "" : "md:col-span-3"}>
                  <Select label="From" value={originCode} onChange={(e) => setOriginCode(e.target.value)}>
                    {AIRPORTS.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.code} — {a.city}
                      </option>
                    ))}
                  </Select>
                </div>
                {!isTouch && (
                <div className="md:col-span-1 flex justify-center pb-2">
                  <button
                    type="button"
                    onClick={handleSwapAirports}
                    className="p-2 rounded-full bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Swap"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-primary" />
                  </button>
                </div>
                )}
                <div className={isTouch ? "" : "md:col-span-3"}>
                  <Select label="To" value={destinationCode} onChange={(e) => setDestinationCode(e.target.value)}>
                    {AIRPORTS.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.code} — {a.city}
                      </option>
                    ))}
                  </Select>
                </div>
                {isTouch && (
                  <Button type="button" variant="ghost" fullWidth onClick={handleSwapAirports}>
                    <ArrowRightLeft className="w-4 h-4" />
                    Swap origin & destination
                  </Button>
                )}
                <div className={isTouch ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "contents"}>
                <div className={isTouch ? "" : "md:col-span-2"}>
                  <TouchDateInput label="Depart" value={departDate} min={todayIso()} onChange={(e) => setDepartDate(e.target.value)} />
                </div>
                {tripType === "round_trip" && (
                  <div className={isTouch ? "" : "md:col-span-2"}>
                    <TouchDateInput label="Return" value={returnDate} min={departDate} onChange={(e) => setReturnDate(e.target.value)} />
                  </div>
                )}
                </div>
              </div>

              <div className={isTouch ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 sm:grid-cols-4 gap-3"}>
                <Input label="Adults" type="number" min={1} max={9} value={String(adults)} onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value, 10) || 1))} />
                <Input label="Children" type="number" min={0} max={8} value={String(children)} onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value, 10) || 0))} />
                <Select label="Cabin" value={cabinClass} onChange={(e) => setCabinClass(e.target.value as CabinClass)}>
                  <option value="economy">Economy</option>
                  <option value="premium_economy">Premium Economy</option>
                  <option value="business">Business</option>
                </Select>
                <div className="flex items-end">
                  <Button type="button" fullWidth onClick={handleSearch}>
                    <Search className="w-4 h-4" />
                    Search flights
                  </Button>
                </div>
              </div>
            </div>

            {/* Results */}
            {flights.searchResults && (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Outbound · {departDate} · {passengerCount} passenger{passengerCount > 1 ? "s" : ""}
                  </p>
                  <div className="space-y-2">
                    {flights.searchResults.outbound.length === 0 ? (
                      <p className="text-sm text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-xl">No outbound flights.</p>
                    ) : (
                      flights.searchResults.outbound.map((offer) => (
                        <FlightOfferCard
                          key={offer.id}
                          offer={offer}
                          selected={flights.selectedOutboundId === offer.id}
                          cabinClass={cabinClass}
                          passengers={passengerCount}
                          currencySymbol={currencySymbol}
                          isTouch={isTouch}
                          onSelect={() => flights.setSelectedOutboundId(offer.id)}
                        />
                      ))
                    )}
                  </div>
                </div>

                {tripType === "round_trip" && flights.searchResults.returnFlights.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Return · {returnDate}
                    </p>
                    <div className="space-y-2">
                      {flights.searchResults.returnFlights.map((offer) => (
                        <FlightOfferCard
                          key={offer.id}
                          offer={offer}
                          selected={flights.selectedReturnId === offer.id}
                          cabinClass={cabinClass}
                          passengers={passengerCount}
                          currencySymbol={currencySymbol}
                          isTouch={isTouch}
                          onSelect={() => flights.setSelectedReturnId(offer.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedTotal > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                    <div>
                      <p className="text-xs font-bold text-indigo-900">Selected itinerary total</p>
                      <p className="font-display font-black text-2xl text-indigo-700">
                        {formatCurrency(selectedTotal, currencySymbol)}
                      </p>
                      <p className="text-[10px] text-indigo-600 mt-0.5">
                        {CABIN_LABELS[cabinClass]} · {passengerCount} traveler{passengerCount > 1 ? "s" : ""}
                      </p>
                    </div>
                    <Button type="button" size="lg" onClick={() => setShowPassengers(true)}>
                      <Ticket className="w-4 h-4" />
                      Book & add to cart
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "bookings" && (
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {["all", "confirmed", "checked_in", "cancelled"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setBookingFilter(f)}
                  className={cn(
                    "rounded-lg font-bold uppercase cursor-pointer",
                    isTouch ? "px-4 py-3 text-xs min-h-[44px]" : "px-3 py-1.5 text-[10px]",
                    bookingFilter === f ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                  )}
                >
                  {f.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredBookings.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10">No bookings yet.</p>
              ) : (
                filteredBookings.map((b) => (
                  <div key={b.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-primary">{b.pnr}</span>
                          <Badge variant={STATUS_VARIANT[b.status] ?? "default"}>{b.status.replace("_", " ")}</Badge>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{b.tripType.replace("_", " ")}</span>
                        </div>
                        <p className="font-bold text-slate-800 mt-1">
                          {b.outbound.originCode} → {b.outbound.destinationCode}
                          {b.returnLeg && ` → ${b.returnLeg.originCode}`}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {b.outbound.airline} {b.outbound.flightNumber} · {b.outbound.departDate} · {b.passengers.length} pax
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {b.passengers.map((p) => `${p.firstName} ${p.lastName}`).join(", ")}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-lg text-slate-900">{formatCurrency(b.totalAmount, currencySymbol)}</p>
                        <div className="flex gap-1 mt-2 justify-end">
                          {b.status === "confirmed" && (
                            <Button type="button" size="sm" variant="secondary" onClick={() => { flights.checkInBooking(b.id); notice.showSuccess(`PNR ${b.pnr} checked in.`); }}>
                              Check in
                            </Button>
                          )}
                          {b.status !== "cancelled" && (
                            <Button type="button" size="sm" variant="ghost" onClick={() => {
                              notice.showConfirm({
                                title: "Cancel booking?",
                                message: `Cancel PNR ${b.pnr}? Refund policy applies per fare rules.`,
                                confirmLabel: "Cancel",
                                variant: "danger",
                                onConfirm: () => { flights.cancelBooking(b.id); notice.showInfo(`PNR ${b.pnr} cancelled.`); },
                              });
                            }}>
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <BookPassengersModal
        open={showPassengers}
        onClose={() => setShowPassengers(false)}
        passengerCount={passengerCount}
        onSubmit={handleBook}
      />
    </>
  );
}

function FlightOfferCard({
  offer,
  selected,
  cabinClass,
  passengers,
  currencySymbol,
  isTouch,
  onSelect,
}: {
  offer: FlightOffer;
  selected: boolean;
  cabinClass: CabinClass;
  passengers: number;
  currencySymbol: string;
  isTouch: boolean;
  onSelect: () => void;
}) {
  const price = priceForOffer(offer, cabinClass, passengers);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-xl border transition-all cursor-pointer touch-manipulation",
        isTouch ? "p-5 min-h-[88px]" : "p-4",
        selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-200 bg-white hover:border-slate-300"
      )}
    >
      <div className={cn("flex justify-between gap-3", isTouch ? "flex-col" : "flex-col sm:flex-row sm:items-center")}>
        <div className="flex items-center gap-4">
          <div className={cn("rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600", isTouch ? "w-12 h-12 text-sm" : "w-10 h-10 text-xs")}>
            {offer.airlineCode}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900">{offer.airline}</p>
            <p className="text-xs text-slate-500">{offer.flightNumber} · {offer.stops === 0 ? "Direct" : `${offer.stops} stop`}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="font-black text-slate-900">{offer.departTime}</p>
            <p className="text-[10px] text-slate-400">{offer.originCode}</p>
          </div>
          <div className="flex flex-col items-center min-w-[80px]">
            <p className="text-[10px] text-slate-400">{offer.duration}</p>
            <div className="w-full h-px bg-slate-200 my-1 relative">
              <Plane className="w-3 h-3 text-primary absolute -top-1.5 left-1/2 -translate-x-1/2" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-black text-slate-900">{offer.arriveTime}</p>
            <p className="text-[10px] text-slate-400">{offer.destinationCode}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display font-black text-lg text-primary">{formatCurrency(price, currencySymbol)}</p>
          <p className="text-[10px] text-slate-400">{offer.seatsLeft} seats left</p>
        </div>
      </div>
    </button>
  );
}
