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
        <svg
          className="flag-cloth-svg absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="flagFill" x1="6%" y1="0%" x2="94%" y2="100%">
              <stop offset="0%" stopColor="#e11d2e" />
              <stop offset="28%" stopColor="#c41424" />
              <stop offset="55%" stopColor="#8a101c" />
              <stop offset="78%" stopColor="#4a0a12" />
              <stop offset="100%" stopColor="#1a0408" />
            </linearGradient>
            <radialGradient id="flagBloom" cx="48%" cy="42%" r="58%">
              <stop offset="0%" stopColor="#ff4a4a" stopOpacity="0.26" />
              <stop offset="55%" stopColor="#e11d2e" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.18" />
            </radialGradient>
            <filter id="flagWind" x="-18%" y="-18%" width="136%" height="136%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.008 0.014"
                numOctaves="2"
                seed="4"
                result="noise"
              >
                <animate
                  attributeName="baseFrequency"
                  dur="16s"
                  values="0.008 0.014;0.01 0.017;0.007 0.012;0.009 0.015;0.008 0.014"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="12"
                xChannelSelector="R"
                yChannelSelector="G"
              >
                <animate
                  attributeName="scale"
                  dur="12s"
                  values="10;15;11;14;10"
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
            width="100"
            height="100"
            fill="url(#flagBloom)"
            filter="url(#flagWind)"
            opacity="0.88"
          />
        </svg>

        {/* Seamless duplicated track: translates -50% for a continuous horizontal loop */}
        <div className="flag-billow-track absolute inset-y-0 left-0 flex w-[200%]">
          <div className="flag-billow-period relative h-full w-1/2">
            <span className="flag-billow-ridge flag-billow-ridge-a" />
            <span className="flag-billow-ridge flag-billow-ridge-b" />
            <span className="flag-billow-ridge flag-billow-ridge-c" />
          </div>
          <div className="flag-billow-period relative h-full w-1/2" aria-hidden>
            <span className="flag-billow-ridge flag-billow-ridge-a" />
            <span className="flag-billow-ridge flag-billow-ridge-b" />
            <span className="flag-billow-ridge flag-billow-ridge-c" />
          </div>
        </div>

        <div className="flag-wind-sheen absolute inset-0" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,4,5,0.05)_0%,rgba(7,4,5,0.38)_70%,rgba(7,4,5,0.82)_100%)]" />
    </div>
  );
}
