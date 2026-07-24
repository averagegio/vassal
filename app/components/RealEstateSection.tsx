"use client";

import {
  REAL_ESTATE_FEATURES,
  REAL_ESTATE_TIERS,
  RE_PETITIONS,
} from "../lib/features";
import { PetitionCourt } from "./PetitionCourt";
import { TenureLadder } from "./TenureLadder";

export function RealEstateSection() {
  return (
    <section
      id="estate-holding"
      className="relative border-t border-[color-mix(in_srgb,var(--vassal-red)_35%,transparent)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_10%,rgba(201,162,39,0.08),transparent_50%)]" aria-hidden />

      <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <header className="max-w-2xl">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            Real estate Steward
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] text-[var(--vassal-cream)] sm:text-4xl">
            Landlords of the freehold
          </h2>
          <p className="mt-4 font-[family-name:var(--font-body)] text-base italic leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_78%,transparent)]">
            Small owners and short-stay hosts stay present without becoming a
            full property suite. Rent stays on your rails—Vassal runs tenure,
            law, and the petition door.
          </p>
        </header>

        <ol className="mt-14 grid gap-10 sm:grid-cols-2">
          {REAL_ESTATE_FEATURES.map((feature, i) => (
            <li key={feature.id} className="feature-mark">
              <span className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.28em] uppercase text-[var(--vassal-blood)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg tracking-[0.08em] text-[var(--vassal-cream)]">
                {feature.title}
              </h3>
              <p className="mt-3 font-[family-name:var(--font-body)] text-sm leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
                {feature.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-20 grid items-start gap-14 lg:grid-cols-2">
          <PetitionCourt
            title="Repair & guest petitions"
            subtitle="Seal maintenance and house-law asks. Steward already sorted the noise."
            seed={RE_PETITIONS}
            grantLabel="Dispatch"
          />
          <TenureLadder
            eyebrow="Steward seats"
            title="Holdings for property"
            tiers={REAL_ESTATE_TIERS}
          />
        </div>

        <div className="mt-16 border-t border-[color-mix(in_srgb,var(--vassal-gold)_22%,transparent)] pt-10">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.28em] uppercase text-[var(--vassal-gold)]">
            Low barrier by design
          </p>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-body)] text-base leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_78%,transparent)]">
            No escrow, no brokerage, no AppFolio clone. Start with a Steward on
            SMS or your short-stay listing; standing and renewals come after the
            door is answered.
          </p>
        </div>
      </div>
    </section>
  );
}
