"use client";

import { FAN_FEATURES, FAN_TIERS } from "../lib/features";
import { LexiconTerm } from "./Lexicon";
import { TenureLadder } from "./TenureLadder";

export function FanHoldingSection() {
  return (
    <section
      id="fan-holding"
      className="relative border-t border-[color-mix(in_srgb,var(--vassal-red)_35%,transparent)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(176,16,32,0.16),transparent_55%)]" aria-hidden />

      <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <header data-tour="fan" className="max-w-xl">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            <LexiconTerm id="fan-court">Fan Court</LexiconTerm>
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] text-[var(--vassal-cream)] sm:text-4xl">
            Loyalty that stays home
          </h2>
          <p className="mt-3 font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_78%,transparent)]">
            Fans speak in your community hall, climb ranks, and send requests —
            engagement that grows Fan Court, not X.
          </p>
        </header>

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FAN_FEATURES.map((feature, i) => (
            <li key={feature.id} className="feature-mark">
              <span className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.28em] uppercase text-[var(--vassal-blood)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg tracking-[0.08em] text-[var(--vassal-cream)]">
                {feature.title}
              </h3>
              <p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-snug text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
                {feature.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-16 max-w-lg">
          <TenureLadder
            eyebrow="Paid tiers"
            title="Membership levels"
            tiers={FAN_TIERS}
          />
        </div>

        <div className="mt-12">
          <a
            href="/signup"
            className="inline-flex border border-[color-mix(in_srgb,var(--vassal-gold)_50%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-6 py-3 font-[family-name:var(--font-display)] text-xs tracking-[0.22em] uppercase text-[var(--vassal-cream)] transition hover:bg-[color-mix(in_srgb,var(--vassal-red)_50%,transparent)]"
          >
            Start a fan court
          </a>
        </div>
      </div>
    </section>
  );
}
