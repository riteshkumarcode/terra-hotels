"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBooking } from "@/context/BookingContext";

export function NavDrawer() {
  const { isNavOpen, closeNav } = useBooking();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isNavOpen) {
        closeNav();
      }
    };
    if (isNavOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNavOpen, closeNav]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
      className={`fixed inset-0 z-70 bg-[var(--forest)] text-[var(--ivory)] px-[max(var(--gutR),6vw)] pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-10 flex flex-col gap-8 overflow-y-auto transition-transform duration-600 ease-[cubic-bezier(0.65,0,0.2,1)] ${
        isNavOpen ? "translate-y-0" : "-translate-y-full pointer-events-none"
      }`}
    >
      <div className="flex justify-between items-center">
        <Image
          src="/img/word-ivory.png"
          alt="Terraa Hotels"
          width={170}
          height={30}
          className="w-[170px]"
        />
        <button
          type="button"
          onClick={closeNav}
          className="round glass"
          aria-label="Close menu"
        >
          <svg
            width="16"
            height="16"
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

      <nav aria-label="Menu navigation" className="flex flex-col gap-3.5 my-auto">
        <Link
          href="/hotels"
          onClick={closeNav}
          className="disp text-[clamp(36px,8vw,64px)] leading-[1.1] hover:text-[var(--gold)] transition-colors no-underline"
        >
          Our hotels
        </Link>
        <Link
          href="/#destinations"
          onClick={closeNav}
          className="disp text-[clamp(36px,8vw,64px)] leading-[1.1] hover:text-[var(--gold)] transition-colors no-underline"
        >
          Destinations
        </Link>
        <Link
          href="/#experiences"
          onClick={closeNav}
          className="disp text-[clamp(36px,8vw,64px)] leading-[1.1] hover:text-[var(--gold)] transition-colors no-underline"
        >
          Experiences
        </Link>
        <Link
          href="/#offers"
          onClick={closeNav}
          className="disp text-[clamp(36px,8vw,64px)] leading-[1.1] hover:text-[var(--gold)] transition-colors no-underline"
        >
          Offers
        </Link>
        <Link
          href="/#weddings"
          onClick={closeNav}
          className="disp text-[clamp(36px,8vw,64px)] leading-[1.1] hover:text-[var(--gold)] transition-colors no-underline"
        >
          Weddings
        </Link>
        <Link
          href="/#circle"
          onClick={closeNav}
          className="disp text-[clamp(36px,8vw,64px)] leading-[1.1] hover:text-[var(--gold)] transition-colors no-underline"
        >
          Terraa Circle
        </Link>
      </nav>

      <p className="cap text-[11px] text-[var(--gold)] mt-auto pt-6">
        Reservations · 24 hours · [RESERVATIONS PHONE]
      </p>
    </div>
  );
}
