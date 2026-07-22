"use client";

type BleedFlagProps = {
  className?: string;
};

/** Full-bleed cloth with subtle natural wind motion. */
export function BleedFlag({ className = "" }: BleedFlagProps) {
  return (
    <div className={`bleed-flag absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="bleed-flag-glow absolute inset-0" />

      <div className="flag-cloth-stage absolute inset-[-4%]">
        <svg className="flag-cloth-svg absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="flagFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e11d2e" />
              <stop offset="35%" stopColor="#b01020" />
              <stop offset="70%" stopColor="#6e0e18" />
              <stop offset="100%" stopColor="#2a0610" />
            </linearGradient>
            <filter id="flagWind" x="-12%" y="-12%" width="124%" height="124%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.011 0.025"
                numOctaves="3"
                seed="3"
                result="noise"
              >
                <animate
                  attributeName="baseFrequency"
                  dur="11s"
                  values="0.011 0.025;0.014 0.032;0.009 0.022;0.013 0.028;0.011 0.025"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="28"
                xChannelSelector="R"
                yChannelSelector="G"
              >
                <animate
                  attributeName="scale"
                  dur="8s"
                  values="22;34;26;32;22"
                  repeatCount="indefinite"
                />
              </feDisplacementMap>
            </filter>
          </defs>
          <rect
            className="flag-cloth-rect"
            width="100%"
            height="100%"
            fill="url(#flagFill)"
            filter="url(#flagWind)"
          />
        </svg>
        <div className="flag-wind-sheen absolute inset-0" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,4,5,0.06)_0%,rgba(7,4,5,0.42)_70%,rgba(7,4,5,0.82)_100%)]" />
    </div>
  );
}
