"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useBooking } from "@/context/BookingContext";

export function CircleSection() {
  const [email, setEmail] = useState("");
  const { showToast } = useBooking();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      showToast("Enter a valid email address to join.");
      return;
    }
    showToast(`Welcome to Terraa Circle. Your 10% code is on its way to ${cleanEmail}.`);
    setEmail("");
  };

  return (
    <section id="circle" className="bg-[var(--forest2)] text-[var(--ivory)]" aria-label="Terraa Circle membership">
      <div className="wrap py-[110px] flex flex-wrap gap-14 items-center justify-between">
        <div className="flex-1 basis-[460px] min-w-0 flex gap-8 items-center flex-wrap">
          <span className="flex-none w-[104px] h-[104px] rounded-full bg-[var(--ivory)] flex items-center justify-center">
            <Image
              src="/img/mark.png"
              alt=""
              width={96}
              height={96}
              className="w-24 h-24"
            />
          </span>
          <div className="flex-1 basis-[260px] flex flex-col gap-3.5">
            <span className="cap eyebrow text-[var(--gold)]">Terraa Circle</span>
            <h2 className="disp text-[clamp(34px,3.6vw,54px)] leading-[1.05] font-light m-0">
              Members save 10% on every stay
            </h2>
            <p className="text-[16px] leading-[1.7] font-light text-[var(--dmuted)] m-0">
              Plus early check-in, late check-out when we can, and points on
              dining and spa.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap border-b border-[rgba(243,238,229,0.5)] flex-1 basis-[380px] min-w-0"
          noValidate
        >
          <label htmlFor="circleEmail" className="sr-only">
            Email address
          </label>
          <input
            id="circleEmail"
            type="email"
            placeholder="Your email address"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-[1_1_220px] min-w-0 h-[60px] border-0 bg-transparent text-[var(--ivory)] disp text-[24px] p-0 placeholder:text-[var(--dmuted2)] outline-none"
          />
          <button
            type="submit"
            className="h-[60px] border-0 bg-transparent text-[var(--gold)] cap text-[12px] tracking-[0.24em] cursor-pointer p-0 pl-4.5 hover:text-[var(--ivory)] transition-colors"
          >
            Join free →
          </button>
        </form>
      </div>
    </section>
  );
}
