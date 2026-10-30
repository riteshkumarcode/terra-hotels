"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SAMPLE_HOTELS } from "@/lib/sample-data";
import { useBooking } from "@/context/BookingContext";
import { formatDateLabel } from "@/lib/pricing";

const SLIDES = [
  {
    h: "udr",
    slug: "terraa-lake-palace-udaipur",
    img: "/img/hero-palace.jpg",
    alt: "Palace hotel façade framed by palms",
    eb: "Terraa Lake Palace · Udaipur",
    t: "Where the lake keeps the time.",
    cta: "Discover the palace",
    l: "Udaipur",
  },
  {
    h: "jai",
    slug: "terraa-hawa-haveli-jaipur",
    img: "/img/hero-jaipur.jpg",
    alt: "Pink sandstone façade of the Hawa Mahal",
    eb: "Terraa Hawa Haveli · Jaipur",
    t: "Pink sandstone, slow mornings.",
    cta: "Discover the haveli",
    l: "Jaipur",
  },
  {
    h: "goa",
    slug: "terraa-baga-shores-goa",
    img: "/img/hero-pool.jpg",
    alt: "Pool deck under palms",
    eb: "Terraa Baga Shores · Goa",
    t: "Salt air and a long, lazy pool.",
    cta: "Discover the resort",
    l: "Goa",
  },
  {
    h: "kum",
    slug: "terraa-backwaters-kumarakom",
    img: "/img/hero-kerala.jpg",
    alt: "Houseboat on the Kerala backwaters",
    eb: "Terraa Backwaters · Kumarakom",
    t: "Drift the backwaters by kettuvallam.",
    cta: "Discover Kumarakom",
    l: "Kerala",
  },
];

