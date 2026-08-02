"use client";

import { useId } from "react";
import type { HallTheme } from "../lib/ranks";

/** Compact heraldic mark for each hall theme swatch. */
export function ThemeHerald({
  theme,
  className = "",
}: {
  theme: HallTheme;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      {theme === "crimson" ? <CrimsonMark uid={uid} /> : null}
      {theme === "midnight" ? <MidnightMark uid={uid} /> : null}
      {theme === "goldleaf" ? <GoldleafMark uid={uid} /> : null}
      {theme === "neon" ? <EmberMark uid={uid} /> : null}
      {theme === "atelier" ? <ParchmentMark uid={uid} /> : null}
      {theme === "frost" ? <FrostMark uid={uid} /> : null}
      {theme === "verdant" ? <VerdantMark uid={uid} /> : null}
      {theme === "slate" ? <SlateMark uid={uid} /> : null}
    </svg>
  );
}

function Shield({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <path
      d="M32 6 C42 9 52 11 56 12 V30 C56 44 46 54 32 60 C18 54 8 44 8 30 V12 C12 11 22 9 32 6Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
    />
  );
}

function CrimsonMark({ uid }: { uid: string }) {
  const fill = `h-crimson-${uid}`;
  return (
    <>
      <Shield fill={`url(#${fill})`} stroke="rgba(201,162,39,0.85)" />
      <path
        d="M24 28h16M32 22v18M22 24h20"
        stroke="rgba(243,230,216,0.9)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="32" cy="22" r="3" fill="#c9a227" />
      <defs>
        <linearGradient id={fill} x1="32" y1="6" x2="32" y2="60">
          <stop stopColor="#9a1424" />
          <stop offset="1" stopColor="#2a060c" />
        </linearGradient>
      </defs>
    </>
  );
}

function MidnightMark({ uid }: { uid: string }) {
  const fill = `h-midnight-${uid}`;
  return (
    <>
      <Shield fill={`url(#${fill})`} stroke="rgba(160,190,240,0.7)" />
      <path
        d="M22 44 V28 H28 V22 H36 V28 H42 V44 Z"
        fill="rgba(200,220,255,0.2)"
        stroke="rgba(200,220,255,0.75)"
        strokeWidth="1.4"
      />
      <path d="M28 44 V36 H36 V44" stroke="rgba(200,220,255,0.55)" strokeWidth="1.2" />
      <circle cx="44" cy="18" r="4.5" fill="rgba(230,240,255,0.85)" />
      <defs>
        <linearGradient id={fill} x1="32" y1="6" x2="32" y2="60">
          <stop stopColor="#2a4578" />
          <stop offset="1" stopColor="#070912" />
        </linearGradient>
      </defs>
    </>
  );
}

function GoldleafMark({ uid }: { uid: string }) {
  const fill = `h-goldleaf-${uid}`;
  return (
    <>
      <Shield fill={`url(#${fill})`} stroke="rgba(243,220,150,0.9)" />
      <path
        d="M32 18 C26 26 22 32 22 38 C22 44 26 48 32 48 C38 48 42 44 42 38 C42 32 38 26 32 18Z"
        fill="rgba(201,162,39,0.95)"
        stroke="rgba(243,230,180,0.8)"
        strokeWidth="1.2"
      />
      <path
        d="M32 28 V48 M28 34 C30 36 34 36 36 34"
        stroke="rgba(60,40,10,0.65)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id={fill} x1="32" y1="6" x2="32" y2="60">
          <stop stopColor="#8a7020" />
          <stop offset="1" stopColor="#1a1406" />
        </linearGradient>
      </defs>
    </>
  );
}

