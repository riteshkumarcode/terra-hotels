"use client";

import React from "react";
import Image from "next/image";
import { useBooking } from "@/context/BookingContext";

export function WeddingsBand() {
  const { showToast } = useBooking();

  return (
    <section
      id="weddings"
      className="relative h-[720px] max-[900px]:h-[560px] overflow-hidden text-[var(--ivory)] bg-[var(--forest)]"
      aria-label="Weddings and celebrations"
    >
      <Image
        src="/img/lounge.jpg"
        alt="Pillared lounge set with armchairs"
        fill
        className="object-cover"
        loading="lazy"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[rgba(9,13,11,0.58)] pointer-events-none" />

      <div className="wrap relative h-full flex flex-col justify-center gap-7 z-2">
        <span className="cap text-[12px] text-[var(--gold)]">
          Weddings &amp; celebrations
        </span>
        <h2 className="disp text-[clamp(42px,5vw,80px)] font-light leading-none max-w-[14ch] m-0">
          Lakeside pheras, palace sangeets,{" "}
          <em className="italic font-light">every detail held</em>.
        </h2>
        <p className="text-[18px] max-[900px]:text-[16px] leading-[1.7] font-light max-w-[50ch] text-[#DCD5C6] m-0">
          Lawns, ballrooms and room blocks for 50 to 600 guests, with an
          in-house wedding team at every hotel.
        </p>
        <button
          type="button"
          onClick={() => showToast("Our wedding team will call you within one working day.")}
          className="btn btn-ghost self-start"
        >
          Plan your celebration
        </button>
      </div>
    </section>
  );
}
