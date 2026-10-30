"use client";

import React from "react";
import { useBooking } from "@/context/BookingContext";

export function Toast() {
  const { toastMessage } = useBooking();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed left-1/2 bottom-[calc(24px+env(safe-area-inset-bottom,0px))] z-80 bg-[var(--forest)] text-[var(--ivory)] px-5 py-3.5 text-[14px] pointer-events-none max-w-[calc(100%-32px)] text-center transition-all duration-300 shadow-xl border border-[rgba(243,238,229,0.15)] ${
        toastMessage
          ? "opacity-100 -translate-x-1/2 translate-y-0"
          : "opacity-0 -translate-x-1/2 translate-y-5"
      }`}
    >
      {toastMessage}
    </div>
  );
}
