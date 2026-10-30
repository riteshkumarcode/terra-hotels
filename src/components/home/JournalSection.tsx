import React from "react";
import Image from "next/image";
import Link from "next/link";

const ARTICLES = [
  {
    hotelSlug: "terraa-mehtab-bagh-agra",
    img: "/img/agra.jpg",
    alt: "The Taj Mahal in morning haze",
    meta: "Agra · 6 min read",
    title: "Seeing the Taj at first light, before the crowds",
  },
  {
    hotelSlug: "terraa-ghats-varanasi",
    img: "/img/varanasi.jpg",
    alt: "Evening aarti on the ghats",
    meta: "Varanasi · 8 min read",
    title: "The evening aarti, from a boat on the Ganga",
  },
  {
    hotelSlug: "terraa-ghats-varanasi",
    img: "/img/amritsar.jpg",
    alt: "Golden Temple reflected in the sarovar",
    meta: "Amritsar · 5 min read",
    title: "A night at the Golden Temple’s langar",
  },
];

export function JournalSection() {
  return (
    <section id="journal" className="wrap py-[140px] max-[900px]:py-[88px] flex flex-col gap-12" aria-label="The journal">
      <div className="flex flex-col gap-4 m-0">
        <span className="cap eyebrow">The journal</span>
        <h2 className="disp text-[clamp(38px,4vw,60px)] font-light m-0">Notes from the road</h2>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8">
        {ARTICLES.map((a, idx) => (
          <Link
            key={idx}
            href={`/hotels/${a.hotelSlug}`}
            className="hov flex flex-col gap-4.5 no-underline text-[var(--ink)]"
          >
            <div className="zoomwrap relative h-[300px] w-full">
              <Image
                src={a.img}
                alt={a.alt}
                fill
                sizes="(max-width: 900px) 100vw, 33vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
            <span className="cap text-[11px] text-[var(--brass-text)]">
              {a.meta}
            </span>
            <b className="disp text-[30px] font-normal leading-snug">
              {a.title}
            </b>
          </Link>
        ))}
      </div>
    </section>
  );
}
