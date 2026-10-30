"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBooking } from "@/context/BookingContext";

export function MobileTabBar() {
  const pathname = usePathname();
  const { bookingRef, showToast } = useBooking();

  // Hide on checkout or specific hotel detail view where Reserve bottom bar is shown
  const isHotelDetailPage = pathname.startsWith("/hotels/") && pathname !== "/hotels";
  const isCheckout = pathname === "/checkout";

  if (isHotelDetailPage || isCheckout) {
    return null;
  }

  const isHome = pathname === "/";
  const isHotels = pathname === "/hotels";
  const isStays = pathname.startsWith("/booking/");

  return (
    <nav
      id="tabbar"
      aria-label="Mobile App Navigation"
      className="hidden max-[900px]:grid fixed left-0 right-0 bottom-0 z-45 grid-cols-4 bg-[var(--ivory)] border-t border-[var(--line)] px-[max(var(--gut),0px)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <Link
        href="/"
        className={`h-[62px] flex flex-col items-center justify-center gap-1 cap text-[11px] no-underline border-0 bg-transparent cursor-pointer p-0 ${
          isHome ? "text-[var(--brass-text)] font-medium" : "text-[var(--muted)]"
        }`}
        aria-current={isHome ? "page" : undefined}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          aria-hidden="true"
        >
          <path d="M3 11l9-7 9 7v9H3z" />
        </svg>
        Home
      </Link>

      <Link
        href="/hotels"
        className={`h-[62px] flex flex-col items-center justify-center gap-1 cap text-[11px] no-underline border-0 bg-transparent cursor-pointer p-0 ${
          isHotels ? "text-[var(--brass-text)] font-medium" : "text-[var(--muted)]"
        }`}
        aria-current={isHotels ? "page" : undefined}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        Hotels
      </Link>

      <button
        type="button"
        onClick={() => {
          if (bookingRef) {
            window.location.href = `/booking/${bookingRef}`;
          } else {
            showToast("No upcoming stays yet. Book one to see it here.");
          }
        }}
        className={`h-[62px] flex flex-col items-center justify-center gap-1 cap text-[11px] no-underline border-0 bg-transparent cursor-pointer p-0 ${
          isStays ? "text-[var(--brass-text)] font-medium" : "text-[var(--muted)]"
        }`}
        aria-current={isStays ? "page" : undefined}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          aria-hidden="true"
        >
          <rect x="4" y="7" width="16" height="13" />
          <path d="M9 7V5h6v2" />
        </svg>
        Stays
      </button>

      <Link
        href="/#circle"
        className="h-[62px] flex flex-col items-center justify-center gap-1 cap text-[11px] no-underline border-0 bg-transparent cursor-pointer p-0 text-[var(--muted)]"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
        </svg>
        Circle
      </Link>
    </nav>
  );
}
