"use client";

const STRIP_COUNT = 14;

type WavingFlagProps = {
  className?: string;
  delay?: number;
};

export function WavingFlag({ className = "", delay = 0 }: WavingFlagProps) {
  return (
    <div
      className={`waving-flag relative ${className}`}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden
    >
      <div className="flag-pole absolute left-0 top-0 z-20 h-full w-[3px] rounded-full bg-gradient-to-b from-[#d4b84a] via-[#6a5420] to-[#2a220e]" />

      <div
        className="flag-cloth-wave absolute inset-y-[2%] left-[3px] right-0 overflow-visible"
        style={{ animationDelay: `${delay}s` }}
      >
        <div className="flag-strip-row absolute inset-0 flex">
          {Array.from({ length: STRIP_COUNT }, (_, i) => {
            const t = i / (STRIP_COUNT - 1);
            const mid = Math.sin(t * Math.PI);
            return (
              <div
                key={i}
                className="flag-strip relative"
                style={{
                  animationDelay: `${delay + t * 0.42}s`,
                  zIndex: Math.round(mid * 10),
                  marginLeft: i === 0 ? 0 : -1,
                  background: `
                    linear-gradient(
                      90deg,
                      rgba(0,0,0,${0.08 + t * 0.12}) 0%,
                      transparent 35%,
                      rgba(255,220,180,${0.04 + mid * 0.08}) 55%,
                      rgba(0,0,0,${0.18 + (1 - mid) * 0.22}) 100%
                    ),
                    linear-gradient(
                      180deg,
                      #c62838 0%,
                      #9a1524 28%,
                      #6e0e18 62%,
                      #3a0610 100%
                    )
                  `,
                }}
              >
                {/* Traveling fold highlight */}
                <span
                  className="flag-fold-sheen absolute inset-0"
                  style={{ animationDelay: `${delay + t * 0.42 + 0.2}s` }}
                />
              </div>
            );
          })}
        </div>

        {/* Soft bottom fringe / hem shadow */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/35 to-transparent" />
      </div>
    </div>
  );
}
