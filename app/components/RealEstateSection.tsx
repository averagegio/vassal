"use client";

import { REAL_ESTATE_FEATURES, REAL_ESTATE_TIERS } from "../lib/features";
import { LexiconTerm } from "./Lexicon";
import { TenureLadder } from "./TenureLadder";

export function RealEstateSection() {
  return (
    <section
      id="estate-holding"
      className="relative border-t border-[color-mix(in_srgb,var(--vassal-red)_35%,transparent)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_10%,rgba(201,162,39,0.08),transparent_50%)]" aria-hidden />

      <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <header data-tour="estate" className="max-w-xl">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            <LexiconTerm id="estate">Estate</LexiconTerm>
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] text-[var(--vassal-cream)] sm:text-4xl">
            AI front desk for your doors
          </h2>
          <p className="mt-3 font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_78%,transparent)]">
            House rules, repair requests, and renewals — with less inbox noise.
          </p>
        </header>

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {REAL_ESTATE_FEATURES.map((feature, i) => (
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
            eyebrow="Plans"
            title="Estate sizes"
            tiers={REAL_ESTATE_TIERS}
          />
        </div>

        <div className="mt-12">
          <a
            href="/signup"
            className="inline-flex border border-[color-mix(in_srgb,var(--vassal-gold)_50%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-6 py-3 font-[family-name:var(--font-display)] text-xs tracking-[0.22em] uppercase text-[var(--vassal-cream)] transition hover:bg-[color-mix(in_srgb,var(--vassal-red)_50%,transparent)]"
          >
            Start an estate
          </a>
        </div>
      </div>
    </section>
  );
}
