"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SAMPLE_HOTELS } from "@/lib/sample-data";
import { useBooking } from "@/context/BookingContext";
import { formatDateLabel, formatINR } from "@/lib/pricing";

export function PlanStaySheet() {
  const router = useRouter();
  const {
    isSheetOpen,
    closeSheet,
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
    setHotelId,
    setRoomQty,
    clearRoomQty,
  } = useBooking();

  // Internal sheet editing state
  const [localDest, setLocalDest] = useState<string>(destFilter);
  const [localArrive, setLocalArrive] = useState<string>(arrive);
  const [localDepart, setLocalDepart] = useState<string>(depart);
  const [localAdults, setLocalAdults] = useState<number>(adults);
  const [localChildren, setLocalChildren] = useState<number>(childrenCount);
  const [localRooms, setLocalRooms] = useState<number>(roomsCount);
  const [isPickingEnd, setIsPickingEnd] = useState<boolean>(false);

  // Calendar month state
  const [viewYear, setViewYear] = useState<number>(() => {
    return new Date(`${arrive}T12:00:00`).getFullYear() || 2026;
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return new Date(`${arrive}T12:00:00`).getMonth() || 10;
  });

  useEffect(() => {
    if (isSheetOpen) {
      setLocalDest(destFilter);
      setLocalArrive(arrive);
      setLocalDepart(depart);
      setLocalAdults(adults);
      setLocalChildren(childrenCount);
      setLocalRooms(roomsCount);
      setIsPickingEnd(false);

      const a = new Date(`${arrive}T12:00:00`);
      if (!isNaN(a.getTime())) {
        setViewYear(a.getFullYear());
        setViewMonth(a.getMonth());
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSheetOpen, destFilter, arrive, depart, adults, childrenCount, roomsCount]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSheetOpen) {
        closeSheet();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSheetOpen, closeSheet]);

  if (!isSheetOpen) return null;

  // Calendar rendering helpers
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const pad = (n: number) => (n < 10 ? "0" + n : "" + n);
  const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayIso = toIso(today);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1, 12);
  const leadEmptyDays = firstDayOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthName = firstDayOfMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const canPrevMonth =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const handleDayClick = (dayIso: string) => {
    if (!isPickingEnd || dayIso <= localArrive) {
      setLocalArrive(dayIso);
      setIsPickingEnd(true);
    } else {
      setLocalDepart(dayIso);
      setIsPickingEnd(false);
    }
  };

  const handlePrevMonth = () => {
    if (!canPrevMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleReset = () => {
    const t = new Date();
    t.setDate(t.getDate() + 14);
    const d = new Date(t);
    d.setDate(d.getDate() + 3);
    setLocalArrive(toIso(t));
    setLocalDepart(toIso(d));
    setLocalAdults(2);
    setLocalChildren(0);
    setLocalRooms(1);
    setLocalDest("all");
    setIsPickingEnd(false);
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
  };

  const handleApply = () => {
    if (isPickingEnd) return;
    setArrive(localArrive);
    setDepart(localDepart);
    setAdults(localAdults);
    setChildren(localChildren);
    setRoomsCount(localRooms);
    setDestFilter(localDest);

    closeSheet();

    if (localDest !== "all") {
      setHotelId(localDest);
      clearRoomQty();
      const targetHotel = SAMPLE_HOTELS.find((h) => h.id === localDest);
      if (targetHotel && targetHotel.rooms[0]) {
        setRoomQty(`${targetHotel.rooms[0].id}-flex`, Math.min(localRooms, targetHotel.rooms[0].inventory));
      }
      router.push(`/hotels/${targetHotel?.slug || ""}`);
    } else {
      router.push("/hotels");
    }
  };

  const pool = SAMPLE_HOTELS.filter((h) => localDest === "all" || h.id === localDest);
  const minPrice = Math.min(...pool.map((h) => h.basePrice));
  const diffNights = Math.round(
    (new Date(`${localDepart}T12:00:00`).getTime() - new Date(`${localArrive}T12:00:00`).getTime()) /
      86400000
  );

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeSheet}
        className="fixed inset-0 z-75 bg-[rgba(9,13,11,0.55)] transition-opacity duration-300"
      />

      {/* Sheet Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheetTitle"
        className="fixed left-0 right-0 bottom-0 z-76 max-h-[calc(100%-env(safe-area-inset-top,0px)-40px)] bg-[var(--ivory)] text-[var(--ink)] flex flex-col shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
      >
        <div className="overflow-y-auto px-[max(var(--gutR),20px)] pt-3 pb-5 flex flex-col gap-4">
          <span className="self-center w-9 h-[3px] bg-[#C9BFAE] mt-1" aria-hidden="true" />

          {/* Title Header */}
          <div className="flex justify-between items-center">
            <h2 id="sheetTitle" className="disp text-[32px] font-normal m-0">
              Plan your stay
            </h2>
            <button
              type="button"
              onClick={closeSheet}
              className="round border-0 bg-transparent w-11 h-11 p-0 cursor-pointer text-[var(--ink)]"
              aria-label="Close"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Destination Chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-[max(var(--gutR),20px)] px-[max(var(--gutR),20px)] pb-1" role="group" aria-label="Destination">
            <button
              type="button"
              onClick={() => setLocalDest("all")}
              className={`flex-none h-11 px-4 border text-[11px] cap cursor-pointer transition-colors ${
                localDest === "all"
                  ? "bg-[var(--forest)] text-[var(--ivory)] border-[var(--forest)]"
                  : "bg-transparent text-[var(--ink)] border-[#B9AF9C]"
              }`}
              aria-pressed={localDest === "all"}
            >
              All hotels
            </button>
            {SAMPLE_HOTELS.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setLocalDest(h.id)}
                className={`flex-none h-11 px-4 border text-[11px] cap cursor-pointer transition-colors ${
                  localDest === h.id
                    ? "bg-[var(--forest)] text-[var(--ivory)] border-[var(--forest)]"
                    : "bg-transparent text-[var(--ink)] border-[#B9AF9C]"
                }`}
                aria-pressed={localDest === h.id}
              >
                {h.city}
              </button>
            ))}
          </div>

          {/* Dates Display Box */}
          <div className="grid grid-cols-2 border-y border-[var(--line)] py-2.5">
            <div className="flex flex-col gap-0.5">
              <span className="cap text-[11px] text-[var(--brass-text)]">Arrive</span>
              <b className="disp text-[22px] font-normal">{formatDateLabel(localArrive)}</b>
            </div>
            <div className="flex flex-col gap-0.5 border-l border-[var(--line)] pl-4">
              <span className="cap text-[11px] text-[var(--brass-text)]">Depart</span>
              <b className="disp text-[22px] font-normal">
                {isPickingEnd ? "Select date" : formatDateLabel(localDepart)}
              </b>
            </div>
          </div>

          {/* Calendar Picker */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={!canPrevMonth}
                className="w-11 h-11 border-0 bg-transparent cursor-pointer text-[var(--ink)] disabled:opacity-25"
                aria-label="Previous month"
              >
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M20 6H1M6 1L1 6l5 5" />
                </svg>
              </button>
              <span className="cap text-[12px]">{monthName}</span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-11 h-11 border-0 bg-transparent cursor-pointer text-[var(--ink)]"
                aria-label="Next month"
              >
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M0 6h19M14 1l5 5-5 5" />
                </svg>
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 cap text-[11px] text-[var(--muted)] text-center" aria-hidden="true">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {Array.from({ length: leadEmptyDays }).map((_, idx) => (
                <span key={`empty-${idx}`} aria-hidden="true" className="h-11" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateObj = new Date(viewYear, viewMonth, dayNum, 12);
                const dayIso = toIso(dateObj);
                const isPast = dayIso < todayIso;
                const isStart = dayIso === localArrive;
                const isEnd = dayIso === localDepart && !isPickingEnd;
                const isMid = !isPickingEnd && dayIso > localArrive && dayIso < localDepart;

                let bgClass = "bg-transparent";
                if (isStart && isEnd) {
                  bgClass = "bg-transparent";
                } else if (isStart) {
                  bgClass = "bg-[linear-gradient(90deg,transparent_50%,#E6DCC9_50%)]";
                } else if (isEnd) {
                  bgClass = "bg-[linear-gradient(90deg,#E6DCC9_50%,transparent_50%)]";
                } else if (isMid) {
                  bgClass = "bg-[#E6DCC9]";
                }

                return (
                  <button
                    key={dayIso}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleDayClick(dayIso)}
                    className={`h-11 border-0 p-0 flex items-center justify-center disp text-[19px] tabular-nums text-[var(--ink)] cursor-pointer disabled:text-[#A9A296] disabled:line-through ${bgClass}`}
                  >
                    <i
                      className={`w-10 h-10 rounded-full not-italic flex items-center justify-center ${
                        isStart || isEnd
                          ? "bg-[var(--forest)] text-[var(--ivory)]"
                          : ""
                      }`}
                    >
                      {dayNum}
                    </i>
                  </button>
                );
              })}
            </div>

            <span className="text-[13px] font-light text-[var(--muted)]">
              {isPickingEnd
                ? "Now tap your departure date."
                : `${diffNights} ${diffNights > 1 ? "nights" : "night"} · rates from ${formatINR(
                    minPrice
                  )} a night`}
            </span>
          </div>

          {/* Stepper Counters */}
          <div className="flex flex-col">
            {/* Adults */}
            <div className="flex justify-between items-center min-h-[56px] border-b border-[var(--line)]">
              <div>
                <b className="disp text-[21px] font-normal">Adults</b>
                <small className="block text-[12px] text-[var(--muted)]">13 years and above</small>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLocalAdults((v) => Math.max(1, v - 1))}
                  disabled={localAdults <= 1}
                  className="w-10 h-10 rounded-full border border-[#C9BFAE] bg-transparent text-[16px] cursor-pointer disabled:opacity-35"
                >
                  −
                </button>
                <output className="min-w-[30px] text-center text-[17px] font-medium tabular-nums">
                  {localAdults}
                </output>
                <button
                  type="button"
                  onClick={() => setLocalAdults((v) => Math.min(8, v + 1))}
                  disabled={localAdults >= 8}
                  className="w-10 h-10 rounded-full border-0 bg-[var(--forest)] text-[var(--ivory)] text-[16px] cursor-pointer disabled:opacity-35"
                >
                  +
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex justify-between items-center min-h-[56px] border-b border-[var(--line)]">
              <div>
                <b className="disp text-[21px] font-normal">Children</b>
                <small className="block text-[12px] text-[var(--muted)]">Under 6 stay free</small>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLocalChildren((v) => Math.max(0, v - 1))}
                  disabled={localChildren <= 0}
                  className="w-10 h-10 rounded-full border border-[#C9BFAE] bg-transparent text-[16px] cursor-pointer disabled:opacity-35"
                >
                  −
                </button>
                <output className="min-w-[30px] text-center text-[17px] font-medium tabular-nums">
                  {localChildren}
                </output>
                <button
                  type="button"
                  onClick={() => setLocalChildren((v) => Math.min(4, v + 1))}
                  disabled={localChildren >= 4}
                  className="w-10 h-10 rounded-full border-0 bg-[var(--forest)] text-[var(--ivory)] text-[16px] cursor-pointer disabled:opacity-35"
                >
                  +
                </button>
              </div>
            </div>

            {/* Rooms */}
            <div className="flex justify-between items-center min-h-[56px] border-b border-[var(--line)]">
              <div>
                <b className="disp text-[21px] font-normal">Rooms</b>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLocalRooms((v) => Math.max(1, v - 1))}
                  disabled={localRooms <= 1}
                  className="w-10 h-10 rounded-full border border-[#C9BFAE] bg-transparent text-[16px] cursor-pointer disabled:opacity-35"
                >
                  −
                </button>
                <output className="min-w-[30px] text-center text-[17px] font-medium tabular-nums">
                  {localRooms}
                </output>
                <button
                  type="button"
                  onClick={() => setLocalRooms((v) => Math.min(4, v + 1))}
                  disabled={localRooms >= 4}
                  className="w-10 h-10 rounded-full border-0 bg-[var(--forest)] text-[var(--ivory)] text-[16px] cursor-pointer disabled:opacity-35"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center gap-3 px-[max(var(--gutR),20px)] py-3.5 pb-[calc(16px+env(safe-area-inset-bottom,0px))] border-t border-[var(--line)] bg-[var(--ivory)]">
          <button
            type="button"
            onClick={handleReset}
            className="lnk cap text-[var(--ink)] cursor-pointer"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isPickingEnd}
            className="btn btn-dark disabled:opacity-50"
          >
            {localDest === "all" ? `Show ${pool.length} hotels` : "See rooms"}
          </button>
        </div>
      </div>
    </>
  );
}
