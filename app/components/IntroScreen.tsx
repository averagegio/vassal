"use client";

import { useEffect, useRef } from "react";
import { VassalLogo } from "./VassalLogo";
import { WavingFlag } from "./WavingFlag";

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
      {/* Single waving banner with wind folds */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="absolute left-[6%] top-[10%] hidden h-[70vh] w-[min(34vw,320px)] sm:block">
          <WavingFlag className="h-full w-full opacity-90" />
        </div>
        <div className="absolute right-[4%] top-[14%] hidden h-[62vh] w-[min(30vw,280px)] opacity-70 sm:block [transform:scaleX(-1)]">
          <WavingFlag className="h-full w-full" delay={-1.4} />
        </div>
        {/* Mobile: one centered soft flag wash behind brand */}
        <div className="absolute inset-x-[8%] top-[8%] h-[55vh] opacity-50 sm:hidden">
          <WavingFlag className="mx-auto h-full w-full max-w-[280px]" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[55%] intro-gradient-veil" />
      </div>

      {/* Brand center — V logo + sleeker wordmark */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <VassalLogo size={92} className="mb-5 drop-shadow-[0_10px_28px_rgba(176,16,32,0.45)]" />
        <p className="mb-3 font-[family-name:var(--font-body)] text-[0.7rem] tracking-[0.42em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
          Loyalty of the Realm
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.55rem,5.2vw,2.65rem)] font-medium leading-none tracking-[0.48em] text-[var(--vassal-cream)] drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)]">
          VASSAL
        </h1>
        <div className="mt-4 h-px w-16 bg-gradient-to-r from-transparent via-[var(--vassal-gold)] to-transparent" />
        <p className="mt-5 max-w-sm font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_78%,transparent)] sm:text-lg">
          Raise your banner. Earn your keep. Rule your feed.
        </p>
      </div>

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