export function HeroSlider() {
  const router = useRouter();
  const {
    arrive,
    setArrive,
    depart,
    setDepart,
    setAdults,
    setChildren,
    setHotelId,
    setRoomQty,
    clearRoomQty,
    openSheet,
    destFilter,
  } = useBooking();

  const [cur, setCur] = useState(0);
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Auto rotation every 6.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCur((prev) => (prev + 1) % SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [cur]);

  const goToSlide = (index: number) => {
    setCur((index + SLIDES.length) % SLIDES.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      goToSlide(cur + (diff < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  };

  const handleDesktopBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!arrive || !depart || depart <= arrive) {
      setBookingError("Choose a departure date after your arrival date.");
      return;
    }
    setBookingError(null);

    if (selectedHotel !== "all") {
      setHotelId(selectedHotel);
      clearRoomQty();
      const h = SAMPLE_HOTELS.find((item) => item.id === selectedHotel);
      if (h && h.rooms[0]) {
        setRoomQty(`${h.rooms[0].id}-flex`, 1);
      }
      router.push(`/hotels/${h?.slug || ""}`);
    } else {
      router.push("/hotels");
    }
  };

  const currentHotelName =
    destFilter && destFilter !== "all"
      ? SAMPLE_HOTELS.find((h) => h.id === destFilter)?.name || "All Terraa hotels"
      : "All Terraa hotels";

  const shortDateRange = () => {
    try {
      const a = new Date(`${arrive}T12:00:00`);
      const d = new Date(`${depart}T12:00:00`);
      const aMonth = a.toLocaleDateString("en-IN", { month: "short" });
      const dMonth = d.toLocaleDateString("en-IN", { month: "short" });
      return `${a.getDate()}${aMonth === dMonth ? "" : " " + aMonth} – ${d.getDate()} ${dMonth}`;
    } catch {
      return `${arrive} – ${depart}`;
    }
  };

  return (
    <section className="relative h-[clamp(640px,92vh,920px)] max-[900px]:h-auto overflow-hidden bg-[var(--forest)] text-[var(--ivory)]" aria-label="Featured hotels">
      {/* Visual Slider Stage */}
      <div
        className="absolute inset-0 max-[900px]:relative max-[900px]:h-[clamp(500px,76vh,640px)]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {SLIDES.map((s, idx) => (
          <div
            key={s.h}
            className={`absolute inset-0 transition-opacity duration-1600 ease-in-out ${
              idx === cur ? "opacity-100 z-1" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={s.img}
              alt={s.alt}
              fill
              className={`object-cover ${idx === cur ? "animate-[kb_9s_ease-out_both]" : ""}`}
              priority={idx === 0}
              sizes="100vw"
            />
          </div>
        ))}

        {/* Ambient Dark Scrim */}
        <div className="scrim z-2 pointer-events-none" />

        {/* Hero Copy Overlay */}
        <div className="absolute left-0 right-0 bottom-[190px] max-[900px]:bottom-[96px] z-3 flex justify-between items-end gap-10 px-[max(var(--gut),4vw)] max-[900px]:flex-col max-[900px]:items-stretch max-[900px]:gap-5">
          {/* Titles */}
          <div className="relative flex-1 basis-[560px] min-w-0 h-[260px] max-[900px]:h-[240px]">
            {SLIDES.map((s, idx) => (
              <div
                key={s.h}
                className={`absolute left-0 right-0 bottom-0 flex flex-col gap-4.5 transition-all duration-1000 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                  idx === cur
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-8 pointer-events-none"
                }`}
              >
                <span className="cap text-[12px] text-[var(--gold)]">{s.eb}</span>
                <h1 className="disp text-[clamp(46px,6.4vw,104px)] max-[900px]:text-[40px] leading-[0.95] max-w-[12ch]">
                  {s.t}
                </h1>
                <Link
                  href={`/hotels/${s.slug}`}
                  className="cap lnk self-start text-[var(--ivory)]"
                >
                  {s.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Hero Slider Controls */}
          <div className="flex-none basis-[440px] min-w-0 flex flex-col gap-4 max-[900px]:w-full">
            <div className="flex justify-between items-center gap-4 max-[900px]:hidden">
              <span className="disp text-[28px]">
                {String(cur + 1).padStart(2, "0")}{" "}
                <span className="text-[rgba(243,238,229,0.55)]">
                  / {String(SLIDES.length).padStart(2, "0")}
                </span>
              </span>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => goToSlide(cur - 1)}
                  className="round glass"
                  aria-label="Previous hotel"
                >
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M20 6H1M6 1L1 6l5 5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => goToSlide(cur + 1)}
                  className="round glass"
                  aria-label="Next hotel"
                >
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M0 6h19M14 1l5 5-5 5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Progress Segment Bars */}
            <div className="grid grid-cols-4 gap-3">
              {SLIDES.map((s, idx) => (
                <button
                  key={s.l}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  className={`border-0 bg-transparent pt-2.5 text-left flex flex-col gap-2.5 cursor-pointer ${
                    idx === cur ? "text-[var(--ivory)]" : "text-[rgba(243,238,229,0.6)]"
                  }`}
                >
                  <span className="block h-[1px] bg-[rgba(243,238,229,0.3)] relative overflow-hidden">
                    <i
                      className={`absolute left-0 top-0 bottom-0 bg-[var(--gold)] ${
                        idx === cur
                          ? "w-full animate-[prog_6.5s_linear_both]"
                          : idx < cur
                          ? "w-full"
                          : "w-0"
                      }`}
                    />
                  </span>
                  <span className="cap text-[11px] truncate">{s.l}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Booking Bar (Floating Frosted Glass) */}
      <form
        onSubmit={handleDesktopBookingSubmit}
        className="absolute left-[max(var(--gut),4vw)] right-[max(var(--gutR),4vw)] bottom-9 z-4 flex flex-wrap bg-[rgba(14,20,17,0.74)] backdrop-blur-[14px] border border-[rgba(243,238,229,0.18)] text-[var(--ivory)] max-[900px]:hidden shadow-2xl"
        aria-label="Check availability"
        noValidate
      >
        <label className="flex-[1.6_1_220px] p-[16px_22px] flex flex-col gap-1.5 border-r border-[rgba(243,238,229,0.14)] min-w-0">
          <span className="cap text-[11px] text-[var(--gold)]">Hotel or destination</span>
          <select
            value={selectedHotel}
            onChange={(e) => setSelectedHotel(e.target.value)}
            className="border-0 bg-transparent text-[var(--ivory)] disp text-[22px] p-0 w-full appearance-none outline-none cursor-pointer [&>option]:text-[var(--ink)]"
          >
            <option value="all">All Terraa hotels</option>
            {SAMPLE_HOTELS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}, {h.city}
              </option>
            ))}
          </select>
        </label>

        <label className="flex-1 basis-[150px] p-[16px_22px] flex flex-col gap-1.5 border-r border-[rgba(243,238,229,0.14)] min-w-0">
          <span className="cap text-[11px] text-[var(--gold)]">Arrive</span>
          <input
            type="date"
            min="2026-10-30"
            value={arrive}
            onChange={(e) => setArrive(e.target.value)}
            className="border-0 bg-transparent text-[var(--ivory)] disp text-[22px] p-0 w-full outline-none [color-scheme:dark]"
          />
        </label>

        <label className="flex-1 basis-[150px] p-[16px_22px] flex flex-col gap-1.5 border-r border-[rgba(243,238,229,0.14)] min-w-0">
          <span className="cap text-[11px] text-[var(--gold)]">Depart</span>
          <input
            type="date"
            min="2026-10-31"
            value={depart}
            onChange={(e) => setDepart(e.target.value)}
            className="border-0 bg-transparent text-[var(--ivory)] disp text-[22px] p-0 w-full outline-none [color-scheme:dark]"
          />
        </label>

        <label className="flex-1 basis-[150px] p-[16px_22px] flex flex-col gap-1.5 border-r border-[rgba(243,238,229,0.14)] min-w-0">
          <span className="cap text-[11px] text-[var(--gold)]">Guests</span>
          <select
            defaultValue="2"
            onChange={(e) => {
              const val = +e.target.value;
              setAdults(val <= 4 ? val : 2);
              setChildren(val === 5 ? 1 : val === 6 ? 2 : 0);
            }}
            className="border-0 bg-transparent text-[var(--ivory)] disp text-[22px] p-0 w-full appearance-none outline-none cursor-pointer [&>option]:text-[var(--ink)]"
          >
            <option value="1">1 adult</option>
            <option value="2">2 adults</option>
            <option value="3">3 adults</option>
            <option value="4">4 adults</option>
            <option value="5">2 adults + 1 child</option>
            <option value="6">2 adults + 2 children</option>
          </select>
        </label>

        <button
          type="submit"
          className="btn btn-brass flex-[1_1_220px] min-h-[84px] text-[12px] tracking-[0.24em]"
        >
          Check availability
        </button>

        {bookingError && (
          <div className="basis-full p-[10px_22px] text-[13px] text-[#F2C6B4] border-t border-[rgba(243,238,229,0.14)]">
            {bookingError}
          </div>
        )}
      </form>

      {/* Mobile Booking Trigger Card */}
      <button
        type="button"
        onClick={openSheet}
        aria-haspopup="dialog"
        className="hidden max-[900px]:flex relative z-5 -mt-[72px] mx-4 flex-col bg-[var(--forest)] text-[var(--ivory)] border border-[rgba(243,238,229,0.15)] cursor-pointer w-[calc(100%-32px)] p-0 text-left shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
      >
        <div className="flex p-[14px_18px] gap-[18px] border-b border-[rgba(243,238,229,0.15)]">
          <span className="flex-1 flex flex-col gap-0.5 min-w-0">
            <span className="cap text-[11px] text-[var(--gold)]">Where</span>
            <b className="disp text-[20px] font-normal truncate">{currentHotelName}</b>
          </span>
          <span className="flex-1 flex flex-col gap-0.5 min-w-0">
            <span className="cap text-[11px] text-[var(--gold)]">When</span>
            <b className="disp text-[20px] font-normal truncate">{shortDateRange()}</b>
          </span>
        </div>
        <span className="cap h-[52px] bg-[var(--brass)] text-[var(--forest)] flex items-center justify-center text-[11px] font-medium tracking-[0.24em]">
          Check availability
        </span>
      </button>
    </section>
  );
}
