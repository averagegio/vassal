"use client";

import {
  FAN_FEATURES,
  FAN_PETITIONS,
  FAN_TIERS,
} from "../lib/features";
import { PetitionCourt } from "./PetitionCourt";
import { TenureLadder } from "./TenureLadder";

export function FanHoldingSection() {
  return (
    <section
      id="fan-holding"
      className="relative border-t border-[color-mix(in_srgb,var(--vassal-red)_35%,transparent)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(176,16,32,0.16),transparent_55%)]" aria-hidden />

      <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <header className="max-w-2xl">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            Fan court membership
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] text-[var(--vassal-cream)] sm:text-4xl">
            Landlords of the realm
          </h2>
          <p className="mt-4 font-[family-name:var(--font-body)] text-base italic leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_78%,transparent)]">
            Creators crown tenants—not subscribers. Tribute buys tenure,
            petitions earn seals, and the Steward keeps the court alive between
            your audience hours.
          </p>
        </header>

        <ol className="mt-14 grid gap-10 sm:grid-cols-2">
          {FAN_FEATURES.map((feature, i) => (
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
            title="Court petition board"
            subtitle="Seal asks from your tenants. Try Grant, Defer, or Deny."
            seed={FAN_PETITIONS}
            grantLabel="Grant"
          />
          <TenureLadder
            eyebrow="Tribute ladders"
            title="Plots in your holding"
            tiers={FAN_TIERS}
          />
        </div>

        <div className="mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <a
            href="#steward"
            className="inline-flex border border-[color-mix(in_srgb,var(--vassal-gold)_50%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-6 py-3 font-[family-name:var(--font-display)] text-xs tracking-[0.22em] uppercase text-[var(--vassal-cream)] transition hover:bg-[color-mix(in_srgb,var(--vassal-red)_50%,transparent)]"
          >
            Meet the Steward
          </a>
          <p className="font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
            Overlay Discord first—or open a thin realm page when you need gates.
          </p>
        </div>
      </div>
    </section>
  );
}
