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

        {/* Gate assembly — lattice metal halves sit above hero until they open */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-stretch justify-center">
          <div className="relative h-full w-full max-w-5xl">
            <div className="absolute inset-x-[5%] top-[5%] bottom-0 border-[12px] border-b-0 border-[#4a4540] opacity-95 [border-radius:999px_999px_0_0/42%_42%_0_0] shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] sm:inset-x-[9%] sm:border-[14px]" />
            <div className="absolute inset-x-[5%] top-[5%] h-[14%] rounded-t-[999px] bg-gradient-to-b from-[#3a3530] to-transparent opacity-80 sm:inset-x-[9%]" />

            <div className="absolute inset-x-[7%] top-[11%] bottom-0 overflow-hidden sm:inset-x-[11%]">
              <div
                className="gate-door absolute left-0 top-0 h-full w-1/2"
                style={{
                  transform: gatesOpen
                    ? "translate3d(-105%, 0, 0)"
                    : "translate3d(0, 0, 0)",
                }}
              >
                <LatticeGateHalf side="left" />
              </div>
              <div
                className="gate-door absolute right-0 top-0 h-full w-1/2"
                style={{
                  transform: gatesOpen
                    ? "translate3d(105%, 0, 0)"
                    : "translate3d(0, 0, 0)",
                }}
              >
                <LatticeGateHalf side="right" />
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

function LatticeGateHalf({ side }: { side: "left" | "right" }) {
  const edge =
    side === "left"
      ? "border-r border-[#8a8580]/60"
      : "border-l border-[#8a8580]/60";

  return (
    <div className={`absolute inset-0 ${edge}`} aria-hidden>
      {/* Metal lattice mesh */}
      <div
        className="absolute inset-0 opacity-95"
        style={{
          backgroundColor: "rgba(18, 16, 14, 0.55)",
          backgroundImage: `
            linear-gradient(45deg, #6a6560 1.5px, transparent 1.5px),
            linear-gradient(-45deg, #6a6560 1.5px, transparent 1.5px),
            linear-gradient(45deg, transparent 48%, #3a3834 49%, #8a8580 50%, #3a3834 51%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, #3a3834 49%, #8a8580 50%, #3a3834 51%, transparent 52%)
          `,
          backgroundSize: "28px 28px, 28px 28px, 56px 56px, 56px 56px",
          backgroundPosition: "0 0, 0 0, 0 0, 0 0",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.65)",
        }}
      />

      {/* Vertical iron bars */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 18px, rgba(140,136,130,0.55) 18px 21px, transparent 21px 38px)",
        }}
      />

      {/* Horizontal braces */}
      <div className="absolute inset-x-0 top-[16%] h-[5px] bg-gradient-to-b from-[#9a9690] via-[#4a4844] to-[#9a9690] shadow-[0_2px_6px_rgba(0,0,0,0.7)]" />
      <div className="absolute inset-x-0 top-[48%] h-[6px] bg-gradient-to-b from-[#9a9690] via-[#4a4844] to-[#9a9690] shadow-[0_2px_6px_rgba(0,0,0,0.7)]" />
      <div className="absolute inset-x-0 top-[80%] h-[5px] bg-gradient-to-b from-[#9a9690] via-[#4a4844] to-[#9a9690] shadow-[0_2px_6px_rgba(0,0,0,0.7)]" />

      {/* Speartip tops */}
      <div
        className="absolute inset-x-[6%] top-[2%] h-10 opacity-90"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 14px, #8a8580 14px 18px, transparent 18px 32px)",
          clipPath: "polygon(0 100%, 0 35%, 3% 0, 6% 35%, 6% 100%, 100% 100%)",
        }}
      />

      {/* Center lock plate on meeting edge */}
      {side === "left" ? (
        <div className="absolute right-2 top-1/2 h-16 w-10 -translate-y-1/2 rounded-sm border border-[#9a9690] bg-gradient-to-b from-[#5a5854] to-[#2a2826] shadow-[inset_0_0_8px_rgba(0,0,0,0.7)]">
          <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#c0bbb4]" />
        </div>
      ) : (
        <div className="absolute left-2 top-1/2 h-16 w-10 -translate-y-1/2 rounded-sm border border-[#9a9690] bg-gradient-to-b from-[#5a5854] to-[#2a2826] shadow-[inset_0_0_8px_rgba(0,0,0,0.7)]">
          <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#c0bbb4]" />
        </div>
      )}
    </div>
  );
}
