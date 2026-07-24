"use client";

import type { CSSProperties } from "react";

type BleedFlagProps = {
  className?: string;
};

const STRIP_COUNT = 32;

/** Full-bleed cloth that billows and rolls in the wind. */
export function BleedFlag({ className = "" }: BleedFlagProps) {
  return (
    <div className={`bleed-flag absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="bleed-flag-glow absolute inset-0" />

      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden>
        <defs>
          <filter id="flagWind" x="-12%" y="-12%" width="124%" height="124%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.024"
              numOctaves="3"
              seed="5"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="5.5s"
                values="0.012 0.024;0.016 0.032;0.009 0.02;0.014 0.028;0.012 0.024"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="22"
              xChannelSelector="R"
              yChannelSelector="G"
            >
              <animate
                attributeName="scale"
                dur="4s"
                values="14;30;18;34;16;24;14"
                repeatCount="indefinite"
              />
            </feDisplacementMap>
          </filter>
        </defs>
      </svg>

      <div className="flag-cloth-stage absolute inset-[-8%_-3%_-12%_-2%]">
        <div className="flag-strip-field absolute inset-0">
          {Array.from({ length: STRIP_COUNT }, (_, i) => {
            const overlap = 0.55;
            const width = 100 / STRIP_COUNT + overlap;
            const left = (i / STRIP_COUNT) * 100 - overlap / 2;
            const delay = `${(i / (STRIP_COUNT - 1)) * -2.8}s`;
            const depth = i / (STRIP_COUNT - 1);

            return (
              <div
                key={i}
                className="flag-strip"
                style={
                  {
                    left: `${left}%`,
                    width: `${width}%`,
                    animationDelay: delay,
                    "--flag-depth": String(depth),
                    backgroundPosition: `${-left * (100 / width)}% center`,
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

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,4,5,0.05)_0%,rgba(7,4,5,0.4)_70%,rgba(7,4,5,0.86)_100%)]" />
    </div>
  );
}
