"use client";

import { useEffect, useState } from "react";
import { SideDrawer } from "./SideDrawer";
import { InfoCardStack } from "./InfoCardStack";
import { VassalLogo } from "./VassalLogo";

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
    // Hold sealed doors briefly so the closed gate reads, then open
    const gateTimer = window.setTimeout(() => setGatesOpen(true), 700);
    const lampTimer = window.setTimeout(() => setLampsLit(true), 3200);
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

        {/* Hero copy behind the gate — revealed as doors part */}
        <div className="relative z-10 flex min-h-dvh flex-col items-center justify-end px-6 pb-16 pt-28 text-center sm:pb-20">
          <VassalLogo size={72} className="mb-4 drop-shadow-[0_8px_24px_rgba(0,0,0,0.65)]" />
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,5.5vw,2.85rem)] font-semibold tracking-[0.38em] text-[var(--vassal-cream)] drop-shadow-[0_6px_28px_rgba(0,0,0,0.85)]">
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

        {/* Gate assembly — doors sit above hero copy until they open */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-stretch justify-center">
          <div className="relative h-full w-full max-w-5xl">
            <div className="absolute inset-x-[5%] top-[5%] bottom-0 border-[12px] border-b-0 border-[#3a2820] opacity-95 [border-radius:999px_999px_0_0/42%_42%_0_0] shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] sm:inset-x-[9%] sm:border-[14px]" />
            <div className="absolute inset-x-[5%] top-[5%] h-[14%] rounded-t-[999px] bg-gradient-to-b from-[#2a1c16] to-transparent opacity-80 sm:inset-x-[9%]" />

            <div className="absolute inset-x-[7%] top-[11%] bottom-0 overflow-hidden sm:inset-x-[11%]">
              <div
                className="gate-door absolute left-0 top-0 h-full w-1/2 border-r border-black/70"
                style={{
                  transform: gatesOpen
                    ? "translate3d(-105%, 0, 0)"
                    : "translate3d(0, 0, 0)",
                }}
              >
                <GateHardware />
              </div>
              <div
                className="gate-door absolute right-0 top-0 h-full w-1/2 border-l border-black/70"
                style={{
                  transform: gatesOpen
                    ? "translate3d(105%, 0, 0)"
                    : "translate3d(0, 0, 0)",
                }}
              >
                <GateHardware mirror />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="realm"
        className="relative overflow-hidden border-t border-[color-mix(in_srgb,var(--vassal-red)_40%,transparent)] bg-[linear-gradient(180deg,#0c0607_0%,#14090b_40%,#070405_100%)]"
      >
        <InfoCardStack />
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

function GateHardware({ mirror = false }: { mirror?: boolean }) {
  return (
    <div
      className={`absolute inset-0 ${mirror ? "scale-x-[-1]" : ""}`}
      aria-hidden
    >
      {/* Vertical planks highlight */}
      <div className="absolute inset-y-0 left-0 w-full bg-[repeating-linear-gradient(90deg,#1a0e0a_0px,#3d241c_10px,#241510_20px,#4a2c22_30px,#1a0e0a_40px)] opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />

      {/* Iron straps */}
      <div className="absolute inset-x-0 top-[18%] h-4 bg-gradient-to-b from-[#6a5648] via-[#2a2018] to-[#6a5648] shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
      <div className="absolute inset-x-0 top-[48%] h-4 bg-gradient-to-b from-[#6a5648] via-[#2a2018] to-[#6a5648] shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
      <div className="absolute inset-x-0 top-[78%] h-4 bg-gradient-to-b from-[#6a5648] via-[#2a2018] to-[#6a5648] shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />

      {/* Rivets */}
      {[18, 48, 78].map((top) =>
        [12, 35, 58, 82].map((left) => (
          <span
            key={`${top}-${left}`}
            className="absolute h-2 w-2 rounded-full bg-[#8a7868]"
            style={{ top: `${top + 1}%`, left: `${left}%` }}
          />
        )),
      )}

      {/* Ring pull */}
      <div className="absolute left-[22%] top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border-[3px] border-[#8a7868] bg-[#1a100e] shadow-[inset_0_0_8px_rgba(0,0,0,0.8)]" />
      <div className="absolute left-[28%] top-[58%] h-5 w-1.5 rounded-full bg-[#6a5648]" />
    </div>
  );
}
