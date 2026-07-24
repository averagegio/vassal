"use client";

type BleedFlagProps = {
  className?: string;
};

/**
 * Full-bleed cloth with natural wind motion.
 * Oversized so displacement never reveals empty edges.
 */
export function BleedFlag({ className = "" }: BleedFlagProps) {
  return (
    <div className={`bleed-flag absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="bleed-flag-base absolute inset-0" />

      <div className="flag-cloth-stage absolute inset-[-14%]">
        <svg
          className="flag-cloth-svg absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="flagFill" x1="8%" y1="0%" x2="92%" y2="100%">
              <stop offset="0%" stopColor="#e11d2e" />
              <stop offset="28%" stopColor="#c41424" />
              <stop offset="55%" stopColor="#8a101c" />
              <stop offset="78%" stopColor="#4a0a12" />
              <stop offset="100%" stopColor="#1a0408" />
            </linearGradient>
            <radialGradient id="flagBloom" cx="48%" cy="42%" r="58%">
              <stop offset="0%" stopColor="#ff4a4a" stopOpacity="0.28" />
              <stop offset="55%" stopColor="#e11d2e" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.2" />
            </radialGradient>
            <filter id="flagWind" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.009 0.016"
                numOctaves="3"
                seed="4"
                result="noise"
              >
                <animate
                  attributeName="baseFrequency"
                  dur="14s"
                  values="0.009 0.016;0.011 0.02;0.008 0.014;0.01 0.018;0.009 0.016"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="18"
                xChannelSelector="R"
                yChannelSelector="G"
              >
                <animate
                  attributeName="scale"
                  dur="10s"
                  values="14;22;16;20;14"
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
            opacity="0.9"
          />
        </svg>

        <div className="flag-wind-sheen absolute inset-0" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,4,5,0.05)_0%,rgba(7,4,5,0.38)_70%,rgba(7,4,5,0.82)_100%)]" />
    </div>
  );
}
