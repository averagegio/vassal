"use client";

import { useEffect, useState } from "react";
import { SideDrawer } from "./SideDrawer";
import { InfoMarquee } from "./InfoMarquee";

type LandingPageProps = {
  active: boolean;
};

export function LandingPage({ active }: LandingPageProps) {
  const [gatesOpen, setGatesOpen] = useState(false);
  const [lampsLit, setLampsLit] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!active) return;
    const gateTimer = window.setTimeout(() => setGatesOpen(true), 280);
    const lampTimer = window.setTimeout(() => setLampsLit(true), 2100);
    return () => {
      window.clearTimeout(gateTimer);
      window.clearTimeout(lampTimer);
    };
  }, [active]);

  useEffect(() => {
    const onScroll = () => {
      setShowNav(window.scrollY > window.innerHeight * 0.45);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative">
      <SideDrawer
        open={drawerOpen}
        visible={showNav}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Full-bleed hero: gate into dungeon */}
      <section className="relative min-h-dvh overflow-hidden dungeon-bg">
        <div className="absolute inset-0 cobblestone opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[var(--vassal-black)]" />

        {/* Depth corridor */}
        <div
          className="pointer-events-none absolute left-1/2 top-[18%] h-[55%] w-[min(72vw,520px)] -translate-x-1/2"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(80,20,24,0.35),transparent_70%)]" />
          <div className="absolute inset-x-[12%] top-[8%] bottom-[20%] border-x border-[color-mix(in_srgb,var(--vassal-stone)_80%,transparent)] opacity-40" />
        </div>

        {/* Wall lamps */}
        <Torch side="left" lit={lampsLit} />
        <Torch side="right" lit={lampsLit} />

        {/* Gate frame + doors */}
        <div className="absolute inset-0 z-20 flex items-stretch justify-center">
          <div className="relative h-full w-full max-w-5xl">
            {/* Arch / iron frame */}
            <div className="pointer-events-none absolute inset-x-[6%] top-[6%] bottom-0 border-[10px] border-b-0 border-[#2a1c18] gate-iron opacity-90 [border-radius:999px_999px_0_0/40%_40%_0_0] sm:inset-x-[10%]" />

            <div className="absolute inset-x-[8%] top-[12%] bottom-0 flex overflow-hidden sm:inset-x-[12%]">
              <div
                className={`gate-door relative h-full w-1/2 ${
                  gatesOpen ? "open-left" : ""
                }`}
              >
                <GateHardware />
              </div>
              <div
                className={`gate-door relative h-full w-1/2 ${
                  gatesOpen ? "open-right" : ""
                }`}
              >
                <GateHardware mirror />
              </div>
            </div>
          </div>
        </div>

        {/* Hero copy — brand first */}
        <div className="relative z-30 flex min-h-dvh flex-col items-center justify-end px-6 pb-16 pt-28 text-center sm:pb-20">
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.75rem,10vw,6rem)] font-bold tracking-[0.16em] text-[var(--vassal-cream)] drop-shadow-[0_6px_28px_rgba(0,0,0,0.85)]">
            VASSAL
          </h1>
          <p className="mt-4 max-w-lg font-[family-name:var(--font-body)] text-base italic leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_82%,transparent)] sm:text-lg">
            The social loyalty stronghold where creators crown their most
            faithful followers.
          </p>
          <a
            href="#realm"
            className="mt-8 inline-flex items-center gap-2 border border-[color-mix(in_srgb,var(--vassal-gold)_50%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_35%,transparent)] px-7 py-3 font-[family-name:var(--font-display)] text-xs tracking-[0.22em] uppercase text-[var(--vassal-cream)] transition hover:bg-[color-mix(in_srgb,var(--vassal-red)_55%,transparent)]"
          >
            Claim your fealty
          </a>
        </div>
      </section>

      {/* Info cards marquee */}
      <section
        id="realm"
        className="relative overflow-hidden border-t border-[color-mix(in_srgb,var(--vassal-red)_40%,transparent)] bg-[linear-gradient(180deg,#0c0607_0%,#14090b_50%,#070405_100%)] py-20 sm:py-28"
      >
        <div className="mx-auto mb-12 max-w-2xl px-6 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.12em] text-[var(--vassal-cream)] sm:text-4xl">
            How the Realm Works
          </h2>
          <p className="mt-4 font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
            Scroll to march the banners — loyalty, ranks, and rewards for your
            court.
          </p>
        </div>
        <InfoMarquee />
      </section>

      <footer className="border-t border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-6 py-10 text-center">
        <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.3em] uppercase text-[var(--vassal-blood)]">
          Vassal
        </p>
        <p className="mt-2 text-sm text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
          Social media loyalty, forged for the faithful.
        </p>
      </footer>
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
      ? "left-[4%] sm:left-[8%]"
      : "right-[4%] sm:right-[8%]";

  return (
    <div
      className={`pointer-events-none absolute top-[28%] z-10 ${position}`}
      aria-hidden
    >
      <div className={`lamp-glow absolute -left-16 -top-16 h-40 w-40 ${lit ? "lit" : ""}`} />
      <div className="relative flex flex-col items-center">
        <div
          className={`torch-flame h-10 w-6 rounded-[50%_50%_40%_40%] bg-gradient-to-t from-[var(--vassal-red)] via-[var(--vassal-ember)] to-[#ffe08a] ${
            lit ? "lit" : ""
          }`}
        />
        <div className="h-16 w-3 rounded-sm bg-gradient-to-b from-[#5a3a28] to-[#2a1810]" />
        <div className="mt-1 h-2 w-8 rounded-sm bg-[#3a281c]" />
      </div>
    </div>
  );
}

function GateHardware({ mirror = false }: { mirror?: boolean }) {
  return (
    <div
      className={`absolute inset-0 ${mirror ? "scale-x-[-1]" : ""}`}
      aria-hidden
    >
      <div className="absolute inset-y-[8%] left-[18%] w-px bg-[color-mix(in_srgb,var(--vassal-gold)_25%,transparent)]" />
      <div className="absolute inset-y-[8%] left-[40%] w-px bg-[color-mix(in_srgb,var(--vassal-gold)_20%,transparent)]" />
      <div className="absolute inset-y-[8%] left-[62%] w-px bg-[color-mix(in_srgb,var(--vassal-gold)_25%,transparent)]" />
      <div className="absolute left-[12%] top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border-2 border-[color-mix(in_srgb,var(--vassal-gold)_55%,#2a1c18)] bg-[#1a100e]" />
      <div className="absolute inset-x-[10%] top-[22%] h-px bg-black/40" />
      <div className="absolute inset-x-[10%] top-[48%] h-px bg-black/40" />
      <div className="absolute inset-x-[10%] top-[74%] h-px bg-black/40" />
    </div>
  );
}
