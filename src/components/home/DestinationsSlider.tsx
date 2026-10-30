"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { SAMPLE_HOTELS } from "@/lib/sample-data";
import { formatINR } from "@/lib/pricing";

export function DestinationsSlider() {
  const railRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollByCard = (direction: number) => {
    if (!railRef.current) return;
    const firstCard = railRef.current.children[0] as HTMLElement;
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + 24 : 364;

    if (direction > 0 && railRef.current.scrollLeft + railRef.current.clientWidth >= railRef.current.scrollWidth - 10) {
      railRef.current.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      railRef.current.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (!railRef.current) return;
    const firstCard = railRef.current.children[0] as HTMLElement;
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + 24 : 364;
    const idx = Math.round(railRef.current.scrollLeft / cardWidth);
    setCurrentIndex(Math.min(idx, SAMPLE_HOTELS.length - 1));
  };

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section id="destinations" className="pb-[140px] max-[900px]:pb-[88px]" aria-label="Destinations">
      <div className="wrap flex justify-between items-end gap-6 flex-wrap mb-10">
        <div className="flex flex-col gap-4">
          <span className="cap eyebrow">Destinations</span>
          <h2 className="disp text-[clamp(38px,4vw,60px)] font-light m-0">Choose your India</h2>
        </div>
        <div className="flex items-center gap-3.5">
          <span className="disp text-[22px] text-[var(--muted)] tabular-nums">
            {String(currentIndex + 1).padStart(2, "0")} / {String(SAMPLE_HOTELS.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            className="round light"
            aria-label="Previous destinations"
          >
            <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M20 6H1M6 1L1 6l5 5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            className="round dark"
            aria-label="Next destinations"
          >
            <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M0 6h19M14 1l5 5-5 5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal Rail */}
      <div
        ref={railRef}
        className="rail"
      >
        {SAMPLE_HOTELS.map((h) => (
          <Link
            key={h.id}
            href={`/hotels/${h.slug}`}
            className="hov dcard"
          >
            <div className="zoomwrap relative h-[460px] max-[900px]:h-[380px]">
              <Image
                src={h.images[0]?.url || "/img/hero-palace.jpg"}
                alt={h.images[0]?.caption || h.name}
                fill
                sizes="340px"
                className="object-cover"
                loading="lazy"
              />
              <div className="scrim-b pointer-events-none" />
              <span className="cap absolute left-6 bottom-6 text-[11px] text-[var(--ivory)] z-2">
                {h.state}
              </span>
            </div>

            <div className="flex justify-between items-baseline gap-3">
              <span className="disp text-[34px] leading-tight font-normal">{h.city}</span>
              <span className="text-[14px] text-[var(--muted)]">from {formatINR(h.basePrice)}</span>
            </div>
            <span className="text-[15px] text-[var(--muted)] -mt-2 truncate">
              {h.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
