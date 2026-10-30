"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useBooking } from "@/context/BookingContext";

export function Header() {
  const [isSolid, setIsSolid] = useState(false);
  const pathname = usePathname();
  const { openNav } = useBooking();

  useEffect(() => {
    const handleScroll = () => {
      const isHomeOrHotel = pathname === "/" || pathname.startsWith("/hotels/");
      if (window.scrollY > 60 || !isHomeOrHotel) {
        setIsSolid(true);
      } else {
        setIsSolid(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <header
      id="hdr"
      className={`fixed left-0 right-0 top-0 z-50 text-[var(--ivory)] transition-all duration-400 ${
        isSolid
          ? "bg-[var(--forest)] shadow-[0_1px_0_rgba(243,238,229,0.08)] py-3"
          : "bg-transparent py-5 max-[900px]:py-3.5"
      }`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] max-[900px]:grid-cols-[44px_1fr_auto] items-center gap-5 px-[max(var(--gut),4vw)]">
        {/* Left Navigation */}
        <nav aria-label="Primary" className="flex items-center gap-7">
          <button
            type="button"
            onClick={openNav}
            className="w-11 h-11 border-0 bg-transparent text-[var(--ivory)] inline-flex items-center justify-start cursor-pointer p-0"
            aria-label="Open menu"
          >
            <svg
              width="26"
              height="14"
              viewBox="0 0 26 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              aria-hidden="true"
            >
              <path d="M0 1h26M0 7h18M0 13h26" />
            </svg>
          </button>
          <Link
            href="/hotels"
            className="cap text-[11px] text-[var(--ivory)] hover:text-[var(--gold)] transition-colors max-[900px]:hidden"
          >
            Hotels
          </Link>
          <Link
            href="/#destinations"
            className="cap text-[11px] text-[var(--ivory)] hover:text-[var(--gold)] transition-colors max-[900px]:hidden"
          >
            Destinations
          </Link>
          <Link
            href="/#experiences"
            className="cap text-[11px] text-[var(--ivory)] hover:text-[var(--gold)] transition-colors max-[900px]:hidden"
          >
            Experiences
          </Link>
        </nav>

        {/* Brand Center */}
        <Link
          href="/"
          className={`flex items-center justify-self-center text-center no-underline transition-all duration-400 ${
            isSolid
              ? "flex-row gap-3 max-[900px]:gap-2.5"
              : "flex-col gap-2 max-[900px]:flex-row max-[900px]:gap-2.5"
          }`}
          aria-label="Terraa Hotels home"
        >
          <span
            className={`rounded-full bg-[var(--ivory)] flex items-center justify-center transition-all duration-400 ${
              isSolid ? "w-11 h-11" : "w-[60px] h-[60px] max-[900px]:w-10 max-[900px]:h-10"
            }`}
          >
            <Image
              src="/img/mark.png"
              alt=""
              width={56}
              height={56}
              className={`transition-all duration-400 ${
                isSolid ? "w-10 h-10" : "w-14 h-14 max-[900px]:w-9 max-[900px]:h-9"
              }`}
              priority
            />
          </span>
          <Image
            src="/img/word-ivory.png"
            alt="Terraa Hotels"
            width={180}
            height={32}
            className={`transition-all duration-400 ${
              isSolid ? "w-[150px]" : "w-[180px] max-[900px]:w-[118px]"
            }`}
            priority
          />
        </Link>

        {/* Right Navigation */}
        <div className="flex items-center justify-end gap-6">
          <Link
            href="/#offers"
            className="cap text-[11px] text-[var(--ivory)] hover:text-[var(--gold)] transition-colors max-[900px]:hidden"
          >
            Offers
          </Link>
          <Link
            href="/#weddings"
            className="cap text-[11px] text-[var(--ivory)] hover:text-[var(--gold)] transition-colors max-[900px]:hidden"
          >
            Weddings
          </Link>
          <Link
            href="/hotels"
            className="btn btn-ghost max-[900px]:min-h-10 max-[900px]:px-3.5 max-[900px]:text-[11px]"
          >
            Reserve
          </Link>
        </div>
      </div>
    </header>
  );
}
