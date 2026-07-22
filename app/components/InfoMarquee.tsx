"use client";

import { useEffect, useRef, useState } from "react";

const CARDS = [
  {
    id: "oath",
    title: "Take the Oath",
    body: "Follow creators you champion. Every like, share, and watch builds your standing in their court.",
  },
  {
    id: "ranks",
    title: "Rise Through Ranks",
    body: "Climb from Serf to Knight to Lord as your loyalty score grows across campaigns and seasons.",
  },
  {
    id: "rewards",
    title: "Claim Rewards",
    body: "Unlock exclusive drops, early access, and creator-granted privileges reserved for true vassals.",
  },
  {
    id: "banners",
    title: "Fly Your Banner",
    body: "Show off badges on your profile so the realm sees who earned their place at the high table.",
  },
  {
    id: "campaigns",
    title: "Season Campaigns",
    body: "Join time-bound quests. Complete challenges, defend your streak, and earn seasonal titles.",
  },
];

export function InfoMarquee() {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const update = () => {
      const pin = pinRef.current;
      const track = trackRef.current;
      if (!pin || !track) return;

      const rect = pin.getBoundingClientRect();
      const pinHeight = pin.offsetHeight;
      const viewport = window.innerHeight;
      // How far we've scrolled through the tall pin region
      const scrolled = Math.min(
        Math.max(-rect.top, 0),
        Math.max(pinHeight - viewport, 1),
      );
      const progress = scrolled / Math.max(pinHeight - viewport, 1);
      const travel = Math.max(track.scrollWidth - window.innerWidth + 64, 0);
      setOffset(progress * travel);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const loop = [...CARDS, ...CARDS];

  return (
    <div ref={pinRef} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 max-w-2xl shrink-0 px-6 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.12em] text-[var(--vassal-cream)] sm:text-4xl">
            How the Realm Works
          </h2>
          <p className="mt-4 font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
            Scroll to march the banners — loyalty, ranks, and rewards for your
            court.
          </p>
        </div>

        <div className="relative w-full overflow-hidden px-4 sm:px-6">
          <div
            ref={trackRef}
            className="marquee-track"
            style={{ transform: `translate3d(${-offset}px, 0, 0)` }}
          >
            {loop.map((card, i) => (
              <article
                key={`${card.id}-${i}`}
                id={i < CARDS.length ? card.id : undefined}
                className="info-card"
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
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
