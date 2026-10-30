"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SAMPLE_HOTELS, SAMPLE_ADDONS, SampleHotel } from "@/lib/sample-data";
import { calculatePricing, StayPricingBreakdown, RoomSelection, AddonSelection } from "@/lib/pricing";

interface GuestInfo {
  title: string;
  first: string;
  last: string;
  email: string;
  mobile: string;
  arrival: string;
  note: string;
}

interface BookingContextType {
  hotelId: string;
  setHotelId: (id: string) => void;
  hotel: SampleHotel;
  arrive: string;
  setArrive: (date: string) => void;
  depart: string;
  setDepart: (date: string) => void;
  adults: number;
  setAdults: (n: number) => void;
  children: number;
  setChildren: (n: number) => void;
  roomsCount: number;
  setRoomsCount: (n: number) => void;
  destFilter: string;
  setDestFilter: (dest: string) => void;
  qty: Record<string, number>;
  setRoomQty: (key: string, qty: number) => void;
  clearRoomQty: () => void;
  addons: Record<string, boolean>;
  toggleAddon: (id: string) => void;
  paymentMethod: "upi" | "card" | "net" | "hotel";
  setPaymentMethod: (method: "upi" | "card" | "net" | "hotel") => void;
  guest: GuestInfo;
  updateGuest: (field: keyof GuestInfo, value: string) => void;
  bookingRef: string | null;
  setBookingRef: (ref: string | null) => void;
  isSheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  isNavOpen: boolean;
  openNav: () => void;
  closeNav: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  pricing: StayPricingBreakdown;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [hotelId, setHotelId] = useState<string>("udr");
  const [arrive, setArrive] = useState<string>("2026-11-13");
  const [depart, setDepart] = useState<string>("2026-11-16");
  const [adults, setAdults] = useState<number>(2);
  const [childrenCount, setChildren] = useState<number>(0);
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [destFilter, setDestFilter] = useState<string>("all");

  const [qty, setQty] = useState<Record<string, number>>({
    "junior-flex": 1,
  });

  const [addons, setAddons] = useState<Record<string, boolean>>({
    boat: true,
  });

  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "net" | "hotel">("upi");

  const [guest, setGuest] = useState<GuestInfo>({
    title: "Ms",
    first: "",
    last: "",
    email: "",
    mobile: "",
    arrival: "2 – 4 PM",
    note: "",
  });

  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const hotel = SAMPLE_HOTELS.find((h) => h.id === hotelId) || SAMPLE_HOTELS[0];

  const setRoomQty = (key: string, newQty: number) => {
    setQty((prev) => ({
      ...prev,
      [key]: Math.max(0, newQty),
    }));
  };

  const clearRoomQty = () => {
    setQty({});
  };

  const toggleAddon = (id: string) => {
    setAddons((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const updateGuest = (field: keyof GuestInfo, value: string) => {
    setGuest((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Convert current selection to pricing input
  const selectedRooms: RoomSelection[] = [];
  hotel.rooms.forEach((r) => {
    // Check flexible
    const flexQty = qty[`${r.id}-flex`] || 0;
    if (flexQty > 0) {
      selectedRooms.push({
        roomId: r.id,
        roomName: r.name,
        planType: "flex",
        planName: "Flexible · breakfast for two",
        nightlyRatePaise: r.baseRate,
        quantity: flexQty,
      });
    }

    // Check advance purchase (-12%)
    const advQty = qty[`${r.id}-adv`] || 0;
    if (advQty > 0) {
      const advRate = Math.round((r.baseRate * 0.88) / 1000) * 1000;
      selectedRooms.push({
        roomId: r.id,
        roomName: r.name,
        planType: "adv",
        planName: "Advance purchase · breakfast for two",
        nightlyRatePaise: advRate,
        quantity: advQty,
      });
    }
  });

  const selectedAddons: AddonSelection[] = [];
  SAMPLE_ADDONS.forEach((a) => {
    if (addons[a.code]) {
      selectedAddons.push({
        id: a.code,
        name: a.name,
        pricePaise: a.pricePaise,
      });
    }
  });

  const pricing = calculatePricing({
    arriveDate: arrive,
    departDate: depart,
    rooms: selectedRooms,
    addons: selectedAddons,
    applyDirectDiscount: true,
  });

  return (
    <BookingContext.Provider
      value={{
        hotelId,
        setHotelId,
        hotel,
        arrive,
        setArrive,
        depart,
        setDepart,
        adults,
        setAdults,
        children: childrenCount,
        setChildren,
        roomsCount,
        setRoomsCount,
        destFilter,
        setDestFilter,
        qty,
        setRoomQty,
        clearRoomQty,
        addons,
        toggleAddon,
        paymentMethod,
        setPaymentMethod,
        guest,
        updateGuest,
        bookingRef,
        setBookingRef,
        isSheetOpen,
        openSheet: () => setIsSheetOpen(true),
        closeSheet: () => setIsSheetOpen(false),
        isNavOpen,
        openNav: () => setIsNavOpen(true),
        closeNav: () => setIsNavOpen(false),
        toastMessage,
        showToast,
        pricing,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
