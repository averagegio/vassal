"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  ESTATE_EARNINGS,
  ESTATE_STEPS,
  FAN_EARNINGS,
  FAN_STEPS,
  FUNDING_ROUNDS,
  GROWTH_PLAN,
  MARKET,
  REVENUE_YEARS,
  SITE_FLOW,
  STEWARD_CATCH,
  type FundingRound,
  type MetricRow,
  type PitchStep,
  type RevenueYear,
} from "../lib/pitch";
import { LANDING_HREF } from "../lib/home";
import { VassalLogo } from "./VassalLogo";

export function PitchDeck() {
  const [lens, setLens] = useState<"fan" | "estate">("fan");

  return (
    <div className="pitch-shell min-h-dvh text-[var(--vassal-cream)]">
      <header className="sticky top-0 z-40 border-b border-[color-mix(in_srgb,var(--vassal-red)_35%,transparent)] bg-[color-mix(in_srgb,var(--vassal-black)_92%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link href={LANDING_HREF} className="flex items-center gap-3">
            <VassalLogo size={34} />
            <span className="font-[family-name:var(--font-display)] text-sm tracking-[0.28em]">
              VASSAL
            </span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 sm:gap-x-4">
            {[
              ["#catch", "Catch"],
              ["#flow", "Flow"],
              ["#market", "TAM"],
              ["#revenue", "Revenue"],
              ["#funding", "Funding"],
              ["#growth", "Growth"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="hidden font-[family-name:var(--font-display)] text-[0.58rem] tracking-[0.16em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)] transition hover:text-[var(--vassal-blood)] md:inline"
              >
                {label}
              </a>
            ))}
            <Link
              href="/demo/cast"
              className="hidden font-[family-name:var(--font-display)] text-[0.58rem] tracking-[0.16em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)] transition hover:text-[var(--vassal-blood)] md:inline"
            >
              Cast
            </Link>
            <Link
              href="/signup"
              className="border border-[color-mix(in_srgb,var(--vassal-gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_35%,transparent)] px-3 py-1.5 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase transition hover:bg-[color-mix(in_srgb,var(--vassal-red)_55%,transparent)]"
            >
              Join
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero — brand first */}
      <section className="relative overflow-hidden border-b border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-5 py-20 sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute inset-0 pitch-ash" aria-hidden />
        <div className="relative mx-auto max-w-3xl text-center">
          <VassalLogo
            size={72}
            className="pitch-fade mx-auto mb-5 drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
          />
          <h1 className="pitch-fade pitch-delay-1 font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,3.4rem)] font-semibold tracking-[0.28em] text-[var(--vassal-cream)]">
            VASSAL
          </h1>
          <p className="pitch-fade pitch-delay-2 mx-auto mt-5 max-w-xl font-[family-name:var(--font-body)] text-lg italic leading-snug text-[color-mix(in_srgb,var(--vassal-cream)_82%,transparent)]">
            Pitch — AI Steward for creator courts and freeholds.
          </p>
          <p className="pitch-fade pitch-delay-3 mx-auto mt-6 max-w-lg font-[family-name:var(--font-display)] text-xs tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
            Tenure beats access. Standing beats churn.
          </p>
        </div>
      </section>

      {/* Steward catch */}
      <section
        id="catch"
        className="border-b border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            {STEWARD_CATCH.eyebrow}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] sm:text-4xl">
            {STEWARD_CATCH.title}
          </h2>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
            {STEWARD_CATCH.lead}
          </p>

          <div className="mt-12 grid gap-12 lg:grid-cols-2">
            <CatchBlock
              title={STEWARD_CATCH.fan.title}
              plain={STEWARD_CATCH.fan.plain}
              catchLine={STEWARD_CATCH.fan.catch}
              steward={STEWARD_CATCH.fan.steward}
            />
            <CatchBlock
              title={STEWARD_CATCH.freehold.title}
              plain={STEWARD_CATCH.freehold.plain}
              catchLine={STEWARD_CATCH.freehold.catch}
              steward={STEWARD_CATCH.freehold.steward}
            />
          </div>
        </div>
      </section>

      {/* Site flow */}
      <section
        id="flow"
        className="border-b border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            Product flow
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] sm:text-4xl">
            How the site moves
          </h2>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
            From the gate to the loyalty loop — one path for creators, one for doors.
          </p>
          <ol className="mt-10 flex flex-col">
            {SITE_FLOW.map((step) => (
              <StepRow key={step.n} step={step} />
            ))}
          </ol>
        </div>
      </section>

      {/* TAM */}
      <section
        id="market"
        className="border-b border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            Market
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] sm:text-4xl">
            TAM · SAM · SOM
          </h2>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
            Illustrative sizing — creator membership tooling plus short-stay / small-landlord software.
          </p>
          <MetricList rows={MARKET} />
        </div>
      </section>

      {/* Revenue */}
      <section
        id="revenue"
        className="border-b border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            Projected revenue
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] sm:text-4xl">
            MRR &amp; ARR
          </h2>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
            Conservative SaaS seats first. Tribute take-rate is upside — not required for year one.
          </p>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)]">
                  <th className="py-3 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.2em] uppercase text-[var(--vassal-gold)]">
                    Year
                  </th>
                  <th className="py-3 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.2em] uppercase text-[var(--vassal-gold)]">
                    MRR
                  </th>
                  <th className="py-3 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.2em] uppercase text-[var(--vassal-gold)]">
                    ARR
                  </th>
                  <th className="hidden py-3 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.2em] uppercase text-[var(--vassal-gold)] sm:table-cell">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {REVENUE_YEARS.map((row) => (
                  <RevenueRow key={row.year} row={row} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-2">
            <EarningsBlock title="Fan Court" rows={FAN_EARNINGS} />
            <EarningsBlock title="Estate / Freehold" rows={ESTATE_EARNINGS} />
          </div>
        </div>
      </section>

      {/* Funding */}
      <section
        id="funding"
        className="border-b border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            Capital path
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] sm:text-4xl">
            Pre-seed → Series M
          </h2>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
            Raise against retention proof, then growth loops — not vanity downloads.
          </p>
          <ol className="mt-10 flex flex-col">
            {FUNDING_ROUNDS.map((round, i) => (
              <FundingRow
                key={round.stage}
                round={round}
                index={String(i + 1).padStart(2, "0")}
              />
            ))}
          </ol>
        </div>
      </section>

      {/* Growth */}
      <section
        id="growth"
        className="border-b border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            Retention
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] sm:text-4xl">
            Growth plan for recurring users
          </h2>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
            Recurring revenue needs ritual — standing, seasons, and early churn defense.
          </p>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {GROWTH_PLAN.map((step) => (
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

      {/* How to */}
      <section id="howto" className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            Operator path
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
              href={LANDING_HREF}
              className="font-[family-name:var(--font-display)] text-xs tracking-[0.18em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_60%,transparent)] transition hover:text-[var(--vassal-blood)]"
            >
              Back to gate →
            </Link>
          </div>
          <p className="mt-6 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_40%,transparent)]">
            Figures are directional projections for discussion — not audited forecasts.
          </p>
        </div>
      </section>

      <footer className="border-t border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-5 py-10 text-center sm:px-8">
        <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.3em] uppercase text-[var(--vassal-blood)]">
          Vassal
        </p>
        <p className="mt-2 text-sm text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
          Creators. Rentals. One Steward.
        </p>
      </footer>
    </div>
  );
}

function CatchBlock({
  title,
  plain,
  catchLine,
  steward,
}: {
  title: string;
  plain: string;
  catchLine: string;
  steward: string;
}) {
  return (
    <div className="border-t border-[color-mix(in_srgb,var(--vassal-gold)_22%,transparent)] pt-6">
      <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.22em] uppercase text-[var(--vassal-gold)]">
        {plain}
      </p>
      <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl tracking-[0.1em]">
        {title}
      </h3>
      <p className="mt-3 font-[family-name:var(--font-body)] text-sm leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_80%,transparent)]">
        {catchLine}
      </p>
      <p className="mt-4 font-[family-name:var(--font-body)] text-sm italic leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
        Steward: {steward}
      </p>
    </div>
  );
}

