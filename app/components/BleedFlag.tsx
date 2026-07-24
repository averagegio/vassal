"use client";

type BleedFlagProps = {
  className?: string;
};

/**
 * Full-bleed cloth with a gradual horizontal billow loop.
 * Oversized so motion never reveals empty edges.
 */
export function BleedFlag({ className = "" }: BleedFlagProps) {
  return (
    <div className={`bleed-flag absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="bleed-flag-base absolute inset-0" />

      <div className="flag-cloth-stage absolute inset-[-16%]">
        <div className="flag-cloth-sheet absolute inset-0" />

        {/* Seamless 2x wash: translate -50% for a continuous horizontal billow */}
        <div className="flag-billow-track absolute inset-y-[-8%] left-0 w-[200%]">
          <div className="flag-billow-wash absolute inset-0" />
        </div>

        <div className="flag-wind-sheen absolute inset-0" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,4,5,0.05)_0%,rgba(7,4,5,0.38)_70%,rgba(7,4,5,0.82)_100%)]" />
    </div>
  );
}
