"use client";

type BleedFlagProps = {
  className?: string;
};

/** Full-bleed flag with ripple motion — no folds or strips. */
export function BleedFlag({ className = "" }: BleedFlagProps) {
  return (
    <div className={`bleed-flag absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="bleed-flag-glow absolute inset-0" />

      <div className="flag-wing-stage absolute inset-[-6%]">
        <div className="flag-wing-beat absolute inset-0">
          <div className="flag-wing-cloth absolute inset-0" />
          <div className="flag-ripple flag-ripple-a absolute inset-0" />
          <div className="flag-ripple flag-ripple-b absolute inset-0" />
          <div className="flag-ripple flag-ripple-c absolute inset-0" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,4,5,0.08)_0%,rgba(7,4,5,0.45)_68%,rgba(7,4,5,0.82)_100%)]" />
    </div>
  );
}
