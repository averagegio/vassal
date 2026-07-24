"use client";

import { useCallback, useRef, useState } from "react";
import { REALM_OVERVIEW_CARDS } from "../lib/features";

const CARDS = REALM_OVERVIEW_CARDS;

const SWIPE_THRESHOLD = 64;

export function InfoCardStack() {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const locked = useRef<"x" | "y" | null>(null);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % CARDS.length);
  }, []);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + CARDS.length) % CARDS.length);
  }, []);

  const endDrag = useCallback(
    (dx: number) => {
      if (dx <= -SWIPE_THRESHOLD) goNext();
      else if (dx >= SWIPE_THRESHOLD) goPrev();
      setDragX(0);
      setDragging(false);
      startX.current = null;
      startY.current = null;
      locked.current = null;
    },
    [goNext, goPrev],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    startY.current = e.clientY;
    locked.current = null;
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current == null || startY.current == null) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (!locked.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      locked.current = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
    }
    if (locked.current === "y") return;
    e.preventDefault();
    setDragX(dx);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    endDrag(locked.current === "y" ? 0 : dx);
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-6 py-20 sm:py-28">
      <div className="mb-10 max-w-md text-center">
        <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.12em] text-[var(--vassal-cream)] sm:text-4xl">
          How the Realm Works
        </h2>
        <p className="mt-3 font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
          Swipe.
        </p>
      </div>

      <div
        className="card-stack relative h-[280px] w-full max-w-[340px] touch-pan-y select-none sm:h-[300px]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="region"
        aria-roledescription="carousel"
        aria-label="Realm features"
      >
        {CARDS.map((card, i) => {
          const offset = (i - index + CARDS.length) % CARDS.length;
          const isTop = offset === 0;
          const visible = offset < 3;
          if (!visible) return null;

          const stackY = offset * 12;
          const stackScale = 1 - offset * 0.05;
          const stackRotate = offset === 0 ? dragX * 0.04 : offset * -2;
          const x = offset === 0 ? dragX : 0;
          const opacity = offset === 0 ? 1 : 0.92 - offset * 0.12;

          return (
            <article
              key={card.id}
              id={card.id}
              className={`info-card stack-card absolute inset-x-0 top-0 ${
                isTop ? "z-30 cursor-grab active:cursor-grabbing" : "z-20 pointer-events-none"
              }`}
              style={{
                transform: `translate3d(${x}px, ${stackY}px, 0) scale(${stackScale}) rotate(${stackRotate}deg)`,
                opacity,
                transition: dragging && isTop ? "none" : "transform 0.35s ease, opacity 0.35s ease",
                zIndex: 30 - offset,
              }}
              aria-hidden={!isTop}
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-block h-2 w-2 rotate-45 bg-[var(--vassal-blood)]" />
                <h3 className="font-[family-name:var(--font-display)] text-lg tracking-[0.08em] text-[var(--vassal-cream)]">
                  {card.title}
                </h3>
              </div>
              <p className="font-[family-name:var(--font-body)] text-[0.95rem] leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_78%,transparent)]">
                {card.body}
              </p>
              {isTop && (
                <p className="mt-8 text-center font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.28em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_45%,transparent)]">
                  Swipe
                </p>
              )}
            </article>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={goPrev}
          className="border border-[color-mix(in_srgb,var(--vassal-gold)_35%,transparent)] bg-transparent px-4 py-2 font-[family-name:var(--font-display)] text-xs tracking-[0.2em] uppercase text-[var(--vassal-cream)] transition hover:border-[var(--vassal-blood)]"
          aria-label="Previous card"
        >
          Prev
        </button>
        <div className="flex gap-2" aria-hidden>
          {CARDS.map((card, i) => (
            <span
              key={card.id}
              className={`h-1.5 w-1.5 rotate-45 transition ${
                i === index ? "bg-[var(--vassal-blood)]" : "bg-[color-mix(in_srgb,var(--vassal-cream)_30%,transparent)]"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={goNext}
          className="border border-[color-mix(in_srgb,var(--vassal-gold)_35%,transparent)] bg-transparent px-4 py-2 font-[family-name:var(--font-display)] text-xs tracking-[0.2em] uppercase text-[var(--vassal-cream)] transition hover:border-[var(--vassal-blood)]"
          aria-label="Next card"
        >
          Next
        </button>
      </div>
    </div>
  );
}
