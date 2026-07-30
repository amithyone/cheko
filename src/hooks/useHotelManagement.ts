import { useState, useCallback, useMemo } from "react";
import type { AddRoomPayload, CheckInPayload, FolioEntry, HotelRoom } from "@/types";
import { INITIAL_HOTEL_ROOMS } from "@/mock/hotel-rooms";
import {
  calculateNights,
  formatHotelDate,
  getFolioTotal,
  getRoomFolioBalance,
  getRoomNights,
  ROOM_TYPE_LABELS,
} from "@/shared/utils/hotel";

export function useHotelManagement(initialRooms = INITIAL_HOTEL_ROOMS) {
  const [rooms, setRooms] = useState<HotelRoom[]>(initialRooms);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    initialRooms.find((r) => r.status === "occupied")?.id ?? initialRooms[0]?.id ?? ""
  );

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId) ?? null,
    [rooms, selectedRoomId]
  );

  const stats = useMemo(() => {
    const occupied = rooms.filter((r) => r.status === "occupied").length;
    const vacant = rooms.filter((r) => r.status === "vacant").length;
    const checkoutPending = rooms.filter((r) => r.status === "checkout_pending").length;
    const maintenance = rooms.filter((r) => r.status === "maintenance").length;
    const totalFolio = rooms.reduce((sum, r) => sum + getRoomFolioBalance(r), 0);
    const arrivalsToday = rooms.filter(
      (r) => r.checkInDate === new Date().toISOString().slice(0, 10)
    ).length;
    return { occupied, vacant, checkoutPending, maintenance, totalFolio, arrivalsToday, total: rooms.length };
  }, [rooms]);

  const addRoom = useCallback((payload: AddRoomPayload) => {
    const duplicate = rooms.some((r) => r.number === payload.number.trim());
    if (duplicate) throw new Error("Room number already exists");

    const room: HotelRoom = {
      id: `room-${Date.now()}`,
      number: payload.number.trim(),
      floor: payload.floor,
      type: payload.type,
      nightlyRate: payload.nightlyRate,
      status: "vacant",
      guestName: "",
      guestPhone: "",
      checkInDate: null,
      checkOutDate: null,
      folioEntries: [],
    };
    setRooms((prev) => [...prev, room].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })));
    setSelectedRoomId(room.id);
    return room;
  }, [rooms]);

  const checkIn = useCallback((payload: CheckInPayload) => {
    const nights = calculateNights(payload.checkInDate, payload.checkOutDate);
    if (nights < 1) throw new Error("Check-out must be after check-in");

    const target = rooms.find((r) => r.id === payload.roomId);
    if (!target) throw new Error("Room not found");
    if (target.status === "occupied") throw new Error("Room is already occupied");
    if (target.status === "maintenance") throw new Error("Room is under maintenance");

    const roomCharge = target.nightlyRate * nights;
    const roomEntry: FolioEntry = {
      id: `folio-${Date.now()}`,
      date: payload.checkInDate,
      description: `Room charge — ${nights} night${nights > 1 ? "s" : ""} (${ROOM_TYPE_LABELS[target.type]})`,
      amount: roomCharge,
      category: "room",
    };

    setRooms((prev) =>
      prev.map((r) =>
        r.id === payload.roomId
          ? {
              ...r,
              status: "occupied" as const,
              guestName: payload.guestName.trim(),
              guestPhone: payload.guestPhone.trim(),
              checkInDate: payload.checkInDate,
              checkOutDate: payload.checkOutDate,
              folioEntries: [roomEntry],
            }
          : r
      )
    );
    setSelectedRoomId(payload.roomId);
  }, [rooms]);

  const checkOut = useCallback((roomId: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              status: "vacant" as const,
              guestName: "",
              guestPhone: "",
              checkInDate: null,
              checkOutDate: null,
              folioEntries: [],
            }
          : r
      )
    );
  }, []);

  const markCheckoutPending = useCallback((roomId: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status: "checkout_pending" as const } : r))
    );
  }, []);

  const extendStay = useCallback((roomId: string, newCheckOutDate: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId || !r.checkInDate || !r.checkOutDate) return r;
        const oldNights = calculateNights(r.checkInDate, r.checkOutDate);
        const newNights = calculateNights(r.checkInDate, newCheckOutDate);
        const extraNights = newNights - oldNights;
        if (extraNights <= 0) throw new Error("New checkout must extend the stay");

        const extraCharge = r.nightlyRate * extraNights;
        const entry: FolioEntry = {
          id: `folio-ext-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          description: `Extended stay — +${extraNights} night${extraNights > 1 ? "s" : ""}`,
          amount: extraCharge,
          category: "room",
        };

        return {
          ...r,
          checkOutDate: newCheckOutDate,
          folioEntries: [...r.folioEntries, entry],
        };
      })
    );
  }, []);

  const postChargesToFolio = useCallback(
    (roomId: string, amount: number, description: string, category: FolioEntry["category"] = "service") => {
      const entry: FolioEntry = {
        id: `folio-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        description,
        amount,
        category,
      };
      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId ? { ...r, folioEntries: [...r.folioEntries, entry] } : r
        )
      );
    },
    []
  );

  const setRoomStatus = useCallback((roomId: string, status: HotelRoom["status"]) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        if (status === "vacant" || status === "maintenance") {
          return {
            ...r,
            status,
            guestName: "",
            guestPhone: "",
            checkInDate: null,
            checkOutDate: null,
            folioEntries: [],
          };
        }
        return { ...r, status };
      })
    );
  }, []);

  const removeRoom = useCallback((roomId: string) => {
    setRooms((prev) => {
      const room = prev.find((r) => r.id === roomId);
      if (!room) return prev;
      if (room.status === "occupied") throw new Error("Cannot remove an occupied room");
      const next = prev.filter((r) => r.id !== roomId);
      if (selectedRoomId === roomId && next.length > 0) {
        setSelectedRoomId(next[0].id);
      }
      return next;
    });
  }, [selectedRoomId]);

  return {
    rooms,
    selectedRoom,
    selectedRoomId,
    setSelectedRoomId,
    stats,
    addRoom,
    checkIn,
    checkOut,
    markCheckoutPending,
    extendStay,
    postChargesToFolio,
    setRoomStatus,
    removeRoom,
    getRoomNights,
    getRoomFolioBalance,
    getFolioTotal,
    formatHotelDate,
  };
}

export type HotelManagement = ReturnType<typeof useHotelManagement>;
