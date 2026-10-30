import React from "react";

const PERKS = [
  "Best rate when you book direct",
  "Breakfast for two on every flexible rate",
  "Free cancellation up to 48 hours",
  "Early check-in for Terraa Circle members",
];

export function PerksMarquee() {
  return (
    <div
      className="bg-[var(--forest)] text-[var(--gold)] overflow-hidden border-t border-[rgba(243,238,229,0.08)] py-4.5"
      aria-label="Book direct benefits"
    >
      <div className="flex w-max gap-14 whitespace-nowrap animate-[drift_40s_linear_infinite]">
        {[0, 1, 2, 3].map((cycle) => (
          <React.Fragment key={cycle}>
            {PERKS.map((perk, idx) => (
              <React.Fragment key={`${cycle}-${idx}`}>
                <span className="cap text-[11px] tracking-[0.24em]">{perk}</span>
                <span aria-hidden="true" className="text-[var(--gold)] opacity-70">
                  ✦
                </span>
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
