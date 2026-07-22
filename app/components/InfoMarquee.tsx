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
  const sectionRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      // Progress while the section crosses the viewport
      const progress = Math.min(
        1,
        Math.max(0, (viewport - rect.top) / (viewport + rect.height * 0.55)),
      );
      const travel = Math.max(0, el.scrollWidth - window.innerWidth + 48);
      setOffset(progress * travel);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const loop = [...CARDS, ...CARDS];

  return (
    <div ref={sectionRef} className="relative w-full overflow-hidden px-4 sm:px-6">
      <div
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
  );
}
