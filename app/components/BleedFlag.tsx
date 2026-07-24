"use client";

type BleedFlagProps = {
  className?: string;
};

/** Full-bleed cloth that billows and rolls in the wind. */
export function BleedFlag({ className = "" }: BleedFlagProps) {
  return (
    <div className={`bleed-flag absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="bleed-flag-glow absolute inset-0" />

      <div className="flag-cloth-stage absolute inset-[-8%]">
        <svg
          className="flag-cloth-svg absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="flagFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e11d2e" />
              <stop offset="28%" stopColor="#c41424" />
              <stop offset="55%" stopColor="#8a101c" />
              <stop offset="78%" stopColor="#4a0a12" />
              <stop offset="100%" stopColor="#1a0408" />
            </linearGradient>
            <linearGradient id="flagShade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.12" />
              <stop offset="40%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.28" />
            </linearGradient>
            <filter id="flagWind" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.008 0.018"
                numOctaves="4"
                seed="7"
                result="noise"
              >
                <animate
                  attributeName="baseFrequency"
                  dur="7s"
                  values="0.008 0.018;0.012 0.028;0.006 0.014;0.011 0.024;0.009 0.02;0.008 0.018"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="48"
                xChannelSelector="R"
                yChannelSelector="G"
              >
                <animate
                  attributeName="scale"
                  dur="5.5s"
                  values="36;62;44;70;40;54;36"
                  repeatCount="indefinite"
                />
              </feDisplacementMap>
            </filter>
          </defs>
          <rect
            className="flag-cloth-rect"
            width="100"
            height="100"
            fill="url(#flagFill)"
            filter="url(#flagWind)"
          />
          <rect
            className="flag-cloth-shade"
            width="100"
            height="100"
            fill="url(#flagShade)"
            filter="url(#flagWind)"
            opacity="0.85"
          />
        </svg>

        <div className="flag-billow-layer flag-billow-a absolute inset-0" />
        <div className="flag-billow-layer flag-billow-b absolute inset-0" />
        <div className="flag-billow-layer flag-billow-c absolute inset-0" />
        <div className="flag-fold-band flag-fold-1 absolute inset-y-0" />
        <div className="flag-fold-band flag-fold-2 absolute inset-y-0" />
        <div className="flag-fold-band flag-fold-3 absolute inset-y-0" />
        <div className="flag-wind-sheen absolute inset-0" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,4,5,0.04)_0%,rgba(7,4,5,0.38)_68%,rgba(7,4,5,0.84)_100%)]" />
    </div>
  );
}
