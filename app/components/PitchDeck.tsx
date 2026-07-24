"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  ESTATE_EARNINGS,
  ESTATE_STEPS,
  FAN_EARNINGS,
  FAN_STEPS,
  MARKETING_SCALE,
  type EarningsRow,
  type PitchStep,
} from "../lib/pitch";
import { VassalLogo } from "./VassalLogo";

export function PitchDeck() {
  const [lens, setLens] = useState<"fan" | "estate">("fan");

  return (
    <div className="pitch-shell min-h-dvh text-[var(--vassal-cream)]">
      <header className="sticky top-0 z-40 border-b border-[color-mix(in_srgb,var(--vassal-red)_35%,transparent)] bg-[color-mix(in_srgb,var(--vassal-black)_92%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <VassalLogo size={34} />
            <span className="font-[family-name:var(--font-display)] text-sm tracking-[0.28em]">
              VASSAL
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <a
              href="#earnings"
              className="hidden font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)] transition hover:text-[var(--vassal-blood)] sm:inline"
            >
              Earnings
            </a>
            <a
              href="#scale"
              className="hidden font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)] transition hover:text-[var(--vassal-blood)] sm:inline"
            >
              Scale
            </a>
            <a
              href="#howto"
              className="hidden font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)] transition hover:text-[var(--vassal-blood)] md:inline"
            >
              How to
            </a>
            <Link
              href="/signup"
              className="border border-[color-mix(in_srgb,var(--vassal-gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_35%,transparent)] px-3 py-1.5 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase transition hover:bg-[color-mix(in_srgb,var(--vassal-red)_55%,transparent)]"
            >
              Join
            </Link>
          </nav>
        </div>
      </header>

      {/* 1. Title */}
      <section className="relative overflow-hidden border-b border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-5 py-20 sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute inset-0 pitch-ash" aria-hidden />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="pitch-fade font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.36em] uppercase text-[var(--vassal-gold)]">
            Pitch
          </p>
          <h1 className="pitch-fade pitch-delay-1 mt-5 font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,3.4rem)] font-semibold tracking-[0.28em] text-[var(--vassal-cream)]">
            VASSAL
          </h1>
          <p className="pitch-fade pitch-delay-2 mx-auto mt-5 max-w-xl font-[family-name:var(--font-body)] text-lg italic leading-snug text-[color-mix(in_srgb,var(--vassal-cream)_82%,transparent)]">
            AI landlords for fan courts and freeholds.
            Tenure beats access. Standing beats churn.
          </p>
          <p className="pitch-fade pitch-delay-3 mx-auto mt-6 max-w-lg font-[family-name:var(--font-display)] text-xs tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
            Patreon sells access. OnlyFans sells intimacy-at-scale.
            <span className="mt-2 block text-[var(--vassal-gold)]">
              Vassal sells a landlord you live under.
            </span>
          </p>
        </div>
      </section>

      {/* 2. Earnings */}
      <section
        id="earnings"
        className="border-b border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            Projected earnings
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] sm:text-4xl">
            Two seats. One Steward.
          </h2>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
            Conservative SaaS seats first. Tribute take-rate is upside—not required to clear year one.
          </p>

          <div className="mt-12 grid gap-12 lg:grid-cols-2">
            <EarningsBlock title="Fan Court" rows={FAN_EARNINGS} />
            <EarningsBlock title="Estate" rows={ESTATE_EARNINGS} />
          </div>

          <p className="mt-10 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_45%,transparent)]">
            Combined year-3 target: $25M+ ARR · gross margin ~75%+ on Steward seats
          </p>
        </div>
      </section>

      {/* 3. Scale marketing */}
      <section
        id="scale"
        className="border-b border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            Scale marketing
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] sm:text-4xl">
            Don&apos;t out-host the hosts
          </h2>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
            Sit on top of Discord, SMS, and short-stay. Win loyalty. Charge for tenure.
          </p>

          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {MARKETING_SCALE.map((step) => (
              <li key={step.n} className="feature-mark">
                <span className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.28em] uppercase text-[var(--vassal-blood)]">
                  {step.n}
                </span>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg tracking-[0.08em]">
                  {step.title}
                </h3>
                <p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-snug text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. How to use */}
      <section id="howto" className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            How to use
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] sm:text-4xl">
            Step by step
          </h2>

          <div className="mt-8 flex gap-2">
            <LensButton active={lens === "fan"} onClick={() => setLens("fan")}>
              Fan Court
            </LensButton>
            <LensButton
              active={lens === "estate"}
              onClick={() => setLens("estate")}
            >
              Estate
            </LensButton>
          </div>

          <div className="mt-10" key={lens}>
            <p className="pitch-fade font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_72%,transparent)]">
              {lens === "fan"
                ? "For creators who crown the faithful."
                : "For hosts and small landlords who stay present."}
            </p>
            <ol className="mt-8 flex flex-col">
              {(lens === "fan" ? FAN_STEPS : ESTATE_STEPS).map((step) => (
                <StepRow key={`${lens}-${step.n}`} step={step} />
              ))}
            </ol>
          </div>

          <div className="mt-16 flex flex-wrap items-center gap-4 border-t border-[color-mix(in_srgb,var(--vassal-gold)_22%,transparent)] pt-10">
            <Link
              href="/signup"
              className="inline-flex border border-[color-mix(in_srgb,var(--vassal-gold)_50%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_40%,transparent)] px-6 py-3 font-[family-name:var(--font-display)] text-xs tracking-[0.22em] uppercase transition hover:bg-[color-mix(in_srgb,var(--vassal-red)_55%,transparent)]"
            >
              Open a holding
            </Link>
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-xs tracking-[0.18em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_60%,transparent)] transition hover:text-[var(--vassal-blood)]"
            >
              Back to gate →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-5 py-10 text-center sm:px-8">
        <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.3em] uppercase text-[var(--vassal-blood)]">
          Vassal
        </p>
        <p className="mt-2 text-sm text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
          Loyalty for fan courts and freeholds.
        </p>
      </footer>
    </div>
  );
}

