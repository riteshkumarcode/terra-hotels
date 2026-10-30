import React from "react";
import Image from "next/image";
import Link from "next/link";

export function FeaturedHotel() {
  return (
    <section className="on-dark bg-[var(--forest)] text-[var(--ivory)]" aria-label="Hotel of the season">
      <div className="wrap py-[140px] max-[900px]:py-[88px] flex flex-wrap gap-20 max-[900px]:gap-10 items-center">
        {/* Overlapping Photography */}
        <div className="flex-[1.2_1_520px] max-[900px]:basis-full min-w-0 relative pr-[60px] pb-[80px] max-[900px]:pr-[30px] max-[900px]:pb-[50px]">
          <div className="zoomwrap hov relative h-[640px] max-[900px]:h-[400px] w-full overflow-hidden">
            <Image
              src="/img/lobby.jpg"
              alt="Marble lobby with chandeliers at Terraa Lake Palace"
              fill
              sizes="(max-width: 900px) 100vw, 55vw"
              className="object-cover"
              loading="lazy"
            />
          </div>
          <div className="zoomwrap absolute right-0 bottom-0 w-[46%] h-[340px] max-[900px]:h-[200px] border-[10px] max-[900px]:border-[6px] border-[var(--forest)] overflow-hidden shadow-2xl">
            <Image
              src="/img/suite.jpg"
              alt="Maharani Suite sitting room"
              fill
              sizes="(max-width: 900px) 46vw, 25vw"
              className="object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Narrative & Fact counters */}
        <div className="flex-1 basis-[380px] min-w-0 flex flex-col gap-7">
          <span className="cap eyebrow text-[var(--gold)]">Hotel of the season</span>
          <h2 className="disp text-[clamp(42px,4.4vw,68px)] leading-none font-light m-0">
            Terraa Lake Palace, <em className="italic font-light">Udaipur</em>
          </h2>
          <p className="text-[18px] max-[900px]:text-[16px] leading-[1.75] font-light text-[var(--dmuted)] m-0">
            A restored palace on the eastern shore of Lake Pichola. Forty-two
            rooms, a private jetty, and breakfast on the jharokha terrace as the
            City Palace turns gold across the water.
          </p>

          <dl className="grid grid-cols-3 border-y border-[rgba(243,238,229,0.18)] m-0 p-0">
            <div className="py-5.5 pr-0 pl-0 flex flex-col gap-1.5">
              <dt className="cap text-[11px] text-[var(--dmuted2)]">Rooms</dt>
              <dd className="disp text-[34px] max-[900px]:text-[26px] m-0 font-normal">42</dd>
            </div>
            <div className="py-5.5 px-5 flex flex-col gap-1.5 border-l border-[rgba(243,238,229,0.18)]">
              <dt className="cap text-[11px] text-[var(--dmuted2)]">Lake-facing</dt>
              <dd className="disp text-[34px] max-[900px]:text-[26px] m-0 font-normal">31</dd>
            </div>
            <div className="py-5.5 px-5 flex flex-col gap-1.5 border-l border-[rgba(243,238,229,0.18)]">
              <dt className="cap text-[11px] text-[var(--dmuted2)]">From</dt>
              <dd className="disp text-[34px] max-[900px]:text-[26px] m-0 font-normal">₹14,500</dd>
            </div>
          </dl>

          <div className="flex gap-5 flex-wrap items-center pt-2">
            <Link
              href="/hotels/terraa-lake-palace-udaipur"
              className="btn btn-brass"
            >
              Check rates
            </Link>
            <Link
              href="/hotels/terraa-lake-palace-udaipur"
              className="cap lnk text-[var(--ivory)]"
            >
              Explore the palace
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
