"use client";

import type { CSSProperties } from "react";

type BleedFlagProps = {
  className?: string;
};

const STRIP_COUNT = 36;

/** Full-bleed cloth that billows and rolls in the wind. */
export function BleedFlag({ className = "" }: BleedFlagProps) {
  return (
    <div className={`bleed-flag absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="bleed-flag-glow absolute inset-0" />

      <div className="flag-cloth-stage absolute inset-0">
        <div className="flag-strip-field absolute -inset-[8%_-2%_-14%_-1%]">
          {Array.from({ length: STRIP_COUNT }, (_, i) => {
            const overlap = 0.7;
            const width = 100 / STRIP_COUNT + overlap;
            const left = (i / STRIP_COUNT) * 100 - overlap / 2;
            const delay = `${((i / (STRIP_COUNT - 1)) * -3.2).toFixed(3)}s`;
            const duration = `${(2.4 + (i % 5) * 0.12).toFixed(2)}s`;

            return (
              <div
                key={i}
                className="flag-strip"
                style={
                  {
                    left: `${left}%`,
                    width: `${width}%`,
                    animationDelay: delay,
                    animationDuration: duration,
                    backgroundPosition: `${(-(i / STRIP_COUNT) * 100).toFixed(3)}% center`,
                  } as CSSProperties
                }
              />
            );
          })}
        </div>

        <div className="flag-billow-layer flag-billow-a absolute inset-0" />
        <div className="flag-billow-layer flag-billow-b absolute inset-0" />
        <div className="flag-fold-band flag-fold-1 absolute inset-y-0" />
        <div className="flag-fold-band flag-fold-2 absolute inset-y-0" />
        <div className="flag-wind-sheen absolute inset-0" />
      </div>
    </div>
  );
}