function EmberMark({ uid }: { uid: string }) {
  const fill = `h-ember-${uid}`;
  const flame = `h-ember-flame-${uid}`;
  return (
    <>
      <Shield fill={`url(#${fill})`} stroke="rgba(255,140,80,0.75)" />
      <path
        d="M32 48 C24 42 22 34 26 28 C28 32 32 34 32 34 C32 34 34 28 38 24 C42 32 40 42 32 48Z"
        fill={`url(#${flame})`}
        stroke="rgba(255,200,140,0.7)"
        strokeWidth="1.1"
      />
      <defs>
        <linearGradient id={fill} x1="32" y1="6" x2="32" y2="60">
          <stop stopColor="#7a1020" />
          <stop offset="0.55" stopColor="#3a0a18" />
          <stop offset="1" stopColor="#14040a" />
        </linearGradient>
        <linearGradient id={flame} x1="32" y1="24" x2="32" y2="48">
          <stop stopColor="#ffb060" />
          <stop offset="0.5" stopColor="#e11d2e" />
          <stop offset="1" stopColor="#6a0818" />
        </linearGradient>
      </defs>
    </>
  );
}

function ParchmentMark({ uid }: { uid: string }) {
  const fill = `h-parchment-${uid}`;
  return (
    <>
      <rect
        x="14"
        y="12"
        width="36"
        height="42"
        rx="2"
        fill={`url(#${fill})`}
        stroke="rgba(201,162,39,0.55)"
        strokeWidth="1.4"
      />
      <path
        d="M22 22h20M22 30h16M22 38h18M22 46h12"
        stroke="rgba(80,50,30,0.45)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 16c4 2 8-2 12 0s8-2 12 0 8-2 12 0"
        stroke="rgba(120,80,40,0.35)"
        strokeWidth="1"
        fill="none"
      />
      <defs>
        <linearGradient id={fill} x1="32" y1="12" x2="32" y2="54">
          <stop stopColor="#f0e2d0" />
          <stop offset="1" stopColor="#c4a888" />
        </linearGradient>
      </defs>
    </>
  );
}

function FrostMark({ uid }: { uid: string }) {
  const fill = `h-frost-${uid}`;
  return (
    <>
      <Shield fill={`url(#${fill})`} stroke="rgba(180,210,240,0.8)" />
      <path
        d="M32 16 V48 M20 32 H44 M24 22 L40 42 M40 22 L24 42"
        stroke="rgba(220,235,255,0.9)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="3.5" fill="rgba(220,235,255,0.85)" />
      <defs>
        <linearGradient id={fill} x1="32" y1="6" x2="32" y2="60">
          <stop stopColor="#6a90b8" />
          <stop offset="1" stopColor="#0a1018" />
        </linearGradient>
      </defs>
    </>
  );
}

function VerdantMark({ uid }: { uid: string }) {
  const fill = `h-verdant-${uid}`;
  return (
    <>
      <Shield fill={`url(#${fill})`} stroke="rgba(140,190,120,0.7)" />
      <path
        d="M32 46 V28"
        stroke="rgba(180,210,140,0.85)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M32 34 C24 30 20 24 22 18 C28 20 32 26 32 34Z"
        fill="rgba(80,150,90,0.95)"
      />
      <path
        d="M32 30 C40 26 44 20 42 14 C36 16 32 22 32 30Z"
        fill="rgba(110,180,100,0.95)"
      />
      <defs>
        <linearGradient id={fill} x1="32" y1="6" x2="32" y2="60">
          <stop stopColor="#1e5a36" />
          <stop offset="1" stopColor="#061208" />
        </linearGradient>
      </defs>
    </>
  );
}

function SlateMark({ uid }: { uid: string }) {
  const fill = `h-slate-${uid}`;
  return (
    <>
      <Shield fill={`url(#${fill})`} stroke="rgba(170,180,195,0.7)" />
      <path
        d="M18 40 H46 V44 H18Z M22 32 H42 V40 H22Z M26 24 H38 V32 H26Z M30 18 H34 V24 H30Z"
        fill="rgba(190,200,215,0.35)"
        stroke="rgba(190,200,215,0.8)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id={fill} x1="32" y1="6" x2="32" y2="60">
          <stop stopColor="#4a5260" />
          <stop offset="1" stopColor="#101218" />
        </linearGradient>
      </defs>
    </>
  );
}
