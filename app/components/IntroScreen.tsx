"use client";

import { useEffect, useRef } from "react";

type IntroScreenProps = {
  exiting: boolean;
  onEnter: () => void;
  onExitComplete: () => void;
};

export function IntroScreen({
  exiting,
  onEnter,
  onExitComplete,
}: IntroScreenProps) {
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!exiting) return;
    const timer = window.setTimeout(onExitComplete, 1100);
    return () => window.clearTimeout(timer);
  }, [exiting, onExitComplete]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 24) onEnter();
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [onEnter]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current == null) return;
    const endY = e.changedTouches[0]?.clientY ?? touchStartY.current;
    if (touchStartY.current - endY > 56) onEnter();
    touchStartY.current = null;
  };

  return (
    <section
      aria-label="Enter Vassal territory"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden flag-sky ${
        exiting ? "intro-exit" : ""
      }`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Ambient flag banners */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-2%] top-[4%] h-[78vh] w-[42vw] max-w-[460px] origin-top-left flag-wave">
          <div className="flag-cloth relative h-full w-full [clip-path:polygon(0_0,100%_0,96%_100%,0_100%)]">
            <FlagEmblem />
          </div>
        </div>
        <div className="absolute right-[-4%] top-[8%] h-[72vh] w-[40vw] max-w-[420px] origin-top-right flag-wave [animation-delay:-2s]">
          <div className="flag-cloth relative h-full w-full opacity-95 [clip-path:polygon(4%_0,100%_0,100%_100%,0_100%)]">
            <FlagEmblem flipped />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[55%] intro-gradient-veil" />
      </div>

      {/* Brand center */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p className="mb-4 font-[family-name:var(--font-body)] text-sm tracking-[0.35em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)]">
          Loyalty of the Realm
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(3.5rem,14vw,8.5rem)] font-bold leading-none tracking-[0.18em] text-[var(--vassal-cream)] drop-shadow-[0_8px_32px_rgba(176,16,32,0.55)]">
          VASSAL
        </h1>
        <div className="mt-5 h-px w-28 bg-gradient-to-r from-transparent via-[var(--vassal-gold)] to-transparent" />
        <p className="mt-6 max-w-md font-[family-name:var(--font-body)] text-lg italic text-[color-mix(in_srgb,var(--vassal-cream)_80%,transparent)] sm:text-xl">
          Raise your banner. Earn your keep. Rule your feed.
        </p>
      </div>

      {/* Enter CTA */}
      <button
        type="button"
        onClick={onEnter}
        className="absolute bottom-10 z-10 flex flex-col items-center gap-3 border-0 bg-transparent text-[var(--vassal-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--vassal-blood)]"
        aria-label="Swipe or tap to enter territory"
      >
        <span className="font-[family-name:var(--font-display)] text-sm tracking-[0.28em] uppercase text-[var(--vassal-blood)] sm:text-base">
          Enter Territory
        </span>
        <span className="swipe-arrow flex h-10 w-10 items-center justify-center" aria-hidden>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12l7 7 7-7"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </section>
  );
}

function FlagEmblem({ flipped = false }: { flipped?: boolean }) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center ${
        flipped ? "scale-x-[-1]" : ""
      }`}
    >
      <svg
        viewBox="0 0 120 140"
        className="h-[42%] w-auto opacity-80"
        aria-hidden
      >
        <path
          d="M60 12 L72 48 L110 48 L80 72 L92 110 L60 86 L28 110 L40 72 L10 48 L48 48 Z"
          fill="none"
          stroke="rgba(201,162,39,0.75)"
          strokeWidth="2.5"
        />
        <circle
          cx="60"
          cy="64"
          r="14"
          fill="none"
          stroke="rgba(243,230,216,0.55)"
          strokeWidth="2"
        />
        <path
          d="M60 54 V74 M50 64 H70"
          stroke="rgba(243,230,216,0.55)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
