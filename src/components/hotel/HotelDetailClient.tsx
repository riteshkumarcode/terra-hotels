"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SampleHotel } from "@/lib/sample-data";
import { useBooking } from "@/context/BookingContext";
import { formatDateLabel, formatINR, calculateNights } from "@/lib/pricing";

export function HotelDetailClient({ hotel }: { hotel: SampleHotel }) {
  const router = useRouter();

  const {
    hotelId,
    setHotelId,
    arrive,
    setArrive,
    depart,
    setDepart,
    adults,
    setAdults,
    qty,
    setRoomQty,
    showToast,
    pricing,
  } = useBooking();

  useEffect(() => {
    if (hotel.id !== hotelId) {
      setHotelId(hotel.id);
    }
  }, [hotel.id, hotelId, setHotelId]);

  // Gallery slider state
  const [galleryIndex, setGalleryIndex] = useState(0);
  const totalGallery = hotel.images.length;
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Auto advance gallery every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setGalleryIndex((prev) => (prev + 1) % totalGallery);
    }, 7000);
    return () => clearInterval(timer);
  }, [totalGallery]);

  const goGallery = (index: number) => {
    setGalleryIndex((index + totalGallery) % totalGallery);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      goGallery(galleryIndex + (diffX < 0 ? 1 : -1));
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const [isSaved, setIsSaved] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const nights = calculateNights(arrive, depart);
  const hasRoomsSelected = pricing.roomsSubtotalPaise > 0;

  return (
    <div className="pt-0 pb-16">
      {/* 1. Full Gallery Hero */}
      <section
        className="relative h-[clamp(420px,72vh,760px)] overflow-hidden bg-[var(--forest)] touch-pan-y"
        aria-label="Photo gallery"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {hotel.images.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
              idx === galleryIndex ? "opacity-100 z-1" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={img.url}
              alt={img.caption || hotel.name}
              fill
              className={`object-cover ${idx === galleryIndex ? "animate-[kb_10s_ease-out_both]" : ""}`}
              priority={idx === 0}
              sizes="100vw"
            />
          </div>
        ))}

        <div className="scrim z-2 pointer-events-none" />

        {/* Gallery Overlay Bottom Bar */}
        <div className="absolute left-[max(var(--gut),4vw)] right-[max(var(--gutR),4vw)] bottom-7 z-3 flex justify-between items-end gap-6 flex-wrap text-[var(--ivory)]">
          <div className="flex flex-col gap-2.5">
            <span className="disp text-[26px] tabular-nums font-normal">
              {String(galleryIndex + 1).padStart(2, "0")} / {String(totalGallery).padStart(2, "0")}
            </span>
            <span className="cap text-[11px] text-[var(--gold)]">
              {hotel.images[galleryIndex]?.caption || hotel.name}
            </span>
          </div>

          <div className="flex gap-2.5 items-center flex-wrap">
            {hotel.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goGallery(idx)}
                className={`w-[92px] h-[62px] p-0 border bg-none cursor-pointer overflow-hidden transition-opacity duration-300 max-[900px]:hidden ${
                  idx === galleryIndex ? "opacity-100 border-[var(--ivory)]" : "opacity-55 border-transparent"
                }`}
                aria-label={`Show ${img.caption}`}
              >
                <Image
                  src={img.url}
                  alt=""
                  width={92}
                  height={62}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}

            <button
              type="button"
              onClick={() => goGallery(galleryIndex - 1)}
              className="round glass ml-2.5"
              aria-label="Previous photo"
            >
              <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M20 6H1M6 1L1 6l5 5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goGallery(galleryIndex + 1)}
              className="round bg-[var(--ivory)] text-[var(--forest)] border-0"
              aria-label="Next photo"
            >
              <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M0 6h19M14 1l5 5-5 5" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Hotel Header Title & Actions */}
      <div className="wrap pt-16 flex flex-col gap-8.5">
        <div className="flex justify-between items-end gap-6 flex-wrap m-0">
          <div className="flex flex-col gap-4.5">
            <span className="cap eyebrow">
              {hotel.city} · {hotel.state}
            </span>
            <h1 className="disp text-[clamp(48px,6vw,92px)] leading-[0.95] font-light m-0">
              {hotel.name}
            </h1>
            <span className="text-[15px] text-[var(--muted)]">
              <strong className="font-medium text-[var(--ink)]">{hotel.rating}</strong> ·{" "}
              {hotel.reviewsCount} verified stays · {hotel.address}
            </span>
          </div>

          <div className="flex gap-5.5 items-center">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard?.writeText(window.location.href);
                  showToast("Page link copied to clipboard.");
                }
              }}
              className="cap lnk text-[var(--ink)] cursor-pointer"
            >
              Share
            </button>
            <button
              type="button"
              onClick={() => setIsSaved(!isSaved)}
              className="cap lnk text-[var(--ink)] cursor-pointer"
            >
              {isSaved ? "Saved ✓" : "Save"}
            </button>
          </div>
        </div>

        {/* 3. Sticky Subnavigation */}
        <nav
          className="flex gap-9 max-[900px]:gap-5 flex-wrap max-[900px]:flex-nowrap max-[900px]:overflow-x-auto no-scrollbar border-y border-[var(--line)] py-4.5 cap text-[11px]"
          aria-label="On this page"
        >
          {[
            ["overview", "Overview"],
            ["rooms", "Rooms & rates"],
            ["dining", "Dining"],
            ["spa", "Spa"],
            ["location", "Location"],
            ["policies", "Policies"],
          ].map(([target, label]) => (
            <button
              key={target}
              type="button"
              onClick={() => scrollToSection(target)}
              className="border-0 bg-transparent p-0 cursor-pointer text-[var(--ink)] hover:text-[var(--brass-text)] whitespace-nowrap min-h-[28px]"
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* 4. Content Layout with Sticky Stay Sidebar */}
      <div className="wrap pt-14 pb-[120px] flex flex-wrap gap-18 max-[900px]:gap-12 items-start">
        {/* Main Content Area */}
        <div className="flex-[999_1_600px] min-w-0 flex flex-col gap-24 max-[900px]:gap-18">
          {/* Overview Section */}
          <section id="overview" className="flex flex-col gap-7">
            <p className="disp text-[clamp(28px,3vw,36px)] leading-[1.25] font-light max-w-[30ch] m-0">
              {hotel.intro || hotel.blurb}
            </p>
            <p className="text-[17px] leading-[1.75] font-light text-[var(--muted)] max-w-[62ch] m-0">
              {hotel.body ||
                "Breakfast for two is included on every flexible rate. The concierge arranges guides, drivers and tables, and the in-house spa takes bookings from 9 AM to 9 PM."}
            </p>

            <dl className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] border-t border-[var(--line)] m-0 p-0">
              <div className="py-5.5 px-5 first:pl-0 border-l border-[var(--line)] first:border-l-0 flex flex-col gap-1.5">
                <dt className="cap text-[11px] text-[var(--brass-text)]">Check-in</dt>
                <dd className="disp text-[28px] font-normal m-0">2:00 PM</dd>
              </div>
              <div className="py-5.5 px-5 border-l border-[var(--line)] flex flex-col gap-1.5">
                <dt className="cap text-[11px] text-[var(--brass-text)]">Check-out</dt>
                <dd className="disp text-[28px] font-normal m-0">11:00 AM</dd>
              </div>
              <div className="py-5.5 px-5 border-l border-[var(--line)] flex flex-col gap-1.5">
                <dt className="cap text-[11px] text-[var(--brass-text)]">Airport</dt>
                <dd className="disp text-[28px] font-normal m-0">{hotel.airportDist}</dd>
              </div>
              <div className="py-5.5 px-5 border-l border-[var(--line)] flex flex-col gap-1.5">
                <dt className="cap text-[11px] text-[var(--brass-text)]">Rooms</dt>
                <dd className="disp text-[28px] font-normal m-0">{hotel.totalRooms}</dd>
              </div>
            </dl>
          </section>

          {/* Rooms & Rates Section */}
          <section id="rooms" className="flex flex-col gap-7.5">
            <div className="flex justify-between items-end gap-3.5 flex-wrap m-0">
              <div className="flex flex-col gap-3.5">
                <span className="cap eyebrow">Rooms &amp; rates</span>
                <h2 className="disp text-[clamp(38px,4vw,52px)] font-light m-0">
                  Choose your room
                </h2>
              </div>
              <span className="text-[14px] text-[var(--muted)]">
                {formatDateLabel(arrive)} – {formatDateLabel(depart)} · {nights}{" "}
                {nights > 1 ? "nights" : "night"} · rates per night, GST extra
              </span>
            </div>

            <div className="flex flex-col gap-7.5">
              {hotel.rooms.map((r) => {
                const flexKey = `${r.id}-flex`;
                const advKey = `${r.id}-adv`;
                const flexQty = qty[flexKey] || 0;
                const advQty = qty[advKey] || 0;
                const totalUsed = flexQty + advQty;
                const advRate = Math.round((r.baseRate * 0.88) / 1000) * 1000;

                return (
                  <article
                    key={r.id}
                    className="flex flex-wrap bg-[var(--card)] border border-[#E2D9C9]"
                  >
                    <div className="zoomwrap hov flex-1 basis-[300px] max-w-[380px] max-[900px]:max-w-none max-[900px]:basis-full min-h-[320px] max-[900px]:min-h-[220px] max-[900px]:h-[220px] relative">
                      <Image
                        src={r.imageUrl}
                        alt={r.name}
                        fill
                        sizes="(max-width: 900px) 100vw, 380px"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-[999_1_360px] min-w-0 p-8 max-[900px]:p-5.5 flex flex-col gap-4.5">
                      <div className="flex flex-col gap-2">
                        <h3 className="disp text-[34px] font-normal m-0 leading-tight">
                          {r.name}
                        </h3>
                        <span className="text-[14px] text-[var(--muted)]">{r.facts}</span>
                      </div>

                      {/* Flexible Rate Plan */}
                      <div
                        className={`flex flex-wrap gap-4 items-center justify-between py-4 border-t border-[#E2D9C9] ${
                          flexQty > 0 ? "bg-[linear-gradient(90deg,rgba(184,149,90,0.12),rgba(184,149,90,0))] px-2 -mx-2" : ""
                        }`}
                      >
                        <div className="flex-1 basis-[220px] min-w-0 flex flex-col gap-1">
                          <span className="text-[16px] font-medium">
                            Flexible · breakfast for two
                          </span>
                          <span className="text-[13px] text-[var(--green)]">
                            Free cancellation up to 48 hours before arrival
                            {r.inventory <= 2 ? ` · only ${r.inventory} left` : ""}
                          </span>
                        </div>
                        <span className="disp text-[30px] tabular-nums font-normal">
                          {formatINR(r.baseRate)}
                        </span>
                        <div className="flex items-center gap-1.5" role="group" aria-label={`${r.name}, Flexible`}>
                          <button
                            type="button"
                            onClick={() => setRoomQty(flexKey, flexQty - 1)}
                            disabled={flexQty <= 0}
                            className="w-11 h-11 rounded-full border border-[#C9BFAE] bg-transparent text-[18px] cursor-pointer disabled:opacity-35"
                            aria-label="Remove one flexible room"
                          >
                            −
                          </button>
                          <output className="min-w-[30px] text-center text-[17px] font-medium tabular-nums" aria-live="polite">
                            {flexQty}
                          </output>
                          <button
                            type="button"
                            onClick={() => setRoomQty(flexKey, flexQty + 1)}
                            disabled={totalUsed >= r.inventory}
                            className="w-11 h-11 rounded-full border-0 bg-[var(--forest)] text-[var(--ivory)] text-[18px] cursor-pointer disabled:opacity-35"
                            aria-label="Add one flexible room"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Advance Purchase Rate Plan (-12%) */}
                      <div
                        className={`flex flex-wrap gap-4 items-center justify-between py-4 border-t border-[#E2D9C9] ${
                          advQty > 0 ? "bg-[linear-gradient(90deg,rgba(184,149,90,0.12),rgba(184,149,90,0))] px-2 -mx-2" : ""
                        }`}
                      >
                        <div className="flex-1 basis-[220px] min-w-0 flex flex-col gap-1">
                          <span className="text-[16px] font-medium">
                            Advance purchase · breakfast for two
                          </span>
                          <span className="text-[13px] text-[var(--brass-text)]">
                            Save 12% · non-refundable
                          </span>
                        </div>
                        <span className="disp text-[30px] tabular-nums font-normal">
                          {formatINR(advRate)}
                        </span>
                        <div className="flex items-center gap-1.5" role="group" aria-label={`${r.name}, Advance purchase`}>
                          <button
                            type="button"
                            onClick={() => setRoomQty(advKey, advQty - 1)}
                            disabled={advQty <= 0}
                            className="w-11 h-11 rounded-full border border-[#C9BFAE] bg-transparent text-[18px] cursor-pointer disabled:opacity-35"
                            aria-label="Remove one advance purchase room"
                          >
                            −
                          </button>
                          <output className="min-w-[30px] text-center text-[17px] font-medium tabular-nums" aria-live="polite">
                            {advQty}
                          </output>
                          <button
                            type="button"
                            onClick={() => setRoomQty(advKey, advQty + 1)}
                            disabled={totalUsed >= r.inventory}
                            className="w-11 h-11 rounded-full border-0 bg-[var(--forest)] text-[var(--ivory)] text-[18px] cursor-pointer disabled:opacity-35"
                            aria-label="Add one advance purchase room"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Dining Section */}
          <section id="dining" className="flex flex-wrap gap-12 items-center">
            <div className="zoomwrap hov flex-1 basis-[320px] h-[480px] max-[900px]:h-[300px] relative">
              <Image
                src="/img/bar.jpg"
                alt="Wood-panelled bar with lamps"
                fill
                sizes="(max-width: 900px) 100vw, 40vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1 basis-[300px] min-w-0 flex flex-col gap-5.5">
              <span className="cap eyebrow">Dining</span>
              <h2 className="disp text-[46px] font-normal leading-none m-0">The terrace &amp; the bar</h2>
              <p className="text-[16px] leading-[1.7] font-light text-[var(--muted)] m-0">
                Regional cooking on the terrace, single malts in the old drawing
                room. Breakfast 7–10:30 AM, dinner 7–11 PM.
              </p>
              <button
                type="button"
                onClick={() => showToast("Table request sent. The restaurant will confirm on WhatsApp.")}
                className="cap lnk self-start text-[var(--ink)] cursor-pointer"
              >
                Reserve a table
              </button>
            </div>
          </section>

          {/* Spa Section */}
          <section id="spa" className="flex flex-wrap-reverse gap-12 items-center">
            <div className="flex-1 basis-[300px] min-w-0 flex flex-col gap-5.5">
              <span className="cap eyebrow">Spa</span>
              <h2 className="disp text-[46px] font-normal leading-none m-0">Ayurveda, unhurried</h2>
              <p className="text-[16px] leading-[1.7] font-light text-[var(--muted)] m-0">
                Abhyanga, shirodhara and a heated pool. Treatments from ₹4,500,
                booked on arrival or with your stay.
              </p>
              <button
                type="button"
                onClick={() => scrollToSection("rooms")}
                className="cap lnk self-start text-[var(--ink)] cursor-pointer"
              >
                Add to your stay
              </button>
            </div>
            <div className="zoomwrap hov flex-1 basis-[320px] h-[480px] max-[900px]:h-[300px] relative">
              <Image
                src="/img/spa.jpg"
                alt="Treatment room facing the sea"
                fill
                sizes="(max-width: 900px) 100vw, 40vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
          </section>

          {/* Location Section */}
          <section id="location" className="flex flex-col gap-6">
            <span className="cap eyebrow">Location</span>
            <div className="flex flex-wrap gap-10">
              <div className="flex-[1.2_1_300px] flex flex-col gap-3">
                <p className="disp text-[30px] leading-[1.2] font-normal m-0">{hotel.address}</p>
                <a
                  className="cap lnk self-start text-[11px]"
                  href={`https://www.google.com/maps/search/${encodeURIComponent(hotel.name + " " + hotel.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps
                </a>
              </div>
              <ul className="flex-1 basis-[260px] m-0 p-0 list-none text-[15px]">
                {hotel.nearPlaces.map(([place, dist], idx) => (
                  <li
                    key={idx}
                    className="flex justify-between gap-3 py-3.5 border-b border-[var(--line)]"
                  >
                    <span>{place}</span>
                    <span className="text-[var(--muted)]">{dist}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Policies Section */}
          <section id="policies" className="flex flex-col gap-4.5">
            <span className="cap eyebrow">Policies</span>
            <ul className="m-0 pl-5 flex flex-col gap-2.5 text-[15px] leading-[1.7] font-light text-[var(--muted)] max-w-[70ch]">
              <li>
                Government photo ID for every adult at check-in: Aadhaar,
                passport, driving licence or voter ID. Foreign nationals need a
                passport and valid visa.
              </li>
              <li>
                Children under 6 stay free using existing beds. Extra bed ₹3,500
                a night with breakfast.
              </li>
              <li>
                Flexible rates cancel free until 48 hours before arrival; after
                that the first night is charged. Advance purchase rates are
                non-refundable.
              </li>
            </ul>
          </section>
        </div>

        {/* 5. Sticky "Your Stay" Sidebar (Desktop) */}
        <aside
          className="flex-1 basis-[360px] min-w-0 sticky top-24 max-[900px]:static max-[900px]:basis-full bg-[var(--forest)] text-[var(--ivory)] p-8 max-[900px]:p-6 flex flex-col gap-5 shadow-2xl"
          aria-label="Your stay"
        >
          <span className="cap text-[11px] text-[var(--gold)]">Your stay</span>

          {/* Date & Guest Inputs Grid */}
          <div className="grid grid-cols-2 border border-[rgba(243,238,229,0.2)]">
            <div className="p-[14px_16px] flex flex-col gap-1 border-r border-[rgba(243,238,229,0.2)]">
              <label htmlFor="stArr" className="cap text-[11px] text-[var(--dmuted2)] cursor-pointer">
                Arrive
              </label>
              <input
                id="stArr"
                type="date"
                min="2026-10-30"
                value={arrive}
                onChange={(e) => {
                  setArrive(e.target.value);
                  if (depart <= e.target.value) {
                    const d = new Date(`${e.target.value}T12:00:00`);
                    d.setDate(d.getDate() + 1);
                    setDepart(d.toISOString().slice(0, 10));
                  }
                }}
                className="disp text-[19px] border-0 bg-transparent text-[var(--ivory)] p-0 [color-scheme:dark] outline-none"
              />
            </div>

            <div className="p-[14px_16px] flex flex-col gap-1">
              <label htmlFor="stDep" className="cap text-[11px] text-[var(--dmuted2)] cursor-pointer">
                Depart
              </label>
              <input
                id="stDep"
                type="date"
                min="2026-10-31"
                value={depart}
                onChange={(e) => {
                  if (e.target.value > arrive) {
                    setDepart(e.target.value);
                  } else {
                    showToast("Departure must be after arrival.");
                  }
                }}
                className="disp text-[19px] border-0 bg-transparent text-[var(--ivory)] p-0 [color-scheme:dark] outline-none"
              />
            </div>

            <div className="col-span-2 p-[14px_16px] border-t border-[rgba(243,238,229,0.2)] flex flex-col gap-1">
              <label htmlFor="stAd" className="cap text-[11px] text-[var(--dmuted2)] cursor-pointer">
                Guests
              </label>
              <select
                id="stAd"
                value={adults}
                onChange={(e) => setAdults(+e.target.value)}
                className="disp text-[19px] border-0 bg-transparent text-[var(--ivory)] p-0 [color-scheme:dark] outline-none cursor-pointer [&>option]:text-[var(--ink)]"
              >
                {[1, 2, 3, 4].map((a) => (
                  <option key={a} value={a}>
                    {a} {a > 1 ? "adults" : "adult"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Lines or Placeholder */}
          {hasRoomsSelected ? (
            <div className="flex flex-col gap-3 text-[14px] font-light tabular-nums">
              {pricing.lines.map((line, idx) => (
                <div key={idx} className="flex justify-between gap-3">
                  <span className="text-[var(--dmuted)]">{line.label}</span>
                  <span>{formatINR(line.amountPaise)}</span>
                </div>
              ))}

              {pricing.directDiscountPaise > 0 && (
                <div className="flex justify-between gap-3 text-[var(--gold)]">
                  <span>Book-direct · 10% off</span>
                  <span>−{formatINR(pricing.directDiscountPaise)}</span>
                </div>
              )}

              <div className="flex justify-between gap-3">
                <span className="text-[var(--dmuted)]">GST</span>
                <span>{formatINR(pricing.totalGstPaise)}</span>
              </div>

              <div className="h-[1px] bg-[rgba(243,238,229,0.2)] my-1" />

              <div className="flex justify-between items-baseline">
                <span className="cap text-[11px]">Total</span>
                <span className="disp text-[40px] leading-none animate-[tick_0.45s_ease]">
                  {formatINR(pricing.grandTotalPaise)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="btn btn-brass w-full text-center mt-2"
              >
                Reserve
              </Link>

              <span className="text-[13px] font-light text-[var(--dmuted2)] text-center">
                Best rate guaranteed. No charge until the next step.
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="m-0 text-[15px] font-light text-[var(--dmuted)]">
                Add a room to see your total.
              </p>
              <button
                type="button"
                onClick={() => scrollToSection("rooms")}
                className="btn btn-brass w-full"
              >
                Choose a room
              </button>
            </div>
          )}

          {/* Perks checklist */}
          <div className="flex flex-col gap-2.5 pt-4.5 border-t border-[rgba(243,238,229,0.2)] text-[14px] font-light text-[var(--dmuted)]">
            <span>✦ Breakfast for two included</span>
            <span>✦ Welcome drink and evening tea</span>
            <span>✦ Free cancellation on flexible rates</span>
          </div>
        </aside>
      </div>

      {/* 6. Mobile Fixed Bottom Reservation Bar */}
      <div
        id="mbar"
        className="hidden max-[900px]:flex fixed left-0 right-0 bottom-0 z-40 bg-[var(--forest)] text-[var(--ivory)] px-5 py-3 pb-[calc(14px+env(safe-area-inset-bottom,0px))] justify-between items-center gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.2)]"
      >
        <span className="flex flex-col">
          <span className="disp text-[28px] leading-none">
            {hasRoomsSelected ? formatINR(pricing.grandTotalPaise) : `from ${formatINR(hotel.basePrice)}`}
          </span>
          <span className="text-[11px] font-light text-[var(--dmuted2)]">
            {hasRoomsSelected ? `${nights} ${nights > 1 ? "nights" : "night"} · incl. GST` : "per night"}
          </span>
        </span>
        <button
          type="button"
          onClick={() => {
            if (hasRoomsSelected) {
              router.push("/checkout");
            } else {
              scrollToSection("rooms");
            }
          }}
          className="btn btn-brass min-h-[50px] px-5.5 text-[11px]"
        >
          {hasRoomsSelected ? "Reserve" : "Choose room"}
        </button>
      </div>
    </div>
  );
}
