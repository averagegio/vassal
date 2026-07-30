"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  hasCompletedLandingTour,
  LANDING_TOUR_STEPS,
  markLandingTourComplete,
  type TourStep,
} from "../lib/tour";

type LandingTourProps = {
  /** True once the portcullis has finished rising and hero copy is visible. */
  ready: boolean;
};

type SpotRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const PAD = 10;

export function LandingTour({ ready }: LandingTourProps) {
  const [eligible, setEligible] = useState(false);
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [spot, setSpot] = useState<SpotRect | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    async function decide() {
      if (hasCompletedLandingTour()) return;

      try {
        const res = await fetch("/api/auth/me", { credentials: "same-origin" });
        const data = (await res.json().catch(() => null)) as
          | { user: unknown }
          | null;
        // Tour is for no-user visitors only.
        if (data?.user) return;
      } catch {
        // Network failure: still allow the tour for anonymous marketing.
      }

      if (cancelled) return;
      setEligible(true);
    }

    void decide();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  useEffect(() => {
    if (!ready || !eligible) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const delay = reduceMotion ? 0 : 600;
    const timer = window.setTimeout(() => setActive(true), delay);
    return () => window.clearTimeout(timer);
  }, [ready, eligible]);

  const step: TourStep | undefined = LANDING_TOUR_STEPS[stepIndex];

  const measure = useCallback(() => {
    if (!step?.target) {
      setSpot(null);
      return;
    }
    const el = document.querySelector(step.target);
    if (!(el instanceof HTMLElement)) {
      setSpot(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setSpot({
      top: Math.max(8, rect.top - PAD),
      left: Math.max(8, rect.left - PAD),
      width: Math.min(window.innerWidth - 16, rect.width + PAD * 2),
      height: Math.min(window.innerHeight - 16, rect.height + PAD * 2),
    });
  }, [step]);

  const scrollToStep = useCallback((s: TourStep) => {
    if (!s.target) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.querySelector(s.target);
    if (!(el instanceof HTMLElement)) return;
    // Leave room for the bottom-docked herald panel.
    const panelH = panelRef.current?.offsetHeight ?? 200;
    const rect = el.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const target =
      absoluteTop - (window.innerHeight - panelH - 48) / 2 + rect.height / 2;
    window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  }, []);

  useLayoutEffect(() => {
    if (!active || !step) return;
    scrollToStep(step);
    const t1 = window.setTimeout(measure, 80);
    const t2 = window.setTimeout(measure, 420);
    const t3 = window.setTimeout(measure, 900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [active, step, measure, scrollToStep]);

  useEffect(() => {
    if (!active) return;
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize);
    };
  }, [active, measure]);

  useEffect(() => {
    if (!active) return;
    const prevent = (e: Event) => {
      const target = e.target;
      if (
        target instanceof Node &&
        panelRef.current &&
        panelRef.current.contains(target)
      ) {
        return;
      }
      e.preventDefault();
    };
    window.addEventListener("wheel", prevent, { passive: false });
    window.addEventListener("touchmove", prevent, { passive: false });
    return () => {
      window.removeEventListener("wheel", prevent);
      window.removeEventListener("touchmove", prevent);
    };
  }, [active]);

  const finish = useCallback(() => {
    markLandingTourComplete();
    setActive(false);
    setEligible(false);
  }, []);

  const next = useCallback(() => {
    if (stepIndex >= LANDING_TOUR_STEPS.length - 1) {
      finish();
      return;
    }
    setStepIndex((i) => i + 1);
  }, [stepIndex, finish]);

  const back = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, finish, next, back]);

  if (!active || !step) return null;

  const isLast = stepIndex === LANDING_TOUR_STEPS.length - 1;

  return (
    <div
      className="tour-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vassal-tour-title"
      aria-describedby="vassal-tour-body"
    >
      {spot ? (
        <div
          className="tour-spotlight"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
          }}
          aria-hidden
        />
      ) : (
        <div className="tour-veil" aria-hidden />
      )}

      <div ref={panelRef} className="tour-panel tour-panel-dock">
        <p className="tour-eyebrow">
          {step.eyebrow}
          <span className="tour-count">
            {" "}
            · {stepIndex + 1}/{LANDING_TOUR_STEPS.length}
          </span>
        </p>
        <h2 id="vassal-tour-title" className="tour-title">
          {step.title}
        </h2>
        <p id="vassal-tour-body" className="tour-body">
          {step.body}
        </p>

        <div className="tour-footer">
          <button type="button" className="tour-skip" onClick={finish}>
            Skip
          </button>
          <div className="tour-dots" aria-hidden>
            {LANDING_TOUR_STEPS.map((s, i) => (
              <span
                key={s.id}
                className={`tour-dot ${i === stepIndex ? "tour-dot-active" : ""}`}
              />
            ))}
          </div>
          <div className="tour-actions">
            {stepIndex > 0 && (
              <button type="button" className="tour-back" onClick={back}>
                Back
              </button>
            )}
            <button type="button" className="tour-next" onClick={next}>
              {isLast ? "Enter the realm" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
