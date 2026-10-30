"use client";

import React, { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { SAMPLE_HOTELS } from "@/lib/sample-data";
import { useBooking } from "@/context/BookingContext";
import { formatDateLabel, formatINR } from "@/lib/pricing";

export default function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = use(params);
  const { hotel, arrive, depart, adults, guest, paymentMethod, pricing, showToast } =
    useBooking();

  // Find hotel from reference if available
  const parts = ref.split("-");
  const code = parts[1] || "UDR";
  const currentHotel =
    SAMPLE_HOTELS.find((h) => h.code.toUpperCase() === code.toUpperCase()) || hotel;

  const payWord =
    paymentMethod === "hotel"
      ? "Pay at hotel"
      : paymentMethod === "card"
      ? "Paid by card"
      : paymentMethod === "net"
      ? "Paid by net banking"
      : "Paid by UPI";

  const guestName = guest.first ? `${guest.first}` : "Guest";

  return (
    <div className="pt-0">
      {/* 1. Hero Confirmation Banner */}
      <section className="relative min-h-[640px] overflow-hidden bg-[var(--forest)] text-[var(--ivory)]">
        <Image
          src={currentHotel.images[0]?.url || "/img/hero-palace.jpg"}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover animate-[kb_14s_ease-out_both]"
        />
        <div className="absolute inset-0 bg-[rgba(9,13,11,0.62)] pointer-events-none" />

        <div className="wrap relative min-h-[640px] flex flex-col items-center justify-center gap-6 text-center pt-[150px] pb-[130px] z-2">
          {/* Animated Gold Seal */}
          <span className="w-[120px] h-[120px] rounded-full bg-[var(--ivory)] flex items-center justify-center animate-[seal_0.9s_cubic-bezier(0.2,0.9,0.2,1.15)_0.2s_both] shadow-2xl">
            <Image
              src="/img/mark.png"
              alt="Terraa Hotels"
              width={112}
              height={112}
              className="w-28 h-28"
            />
          </span>

          <span className="cap text-[12px] text-[var(--gold)]">
            Your booking is confirmed
          </span>
          <h1 className="disp text-[clamp(44px,6vw,92px)] leading-[0.98] font-light m-0">
            We’ll see you soon, {guestName}.
          </h1>
          <p className="text-[17px] leading-[1.7] font-light text-[#DCD5C6] max-w-[52ch] m-0">
            A confirmation is on its way to {guest.email || "your email"} and to
            WhatsApp. The front desk will message you the day before to plan your
            arrival.
          </p>
        </div>
      </section>

      {/* 2. Stay Summary Card */}
      <div className="wrap -mt-20 relative pb-[120px] flex flex-col gap-18 z-3">
        <div className="bg-[var(--card)] flex flex-wrap shadow-[0_30px_60px_rgba(14,20,17,0.18)] border border-[var(--line)]">
          {/* Photo */}
          <div className="flex-1 basis-[280px] min-h-[280px] overflow-hidden relative">
            <Image
              src={currentHotel.images[0]?.url || "/img/hero-palace.jpg"}
              alt={currentHotel.name}
              fill
              sizes="(max-width: 900px) 100vw, 380px"
              className="object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-[2_1_420px] min-w-0 p-[clamp(24px,4vw,40px)] flex flex-col gap-6">
            <div className="flex justify-between gap-5 flex-wrap">
              <div className="flex flex-col gap-1.5">
                <span className="disp text-[36px] leading-none font-normal">
                  {currentHotel.name}
                </span>
                <span className="text-[14px] font-light text-[var(--muted)]">
                  {currentHotel.address}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-right max-[900px]:text-left">
                <span className="cap text-[11px] text-[var(--brass-text)]">
                  Booking reference
                </span>
                <span className="font-['Marcellus',serif] text-[22px] tracking-[0.12em] font-medium text-[var(--ink)]">
                  {ref}
                </span>
              </div>
            </div>

            {/* Quick Facts Grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4.5 py-5.5 border-y border-[var(--line)] text-[15px]">
              <div className="flex flex-col gap-1">
                <span className="cap text-[11px] text-[var(--muted)]">Arrive</span>
                <span>{formatDateLabel(arrive)} · 2 PM</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="cap text-[11px] text-[var(--muted)]">Depart</span>
                <span>{formatDateLabel(depart)} · 11 AM</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="cap text-[11px] text-[var(--muted)]">Guests</span>
                <span>
                  {adults} {adults > 1 ? "adults" : "adult"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="cap text-[11px] text-[var(--muted)]">{payWord}</span>
                <span className="tabular-nums font-medium">
                  {formatINR(pricing.grandTotalPaise)}
                </span>
              </div>
            </div>

            <span className="text-[14px] font-light text-[var(--muted)]">
              {pricing.lines.length > 0
                ? pricing.lines.map((l) => l.label).join(" · ")
                : "Heritage accommodation"}
              . Breakfast for two included.
            </span>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              <a
                href={`/booking/${ref}/ics`}
                className="btn btn-dark"
                download={`${ref}.ics`}
              >
                Add to calendar
              </a>
              <a
                href={`/booking/${ref}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-line"
              >
                GST invoice
              </a>
              <a
                className="btn btn-line"
                href={`https://www.google.com/maps/search/${encodeURIComponent(
                  currentHotel.name + " " + currentHotel.city
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Directions
              </a>
            </div>
          </div>
        </div>

        {/* 3. Concierge Recommendations */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-3.5">
            <span className="cap eyebrow">Before you arrive</span>
            <h2 className="disp text-[clamp(36px,4vw,48px)] font-light m-0">
              Make the most of {currentHotel.city}
            </h2>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8">
            {[
              {
                img: "/img/spa.jpg",
                alt: "Treatment room",
                title: "Book a spa ritual",
                desc: "Abhyanga and shirodhara from ₹4,500.",
              },
              {
                img: "/img/bar.jpg",
                alt: "The bar",
                title: "Reserve the bar",
                desc: "Single malts and regional cocktails.",
              },
              {
                img: "/img/lobby.jpg",
                alt: "Lobby",
                title: "Airport pickup",
                desc: "Sedan from the airport, ₹1,800 one way.",
              },
            ].map((c, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  showToast("Request sent. The concierge will confirm on WhatsApp.")
                }
                className="hov border-0 bg-transparent text-left p-0 cursor-pointer flex flex-col gap-4"
              >
                <div className="zoomwrap relative h-[240px] w-full">
                  <Image
                    src={c.img}
                    alt={c.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <b className="disp text-[28px] font-normal leading-tight text-[var(--ink)]">
                  {c.title}
                </b>
                <span className="text-[14px] font-light text-[var(--muted)]">
                  {c.desc}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Back to Home CTA */}
        <Link href="/" className="cap lnk self-center text-[var(--ink)]">
          Back to Terraa Hotels
        </Link>
      </div>
    </div>
  );
}
