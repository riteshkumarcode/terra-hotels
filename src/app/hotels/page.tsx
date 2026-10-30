"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SAMPLE_HOTELS, SampleHotel } from "@/lib/sample-data";
import { useBooking } from "@/context/BookingContext";
import { formatDateLabel, formatINR, calculateNights, getRoomGstRate } from "@/lib/pricing";

const FILTER_CHIPS = [
  "All",
  "Palaces & havelis",
  "Beach",
  "Hills",
  "Backwaters",
  "Spiritual",
  "Honeymoon",
];

export default function HotelsSearchPage() {
  const {
    arrive,
    depart,
    adults,
    children: childrenCount,
    openSheet,
    setHotelId,
    setRoomQty,
    clearRoomQty,
  } = useBooking();

  const [activeChip, setActiveChip] = useState("All");
  const [activePhotoIndices, setActivePhotoIndices] = useState<Record<string, number>>({});

  const nights = calculateNights(arrive, depart);

  const filteredHotels = SAMPLE_HOTELS.filter((h) => {
    if (activeChip === "All") return true;
    return h.tags.includes(activeChip);
  });

  const nextPhoto = (hotelId: string, total: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePhotoIndices((prev) => ({
      ...prev,
      [hotelId]: ((prev[hotelId] || 0) + 1) % total,
    }));
  };

  const prevPhoto = (hotelId: string, total: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePhotoIndices((prev) => ({
      ...prev,
      [hotelId]: ((prev[hotelId] || 0) - 1 + total) % total,
    }));
  };

  const handleSelectHotel = (hotel: SampleHotel) => {
    setHotelId(hotel.id);
    clearRoomQty();
    if (hotel.rooms[0]) {
      setRoomQty(`${hotel.rooms[0].id}-flex`, 1);
    }
  };

  return (
    <div className="pt-[calc(env(safe-area-inset-top,0px)+76px)]">
      {/* Top Search Criteria Bar */}
      <section className="wrap pt-14 pb-6 flex flex-col gap-6">
        <div className="flex justify-between items-end gap-6 flex-wrap m-0">
          <div className="flex flex-col gap-3">
            <span className="cap eyebrow text-[11px]">
              {formatDateLabel(arrive, false)} – {formatDateLabel(depart, true)} · {nights}{" "}
              {nights > 1 ? "nights" : "night"} · {adults}{" "}
              {adults > 1 ? "adults" : "adult"}
              {childrenCount > 0 ? ` · ${childrenCount} ${childrenCount > 1 ? "children" : "child"}` : ""}
            </span>
            <h1 className="disp text-[clamp(38px,4.4vw,64px)] font-light leading-none m-0">
              {filteredHotels.length}{" "}
              {filteredHotels.length === 1 ? "Terraa hotel" : "Terraa hotels"} available
            </h1>
          </div>
          <button
            type="button"
            onClick={openSheet}
            className="cap lnk text-[var(--ink)] cursor-pointer self-start"
          >
            Change dates
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2.5 flex-wrap" role="group" aria-label="Filter by type of stay">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setActiveChip(chip)}
              className={`h-11 px-5 border text-[11px] cap cursor-pointer transition-colors ${
                activeChip === chip
                  ? "bg-[var(--forest)] text-[var(--ivory)] border-[var(--forest)]"
                  : "bg-transparent text-[var(--ink)] border-[#B9AF9C] hover:border-[var(--ink)]"
              }`}
              aria-pressed={activeChip === chip}
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      {/* Results List & Interactive Map Grid */}
      <section className="wrap pb-[120px]">
        <div className="flex flex-wrap gap-10 items-start">
          {/* Hotel Result Rows */}
          <div className="flex-[999_1_640px] min-w-0 border-t border-[var(--line)]">
            {filteredHotels.map((h) => {
              const currentPhoto = activePhotoIndices[h.id] || 0;
              const displayImages = h.images.slice(0, 4);
              const staySubtotal = h.basePrice * nights;
              const effectiveGstRate = getRoomGstRate(h.basePrice);
              const stayGst = Math.round(staySubtotal * effectiveGstRate);

              return (
                <article
                  key={h.id}
                  className="flex flex-wrap gap-8 py-7 border-b border-[var(--line)] hover:bg-[var(--card)] transition-colors"
                >
                  {/* Photo Carousel Box */}
                  <div className="flex-[1_1_300px] max-w-[380px] max-[900px]:max-w-none max-[900px]:basis-full h-[260px] max-[900px]:h-[240px] relative overflow-hidden bg-[var(--forest)]">
                    {displayImages.map((img, idx) => (
                      <div
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-700 ${
                          idx === currentPhoto ? "opacity-100 z-1" : "opacity-0 z-0 pointer-events-none"
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt={img.caption || h.name}
                          fill
                          sizes="(max-width: 900px) 100vw, 380px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}

                    {/* Nav Arrows */}
                    <button
                      type="button"
                      onClick={(e) => prevPhoto(h.id, displayImages.length, e)}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border-0 bg-[rgba(243,238,229,0.88)] text-[var(--forest)] flex items-center justify-center cursor-pointer z-2 hover:bg-[var(--ivory)]"
                      aria-label={`Previous photo of ${h.name}`}
                    >
                      <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M20 6H1M6 1L1 6l5 5" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => nextPhoto(h.id, displayImages.length, e)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border-0 bg-[rgba(243,238,229,0.88)] text-[var(--forest)] flex items-center justify-center cursor-pointer z-2 hover:bg-[var(--ivory)]"
                      aria-label={`Next photo of ${h.name}`}
                    >
                      <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M0 6h19M14 1l5 5-5 5" />
                      </svg>
                    </button>

                    <span className="badge cap absolute left-3.5 top-3.5 px-2.5 py-1.5 bg-[var(--forest)] text-[var(--gold)] text-[11px] z-2">
                      {h.badge || "Featured"}
                    </span>
                    <span className="absolute right-3.5 bottom-3 text-[12px] text-[var(--ivory)] z-2 text-shadow">
                      {currentPhoto + 1} / {displayImages.length}
                    </span>
                  </div>

                  {/* Hotel Info Details */}
                  <Link
                    href={`/hotels/${h.slug}`}
                    onClick={() => handleSelectHotel(h)}
                    className="flex-[2_1_280px] min-w-0 flex flex-col gap-3 pt-1.5 no-underline text-[var(--ink)]"
                  >
                    <span className="cap text-[11px] text-[var(--brass-text)]">
                      {h.city} · {h.state}
                    </span>
                    <span className="disp text-[38px] max-[900px]:text-[32px] font-normal leading-tight">
                      {h.name}
                    </span>
                    <span className="text-[14px] text-[var(--muted)]">
                      <strong className="font-medium text-[var(--ink)]">{h.rating}</strong> ·{" "}
                      {h.reviewsCount} verified stays · {h.kind}
                    </span>
                    <p className="text-[15px] leading-[1.7] font-light text-[var(--muted)] max-w-[46ch] m-0">
                      {h.blurb}
                    </p>
                    <span className="text-[13px] text-[var(--green)] mt-auto pt-2">
                      ✦ Breakfast included · Free cancellation up to 48 hours
                    </span>
                  </Link>

                  {/* Pricing and Action */}
                  <div className="flex-1 basis-[180px] max-[900px]:basis-full flex flex-col max-[900px]:flex-row justify-between items-end max-[900px]:items-center gap-4 pt-1.5 text-right max-[900px]:text-left">
                    <div className="flex flex-col gap-0.5">
                      <span className="cap text-[11px] text-[var(--muted)]">
                        per night from
                      </span>
                      <span className="disp text-[40px] max-[900px]:text-[32px] leading-none tabular-nums font-normal">
                        {formatINR(h.basePrice)}
                      </span>
                      <span className="text-[13px] text-[var(--muted)]">
                        {formatINR(staySubtotal)} for {nights} {nights > 1 ? "nights" : "night"} +{" "}
                        {formatINR(stayGst)} GST
                      </span>
                    </div>

                    <Link
                      href={`/hotels/${h.slug}`}
                      onClick={() => handleSelectHotel(h)}
                      className="btn btn-dark text-center"
                    >
                      View rooms
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Desktop Sticky India Map */}
          <aside
            className="flex-1 basis-[340px] min-w-0 sticky top-24 h-[760px] overflow-hidden bg-[#E2DACB] max-[900px]:hidden shadow-inner"
            role="img"
            aria-label="Map of India showing Terraa hotels"
          >
            {/* India Vector Outline */}
            <svg
              aria-hidden="true"
              viewBox="0 0 400 760"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full opacity-60"
            >
              <path
                d="M120 40 L210 30 L250 90 L300 120 L360 170 L340 230 L300 250 L280 320 L240 400 L220 480 L200 560 L180 650 L150 700 L130 640 L110 560 L80 470 L60 380 L40 300 L70 250 L50 200 L90 150 Z"
                fill="#D3C9B6"
              />
            </svg>

            {/* Hotel Price Pins */}
            {SAMPLE_HOTELS.map((h, idx) => {
              const isVisible = filteredHotels.some((fh) => fh.id === h.id);
              const isFirst = idx === 0 && isVisible;

              return (
                <Link
                  key={h.id}
                  href={`/hotels/${h.slug}`}
                  onClick={() => handleSelectHotel(h)}
                  className={`absolute flex items-center gap-2 -translate-x-1.5 -translate-y-1.5 no-underline transition-all duration-300 ${
                    isVisible ? "opacity-100 z-5 scale-100" : "opacity-40 z-1 scale-95"
                  }`}
                  style={{ left: `${h.mapX}%`, top: `${h.mapY}%` }}
                  title={h.name}
                >
                  <i
                    className={`w-3 h-3 rounded-full border-2 border-[var(--ivory)] ${
                      isVisible
                        ? isFirst
                          ? "bg-[var(--brass)] animate-[pulse_2s_ease-in-out_infinite]"
                          : "bg-[var(--brass)]"
                        : "bg-[#B9AF9C]"
                    }`}
                  />
                  <span
                    className={`px-2 py-1 text-[12px] font-medium whitespace-nowrap shadow-[0_6px_18px_rgba(14,20,17,0.15)] ${
                      isFirst
                        ? "bg-[var(--forest)] text-[var(--ivory)]"
                        : isVisible
                        ? "bg-[var(--ivory)] text-[var(--ink)]"
                        : "bg-[var(--ivory)] text-[#5E5A52]"
                    }`}
                  >
                    {isFirst ? `${h.city} · ` : ""}
                    {formatINR(h.basePrice)}
                  </span>
                </Link>
              );
            })}

            <span className="absolute left-3.5 bottom-3 text-[12px] text-[var(--muted)]">
              Interactive hotel pins
            </span>
          </aside>
        </div>

        {/* GST & Rate Disclosure */}
        <p className="mt-8 text-[13px] font-light text-[var(--muted)] m-0">
          Rates include breakfast for two. GST is 5% on room rates up to ₹7,500
          a night and 18% above. Sample hotels and prices for review.
        </p>
      </section>
    </div>
  );
}
