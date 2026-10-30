import React from "react";
import Image from "next/image";
import Link from "next/link";

const OFFERS = [
  {
    hotelSlug: "terraa-pine-ridge-manali",
    img: "/img/manali.jpg",
    alt: "Himalayan ridge above pine forest",
    validity: "Manali · Munnar · Jaipur · till 28 Feb 2027",
    title: "Winter escapes: stay three nights, pay for two",
  },
  {
    hotelSlug: "terraa-lake-palace-udaipur",
    img: "/img/room-exec.jpg",
    alt: "Bright suite with sofa",
    validity: "All hotels · minimum 2 nights",
    title: "Honeymoon: suite upgrade and a candlelit dinner",
  },
  {
    hotelSlug: "terraa-tea-estate-munnar",
    img: "/img/munnar.jpg",
    alt: "Tea gardens under cloud",
    validity: "Munnar · Kumarakom",
    title: "Seven-night Ayurveda retreat with daily treatments",
  },
];

export function OffersSection() {
  return (
    <section id="offers" className="wrap py-[140px] max-[900px]:py-[88px] flex flex-col gap-12" aria-label="Offers">
      <div className="flex justify-between items-end gap-6 flex-wrap m-0">
        <div className="flex flex-col gap-4">
          <span className="cap eyebrow">Offers</span>
          <h2 className="disp text-[clamp(38px,4vw,60px)] font-light m-0">For this season</h2>
        </div>
        <Link href="/hotels" className="cap lnk text-[var(--ink)]">
          All offers
        </Link>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8">
        {OFFERS.map((o, idx) => (
          <Link
            key={idx}
            href={`/hotels/${o.hotelSlug}`}
            className="hov flex flex-col gap-4.5 no-underline text-[var(--ink)]"
          >
            <div className="zoomwrap relative h-[400px] max-[900px]:h-[280px] w-full">
              <Image
                src={o.img}
                alt={o.alt}
                fill
                sizes="(max-width: 900px) 100vw, 33vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
            <span className="cap text-[11px] text-[var(--brass-text)]">
              {o.validity}
            </span>
            <b className="disp text-[32px] font-normal leading-[1.08]">
              {o.title}
            </b>
            <span className="cap lnk self-start text-[11px] text-[var(--ink)]">
              View offer
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
