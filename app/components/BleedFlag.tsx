"use client";

type BleedFlagProps = {
  className?: string;
};

/** Full-bleed dual-wing flag — smooth flap, no folds. */
export function BleedFlag({ className = "" }: BleedFlagProps) {
  return (
    <div className={`bleed-flag absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="bleed-flag-glow absolute inset-0" />

      <div className="absolute inset-0 flex">
        <div className="flag-wing flag-wing-left relative h-full w-1/2 origin-right">
          <div className="flag-wing-cloth absolute inset-0" />
        </div>
        <div className="flag-wing flag-wing-right relative h-full w-1/2 origin-left">
          <div className="flag-wing-cloth absolute inset-0 scale-x-[-1]" />
        </div>
      </div>

      {/* Soft vignette so brand stays readable */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,4,5,0.15)_0%,rgba(7,4,5,0.55)_70%,rgba(7,4,5,0.85)_100%)]" />
    </div>
  );
}
