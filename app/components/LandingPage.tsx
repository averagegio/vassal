"use client";

import { useEffect, useState } from "react";
import type { LandingViewer } from "../lib/home";
import { LexiconProvider, LexiconTerm, useLexicon } from "./Lexicon";
import { SideDrawer } from "./SideDrawer";
import { VassalLogo } from "./VassalLogo";
import { RealmPaths } from "./RealmPaths";
import { FanHoldingSection } from "./FanHoldingSection";
import { RealEstateSection } from "./RealEstateSection";
import { StewardSection } from "./StewardSection";
import { LandingTour } from "./LandingTour";

export type { LandingViewer };

type LandingPageProps = {
  active: boolean;
  /** Skip the sealed-gate hold and open already clear (return from auth). */
  skipChoreography?: boolean;
  viewer?: LandingViewer | null;
};

export function LandingPage({
  active,
  skipChoreography = false,
  viewer = null,
}: LandingPageProps) {
  const [gatesOpen, setGatesOpen] = useState(skipChoreography);
  const [heroVisible, setHeroVisible] = useState(skipChoreography);
  const [lampsLit, setLampsLit] = useState(skipChoreography);
  const [tourReady, setTourReady] = useState(skipChoreography);
  const [showNav, setShowNav] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePath, setActivePath] = useState<"fan" | "estate">("fan");

  useEffect(() => {
    if (!active || skipChoreography) return;
    // Hold sealed portcullis briefly, then raise it
    const gateTimer = window.setTimeout(() => setGatesOpen(true), 700);
    const lampTimer = window.setTimeout(() => setLampsLit(true), 3200);
    // Portcullis transition is 2.8s; wait until the corridor is clear.
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Reduced motion snaps the gate — reveal hero with the open state.
    const heroTimer = reduceMotion
      ? window.setTimeout(() => setHeroVisible(true), 700)
      : undefined;
    const tourTimer = window.setTimeout(
      () => setTourReady(true),
      reduceMotion ? 200 : 3600,
    );
    return () => {
      window.clearTimeout(gateTimer);
      window.clearTimeout(lampTimer);
      if (heroTimer !== undefined) window.clearTimeout(heroTimer);
      window.clearTimeout(tourTimer);
    };
  }, [active, skipChoreography]);

  useEffect(() => {
    const onScroll = () => {
      setShowNav(window.scrollY > window.innerHeight * 0.45);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <LexiconProvider>
      <LandingBody
        viewer={viewer}
        drawerOpen={drawerOpen}
        showNav={showNav}
        setDrawerOpen={setDrawerOpen}
        gatesOpen={gatesOpen}
        heroVisible={heroVisible}
        lampsLit={lampsLit}
        tourReady={tourReady}
        activePath={activePath}
        setActivePath={setActivePath}
        setHeroVisible={setHeroVisible}
      />
    </LexiconProvider>
  );
}

function LandingBody({
  viewer,
  drawerOpen,
  showNav,
  setDrawerOpen,
  gatesOpen,
  heroVisible,
  lampsLit,
  tourReady,
  activePath,
  setActivePath,
  setHeroVisible,
}: {
  viewer: LandingViewer | null;
  drawerOpen: boolean;
  showNav: boolean;
  setDrawerOpen: (open: boolean) => void;
  gatesOpen: boolean;
  heroVisible: boolean;
  lampsLit: boolean;
  tourReady: boolean;
  activePath: "fan" | "estate";
  setActivePath: (path: "fan" | "estate") => void;
  setHeroVisible: (open: boolean) => void;
}) {
  const { openLexicon } = useLexicon();

  return (
    <div className="relative">
      <SideDrawer
        open={drawerOpen}
        visible={showNav}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
        viewer={viewer}
        onOpenLexicon={() => openLexicon()}
      />

      <section className="relative min-h-dvh overflow-hidden dungeon-bg">
        {/* Cobblestone corridor behind the gate */}
        <div className="absolute inset-0 cobblestone opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(90,20,24,0.35),transparent_65%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[var(--vassal-black)]" />

        {/* Perspective hallway lines */}
        <div
          className="pointer-events-none absolute left-1/2 top-[14%] h-[58%] w-[min(70vw,480px)] -translate-x-1/2"
          aria-hidden
        >
          <div className="absolute inset-0 border-x border-[color-mix(in_srgb,#5a4038_55%,transparent)] opacity-50 [transform:perspective(600px)_rotateX(8deg)]" />
          <div className="absolute inset-x-[18%] top-[10%] bottom-[18%] bg-[radial-gradient(ellipse_at_center,rgba(176,16,32,0.22),transparent_70%)]" />
        </div>

        <Torch side="left" lit={lampsLit} />
        <Torch side="right" lit={lampsLit} />

        {/* Gate assembly — portcullis rises; frame stays behind hero copy */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-stretch justify-center">
          <div className="relative h-full w-full max-w-5xl">
            <div className="absolute inset-x-[5%] top-[5%] bottom-0 border-[12px] border-b-0 border-[#4a4540] opacity-95 [border-radius:999px_999px_0_0/42%_42%_0_0] shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] sm:inset-x-[9%] sm:border-[14px]" />
            <div className="absolute inset-x-[5%] top-[5%] h-[14%] rounded-t-[999px] bg-gradient-to-b from-[#3a3530] to-transparent opacity-80 sm:inset-x-[9%]" />

            <div className="absolute inset-x-[7%] top-[11%] bottom-0 overflow-hidden sm:inset-x-[11%]">
              <div
                className="portcullis absolute inset-x-0 top-0 h-full"
                style={{
                  transform: gatesOpen
                    ? "translate3d(0, -108%, 0)"
                    : "translate3d(0, 0, 0)",
                }}
                onTransitionEnd={(e) => {
                  if (e.propertyName !== "transform") return;
                  if (!gatesOpen) return;
                  setHeroVisible(true);
                }}
              >
                <Portcullis />
              </div>
            </div>
          </div>
        </div>

        {/* Hero sits above the gate; copy waits until the portcullis is fully up */}
        <div
          className={`hero-copy relative z-30 flex min-h-dvh flex-col items-center justify-center px-8 text-center transition-opacity duration-700 sm:px-12 ${
            heroVisible
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <div
            data-tour="hero"
            className="flex w-full max-w-[min(92vw,22rem)] flex-col items-center sm:max-w-md"
          >
            <VassalLogo size={72} className="mb-4 drop-shadow-[0_8px_24px_rgba(0,0,0,0.65)]" />
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,5.5vw,2.85rem)] font-semibold tracking-[0.38em] text-[var(--vassal-cream)] drop-shadow-[0_6px_28px_rgba(0,0,0,0.85)]">
              VASSAL
            </h1>
            <p className="mt-4 font-[family-name:var(--font-body)] text-base italic leading-snug text-[color-mix(in_srgb,var(--vassal-cream)_88%,transparent)] sm:text-lg">
              AI help for creator communities and rentals.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {viewer ? (
                <>
                  <a
                    href={viewer.homeHref}
                    className="inline-flex items-center gap-3 border border-[color-mix(in_srgb,var(--vassal-gold)_50%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_40%,transparent)] px-5 py-3 font-[family-name:var(--font-display)] text-xs tracking-[0.22em] uppercase text-[var(--vassal-cream)] transition hover:bg-[color-mix(in_srgb,var(--vassal-red)_55%,transparent)]"
                  >
                    <span
                      className="inline-flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] bg-[var(--vassal-stone)]"
                      aria-hidden
                    >
                      {viewer.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={viewer.avatarUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[0.65rem] text-[var(--vassal-gold)]">
                          {viewer.name.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </span>
                    Open dashboard
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/signup"
                    className="inline-flex border border-[color-mix(in_srgb,var(--vassal-gold)_50%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_40%,transparent)] px-6 py-3 font-[family-name:var(--font-display)] text-xs tracking-[0.22em] uppercase text-[var(--vassal-cream)] transition hover:bg-[color-mix(in_srgb,var(--vassal-red)_55%,transparent)]"
                  >
                    Join
                  </a>
                  <a
                    href="/login"
                    className="inline-flex border border-[color-mix(in_srgb,var(--vassal-gold)_35%,transparent)] bg-transparent px-6 py-3 font-[family-name:var(--font-display)] text-xs tracking-[0.22em] uppercase text-[var(--vassal-cream)] transition hover:border-[var(--vassal-blood)]"
                  >
                    Log in
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <RealmPaths activePath={activePath} onSelect={setActivePath} />
      <FanHoldingSection />
      <RealEstateSection />
      <StewardSection />

      <footer className="border-t border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-6 py-10 text-center">
        <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.3em] uppercase text-[var(--vassal-blood)]">
          Vassal
        </p>
        <p className="mt-2 text-sm text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
          Creators. Rentals. One{" "}
          <LexiconTerm id="steward">Steward</LexiconTerm>.
        </p>
        <button
          type="button"
          onClick={() => openLexicon()}
          className="mt-5 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.22em] uppercase text-[var(--vassal-gold)] underline-offset-4 transition hover:text-[var(--vassal-cream)] hover:underline"
        >
          Lexicon — what do these words mean?
        </button>
      </footer>

      <LandingTour ready={tourReady} />
    </div>
  );
}

function Torch({
  side,
  lit,
}: {
  side: "left" | "right";
  lit: boolean;
}) {
  const position =
    side === "left"
      ? "left-[3%] sm:left-[7%]"
      : "right-[3%] sm:right-[7%]";

  return (
    <div
      className={`pointer-events-none absolute top-[26%] z-[25] ${position}`}
      aria-hidden
    >
      <div
        className={`lamp-glow absolute -left-16 -top-16 h-44 w-44 ${lit ? "lit" : ""}`}
      />
      <div className="relative flex flex-col items-center">
        <div
          className={`torch-flame h-11 w-7 rounded-[50%_50%_40%_40%] bg-gradient-to-t from-[var(--vassal-red)] via-[var(--vassal-ember)] to-[#ffe08a] ${
            lit ? "lit" : ""
          }`}
        />
        <div className="h-16 w-3.5 rounded-sm bg-gradient-to-b from-[#5a3a28] to-[#2a1810]" />
        <div className="mt-1 h-2 w-9 rounded-sm bg-[#3a281c]" />
      </div>
    </div>
  );
}

function Portcullis() {
  return (
    <div className="absolute inset-0" aria-hidden>
      {/* Chains on either side */}
      <div
        className="absolute left-[6%] top-[-8%] h-[20%] w-2 rounded-full opacity-90"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, #c0bbb4 0 8px, #4a4844 8px 12px, #8a8580 12px 16px)",
        }}
      />
      <div
        className="absolute right-[6%] top-[-8%] h-[20%] w-2 rounded-full opacity-90"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, #c0bbb4 0 8px, #4a4844 8px 12px, #8a8580 12px 16px)",
        }}
      />

      {/* Diamond lattice */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent 0 16px,
              #7a7670 16px 19px,
              transparent 19px 34px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent 0 16px,
              #7a7670 16px 19px,
              transparent 19px 34px
            )
          `,
          filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.75))",
        }}
      />

      {/* Vertical iron pickets */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 20px, #9a9690 20px 25px, #4a4844 25px 26px, transparent 26px 42px)",
        }}
      />

      {/* Horizontal braces */}
      <div className="absolute inset-x-0 top-[10%] h-[8px] bg-gradient-to-b from-[#c0bbb4] via-[#4a4844] to-[#c0bbb4] shadow-[0_3px_8px_rgba(0,0,0,0.75)]" />
      <div className="absolute inset-x-0 top-[32%] h-[8px] bg-gradient-to-b from-[#c0bbb4] via-[#4a4844] to-[#c0bbb4] shadow-[0_3px_8px_rgba(0,0,0,0.75)]" />
      <div className="absolute inset-x-0 top-[54%] h-[9px] bg-gradient-to-b from-[#c0bbb4] via-[#4a4844] to-[#c0bbb4] shadow-[0_3px_8px_rgba(0,0,0,0.75)]" />
      <div className="absolute inset-x-0 top-[76%] h-[8px] bg-gradient-to-b from-[#c0bbb4] via-[#4a4844] to-[#c0bbb4] shadow-[0_3px_8px_rgba(0,0,0,0.75)]" />

      {/* Bottom spear tips — classic portcullis edge */}
      <svg
        className="absolute inset-x-0 bottom-0 h-12 w-full"
        viewBox="0 0 400 48"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="spearMetal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c0bbb4" />
            <stop offset="100%" stopColor="#4a4844" />
          </linearGradient>
        </defs>
        {Array.from({ length: 16 }, (_, i) => {
          const x = 12 + i * 24;
          return (
            <polygon
              key={i}
              points={`${x},0 ${x + 10},0 ${x + 5},48`}
              fill="url(#spearMetal)"
            />
          );
        })}
      </svg>
    </div>
  );
}