function MetricList({ rows }: { rows: MetricRow[] }) {
  return (
    <ul className="mt-10 flex flex-col">
      {rows.map((row) => (
        <li
          key={row.label}
          className="flex flex-col gap-1 border-t border-[color-mix(in_srgb,var(--vassal-gold)_20%,transparent)] py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
        >
          <div>
            <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.12em] uppercase">
              {row.label}
            </p>
            <p className="mt-1 max-w-xl font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
              {row.note}
            </p>
          </div>
          <p className="shrink-0 font-[family-name:var(--font-display)] text-2xl tracking-[0.06em] text-[var(--vassal-gold)]">
            {row.value}
          </p>
        </li>
      ))}
    </ul>
  );
}

function RevenueRow({ row }: { row: RevenueYear }) {
  return (
    <tr className="border-b border-[color-mix(in_srgb,var(--vassal-gold)_14%,transparent)]">
      <td className="py-4 font-[family-name:var(--font-display)] text-sm tracking-[0.12em]">
        {row.year}
      </td>
      <td className="py-4 font-[family-name:var(--font-display)] text-lg tracking-[0.06em] text-[var(--vassal-gold)]">
        {row.mrr}
      </td>
      <td className="py-4 font-[family-name:var(--font-display)] text-lg tracking-[0.06em] text-[var(--vassal-cream)]">
        {row.arr}
      </td>
      <td className="hidden py-4 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)] sm:table-cell">
        {row.note}
      </td>
    </tr>
  );
}

function FundingRow({
  round,
  index,
}: {
  round: FundingRound;
  index: string;
}) {
  return (
    <li className="relative border-l border-[color-mix(in_srgb,var(--vassal-gold)_35%,transparent)] py-5 pl-6">
      <span
        className="absolute -left-[5px] top-7 h-2.5 w-2.5 rotate-45 bg-[var(--vassal-blood)]"
        aria-hidden
      />
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.28em] uppercase text-[var(--vassal-blood)]">
            {index}
          </span>
          <h3 className="font-[family-name:var(--font-display)] text-lg tracking-[0.08em]">
            {round.stage}
          </h3>
        </div>
        <p className="font-[family-name:var(--font-display)] text-xl tracking-[0.06em] text-[var(--vassal-gold)]">
          {round.raise}
        </p>
      </div>
      <p className="mt-2 max-w-2xl font-[family-name:var(--font-body)] text-sm leading-snug text-[color-mix(in_srgb,var(--vassal-cream)_78%,transparent)]">
        {round.use}
      </p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_50%,transparent)]">
        Milestone — {round.milestone}
      </p>
    </li>
  );
}

function EarningsBlock({
  title,
  rows,
}: {
  title: string;
  rows: MetricRow[];
}) {
  return (
    <div>
      <h3 className="font-[family-name:var(--font-display)] text-xl tracking-[0.12em]">
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
