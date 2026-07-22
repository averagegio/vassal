"use client";

type BleedFlagProps = {
  className?: string;
};

/** Full-bleed flag with a continuous, noticeable ripple loop. */
export function BleedFlag({ className = "" }: BleedFlagProps) {
  return (
    <div className={`bleed-flag absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="bleed-flag-glow absolute inset-0" />

      <div className="flag-wing-stage absolute inset-[-8%]">
        <div className="flag-wing-beat absolute inset-0">
          <div className="flag-wing-cloth absolute inset-0" />
          <div className="flag-ripple-pulse" />
          <div className="flag-ripple flag-ripple-a" />
          <div className="flag-ripple flag-ripple-b" />
          <div className="flag-ripple flag-ripple-c" />
          <div className="flag-ripple flag-ripple-d" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,4,5,0.05)_0%,rgba(7,4,5,0.4)_70%,rgba(7,4,5,0.8)_100%)]" />
    </div>
  );
}
