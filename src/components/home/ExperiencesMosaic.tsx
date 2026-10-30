import React from "react";
import Image from "next/image";
import Link from "next/link";

const TILES = [
  {
    isTall: true,
    img: "/img/bar.jpg",
    alt: "Wood-panelled bar with lamps",
    category: "Dining",
    title: "Eleven restaurants & bars",
  },
  {
    isTall: false,
    img: "/img/spa.jpg",
    alt: "Treatment room facing the sea",
    category: "Spa",
    title: "Ayurveda & rituals",
  },
  {
    isTall: false,
    img: "/img/dish.jpg",
    alt: "Plated fish with greens",
    category: "Chef’s table",
    title: "Seven courses, one evening",
  },
  {
    isTall: false,
    img: "/img/spa-pool.jpg",
    alt: "Indoor pool with timber walls",
    category: "Wellness",
    title: "Heated pools & hammams",
  },
  {
    isTall: false,
    img: "/img/breakfast.jpg",
    alt: "Breakfast on marble",
    category: "Mornings",
    title: "Breakfast, served late",
  },
];

export function ExperiencesMosaic() {
  return (
    <section id="experiences" className="bg-[var(--linen)]" aria-label="Experiences">
      <div className="wrap py-[140px] max-[900px]:py-[88px] flex flex-col gap-12">
        <div className="flex justify-between items-end gap-6 flex-wrap m-0">
          <div className="flex flex-col gap-4">
            <span className="cap eyebrow">Experiences</span>
            <h2 className="disp text-[clamp(38px,4vw,60px)] font-light m-0">Beyond the room</h2>
          </div>
          <p className="text-[17px] max-[900px]:text-[15px] leading-[1.7] font-light text-[var(--muted)] max-w-[42ch] m-0">
            Dining, spa and slow afternoons by the water. Add any of them when
            you reserve, or ask the concierge once you arrive.
          </p>
        </div>

        {/* Asymmetrical Mosaic Grid */}
        <div className="grid grid-cols-[1.25fr_1fr_1fr] auto-rows-[300px] gap-5 max-[900px]:grid-cols-1 max-[900px]:auto-rows-[240px] max-[900px]:gap-3">
          {TILES.map((t, idx) => (
            <Link
              key={idx}
              href="/hotels/terraa-lake-palace-udaipur#dining"
              className={`hov relative overflow-hidden text-[var(--ivory)] no-underline ${
                t.isTall ? "row-span-2 max-[900px]:row-span-1" : ""
              }`}
            >
              <div className="zoomwrap absolute inset-0">
                <Image
                  src={t.img}
                  alt={t.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 40vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <div className="scrim-b pointer-events-none" />
              <div className="absolute left-7 right-7 bottom-6.5 flex flex-col gap-2 z-2">
                <span className="cap text-[11px] text-[var(--gold)]">{t.category}</span>
                <b
                  className={`disp font-normal leading-none ${
                    t.isTall ? "text-[40px] max-[900px]:text-[32px]" : "text-[32px]"
                  }`}
                >
                  {t.title}
                </b>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
