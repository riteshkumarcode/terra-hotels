import React from "react";
import Link from "next/link";

export function IntroSection() {
  return (
    <section className="wrap py-[140px] max-[900px]:py-[88px] flex flex-wrap gap-16 max-[900px]:gap-7 items-end">
      <div className="flex-[1.4_1_520px] min-w-0 flex flex-col gap-7">
        <span className="cap eyebrow">The house of Terraa</span>
        <h2 className="disp text-[clamp(38px,4.6vw,72px)] leading-[1.04] m-0 font-light">
          Eight houses across India, each one{" "}
          <em className="italic font-light">shaped by the place</em> it stands in.
        </h2>
      </div>

      <div className="flex-1 basis-[360px] min-w-0 flex flex-col gap-6 pb-2.5">
        <p className="text-[18px] max-[900px]:text-[16px] leading-[1.75] font-light text-[var(--muted)] max-w-[46ch] m-0">
          A lake palace in Udaipur, a haveli in the old city of Jaipur, a tea
          bungalow above the clouds in Munnar. Every Terraa hotel keeps its own
          character, and the same quiet standard of welcome.
        </p>
        <Link
          href="#destinations"
          className="cap lnk self-start text-[var(--ink)]"
        >
          Our destinations
        </Link>
      </div>
    </section>
  );
}