function EarningsBlock({
  title,
  rows,
}: {
  title: string;
  rows: EarningsRow[];
}) {
  return (
    <div>
      <h3 className="font-[family-name:var(--font-display)] text-xl tracking-[0.12em] text-[var(--vassal-cream)]">
        {title}
      </h3>
      <ul className="mt-6 flex flex-col">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-baseline justify-between gap-4 border-t border-[color-mix(in_srgb,var(--vassal-gold)_20%,transparent)] py-4"
          >
            <div>
              <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.08em]">
                {row.label}
              </p>
              <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                {row.note}
              </p>
            </div>
            <p className="shrink-0 font-[family-name:var(--font-display)] text-xl tracking-[0.06em] text-[var(--vassal-gold)]">
              {row.value}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepRow({ step }: { step: PitchStep }) {
  return (
    <li className="relative border-l border-[color-mix(in_srgb,var(--vassal-gold)_35%,transparent)] py-5 pl-6">
      <span
        className="absolute -left-[5px] top-7 h-2.5 w-2.5 rotate-45 bg-[var(--vassal-blood)]"
        aria-hidden
      />
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.28em] uppercase text-[var(--vassal-blood)]">
          {step.n}
        </span>
        <h3 className="font-[family-name:var(--font-display)] text-lg tracking-[0.08em]">
          {step.title}
        </h3>
      </div>
      <p className="mt-2 max-w-2xl font-[family-name:var(--font-body)] text-sm leading-snug text-[color-mix(in_srgb,var(--vassal-cream)_78%,transparent)]">
        {step.body}
      </p>
    </li>
  );
}

function LensButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-4 py-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.18em] uppercase transition ${
        active
          ? "border-[var(--vassal-blood)] bg-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] text-[var(--vassal-cream)]"
          : "border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)] hover:border-[var(--vassal-gold)]"
      }`}
    >
      {children}
    </button>
  );
}
