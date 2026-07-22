"use client";

import { useEffect, useRef } from "react";
import { VassalLogo } from "./VassalLogo";
import { BleedFlag } from "./BleedFlag";

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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[var(--vassal-black)] ${
        exiting ? "intro-exit" : ""
      }`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <BleedFlag />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <VassalLogo
          size={104}
          className="mb-6 drop-shadow-[0_12px_36px_rgba(0,0,0,0.65)]"
        />
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.45rem,4.8vw,2.35rem)] font-medium leading-none tracking-[0.5em] text-[var(--vassal-cream)] drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)]">
          VASSAL
        </h1>
        <p className="mt-5 font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.38em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_72%,transparent)] sm:text-xs">
          Loyalty AI
        </p>
      </div>

      <button
        type="button"
        onClick={onEnter}
        className="absolute bottom-10 z-10 flex flex-col items-center gap-3 border-0 bg-transparent text-[var(--vassal-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--vassal-blood)]"
        aria-label="Swipe or tap to enter territory"
      >
        <span className="font-[family-name:var(--font-display)] text-xs tracking-[0.32em] uppercase text-[var(--vassal-cream)]/80 sm:text-sm">
          Enter
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
