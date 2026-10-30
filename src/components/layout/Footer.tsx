"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SAMPLE_HOTELS } from "@/lib/sample-data";

export function Footer() {
  return (
    <footer className="bg-[var(--forest)] text-[var(--dmuted)] border-t border-[rgba(243,238,229,0.08)]">
      <div className="wrap pt-[90px] pb-[calc(40px+env(safe-area-inset-bottom,0px))] flex flex-col gap-16">
        <div className="flex flex-wrap gap-14 justify-between">
          {/* Brand & Reservations */}
          <div className="flex-1 basis-[280px] flex flex-col gap-5">
            <Image
              src="/img/word-ivory.png"
              alt="Terraa Hotels"
              width={230}
              height={40}
              className="w-[230px]"
            />
            <p className="m-0 text-[15px] leading-[1.7] font-light max-w-[32ch]">
              Reservations, 24 hours
              <br />
              [RESERVATIONS PHONE]
              <br />
              [RESERVATIONS EMAIL]
            </p>
          </div>

          {/* Hotels Column */}
          <nav aria-label="Hotels" className="flex flex-col gap-3 text-[15px] font-light min-w-[160px]">
            <span className="cap text-[11px] text-[var(--gold)] mb-1.5">Hotels</span>
            {SAMPLE_HOTELS.map((h) => (
              <Link
                key={h.id}
                href={`/hotels/${h.slug}`}
                className="hover:text-[var(--ivory)] transition-colors no-underline"
              >
                {h.city} · {h.name}
              </Link>
            ))}
          </nav>

          {/* Discover Column */}
          <nav aria-label="Discover" className="flex flex-col gap-3 text-[15px] font-light min-w-[160px]">
            <span className="cap text-[11px] text-[var(--gold)] mb-1.5">Discover</span>
            <Link href="/#experiences" className="hover:text-[var(--ivory)] transition-colors no-underline">
              Dining
            </Link>
            <Link href="/#experiences" className="hover:text-[var(--ivory)] transition-colors no-underline">
              Spa &amp; wellness
            </Link>
            <Link href="/#weddings" className="hover:text-[var(--ivory)] transition-colors no-underline">
              Weddings
            </Link>
            <Link href="/#offers" className="hover:text-[var(--ivory)] transition-colors no-underline">
              Offers
            </Link>
            <Link href="/#journal" className="hover:text-[var(--ivory)] transition-colors no-underline">
              Journal
            </Link>
          </nav>

          {/* Your Stay Column */}
          <nav aria-label="Your stay" className="flex flex-col gap-3 text-[15px] font-light min-w-[160px]">
            <span className="cap text-[11px] text-[var(--gold)] mb-1.5">Your stay</span>
            <Link href="/hotels" className="hover:text-[var(--ivory)] transition-colors no-underline">
              Find a hotel
            </Link>
            <Link href="/#circle" className="hover:text-[var(--ivory)] transition-colors no-underline">
              Terraa Circle
            </Link>
            <Link href="/hotels/terraa-lake-palace-udaipur#policies" className="hover:text-[var(--ivory)] transition-colors no-underline">
              Cancellation policy
            </Link>
            <Link href="/admin/login" className="hover:text-[var(--ivory)] transition-colors no-underline text-[12px] opacity-60">
              Staff Portal
            </Link>
          </nav>
        </div>

        {/* Legal & Social Bar */}
        <div className="flex flex-wrap justify-between gap-4 pt-7 border-t border-[rgba(243,238,229,0.12)] text-[13px] font-light">
          <span>© 2026 Terraa Hotels · GSTIN [YOUR GSTIN]</span>
          <span className="flex gap-6 flex-wrap">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--ivory)]">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--ivory)]">Facebook</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--ivory)]">YouTube</a>
            <Link href="/#privacy" className="hover:text-[var(--ivory)]">Privacy</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
