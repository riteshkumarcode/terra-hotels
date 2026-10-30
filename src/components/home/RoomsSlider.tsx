"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/pricing";

const ROOM_SLIDES = [
  {
    hotelSlug: "terraa-lake-palace-udaipur",
    hotelName: "Terraa Lake Palace",
    roomName: "Maharani Suite",
    facts: "92 m² · King · Private terrace on the lake",
    price: 3850000,
    img: "/img/suite.jpg",
    alt: "Suite sitting room with chandelier",
  },
  {
    hotelSlug: "terraa-hawa-haveli-jaipur",
    hotelName: "Terraa Hawa Haveli",
    roomName: "Courtyard Room",
    facts: "36 m² · King or twin · Courtyard view",
    price: 920000,
    img: "/img/room-deluxe.jpg",
    alt: "Bedroom with garden doors",
  },
  {
    hotelSlug: "terraa-mehtab-bagh-agra",
    hotelName: "Terraa Mehtab Bagh",
    roomName: "Taj View Junior Suite",
    facts: "54 m² · King · Sitting room · Taj view",
    price: 1750000,
    img: "/img/room-exec.jpg",
    alt: "Bright suite with sofa",
  },
  {
    hotelSlug: "terraa-lake-palace-udaipur",
    hotelName: "Terraa Lake Palace",
    roomName: "Palace Room",
    facts: "40 m² · King · Original 1890s jharokhas",
    price: 1450000,
    img: "/img/corridor.jpg",
    alt: "Arched corridor lit by a chandelier",
  },
  {
    hotelSlug: "terraa-baga-shores-goa",
    hotelName: "Terraa Baga Shores",
    roomName: "Pool Villa",
    facts: "110 m² · King · Private plunge pool",
    price: 2600000,
    img: "/img/pool.jpg",
    alt: "Pool with loungers under palms",
  },
];

export function RoomsSlider() {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: number) => {
    if (!railRef.current) return;
    const firstCard = railRef.current.children[0] as HTMLElement;
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + 24 : 544;

    if (direction > 0 && railRef.current.scrollLeft + railRef.current.clientWidth >= railRef.current.scrollWidth - 10) {
      railRef.current.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      railRef.current.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
    }
  };

  return (
    <section className="py-[140px] max-[900px]:py-[88px]" aria-label="Rooms and suites">
      <div className="wrap flex justify-between items-end gap-6 flex-wrap mb-10">
        <div className="flex flex-col gap-4">
          <span className="cap eyebrow">Rooms &amp; suites</span>
          <h2 className="disp text-[clamp(38px,4vw,60px)] font-light m-0">Rooms to slow down in</h2>
        </div>
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            className="round light"
            aria-label="Previous rooms"
          >
            <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M20 6H1M6 1L1 6l5 5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            className="round dark"
            aria-label="Next rooms"
          >
            <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M0 6h19M14 1l5 5-5 5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal Rooms Rail */}
      <div
        ref={railRef}
        className="rail"
      >
        {ROOM_SLIDES.map((r, idx) => (
          <Link
            key={idx}
            href={`/hotels/${r.hotelSlug}`}
            className="hov rcard"
          >
            <div className="zoomwrap w-full">
              <Image
                src={r.img}
                alt={r.alt}
                fill
                sizes="(max-width: 900px) 86vw, 520px"
                className="object-cover"
                loading="lazy"
              />
            </div>

            <div className="flex justify-between gap-4 items-start">
              <div className="flex flex-col gap-2 min-w-0">
                <span className="cap text-[11px] text-[var(--brass-text)]">
                  {r.hotelName}
                </span>
                <span className="disp text-[32px] leading-tight font-normal">
                  {r.roomName}
                </span>
                <span className="text-[14px] text-[var(--muted)]">{r.facts}</span>
              </div>
              <span className="flex flex-col items-end whitespace-nowrap">
                <span className="text-[12px] text-[var(--muted)]">from</span>
                <span className="disp text-[28px] font-normal">{formatINR(r.price)}</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
