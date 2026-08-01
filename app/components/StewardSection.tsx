"use client";

import { SHARED_STEWARD } from "../lib/features";
import { LexiconTerm } from "./Lexicon";

export function StewardSection() {
  return (
    <section
      id="steward"
      className="relative overflow-hidden border-t border-[color-mix(in_srgb,var(--vassal-red)_40%,transparent)]"
    >
      <div className="steward-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <header data-tour="steward" className="mx-auto max-w-xl text-center">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            Shared
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.12em] text-[var(--vassal-cream)] sm:text-4xl">
            AI <LexiconTerm id="steward">Steward</LexiconTerm>
          </h2>
          <p className="mt-3 font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_78%,transparent)]">
            Your assistant keeps things moving when you step away.
          </p>
        </header>

        <ul className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-3">
          {SHARED_STEWARD.map((item) => (
            <li key={item.id} className="text-center sm:text-left">
              <span className="mx-auto mb-3 block h-2 w-2 rotate-45 bg-[var(--vassal-blood)] sm:mx-0" />
              <h3 className="font-[family-name:var(--font-display)] text-base tracking-[0.08em] text-[var(--vassal-cream)]">
                {item.title}
              </h3>
              <p className="mt-2 font-[family-name:var(--font-body)] text-sm text-[color-mix(in_srgb,var(--vassal-cream)_72%,transparent)]">
                {item.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-12 max-w-lg text-center">
          <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.1em] text-[var(--vassal-cream)]">
            Easy to join. Status is earned.
          </p>
          <a
            href="/signup"
            className="mt-6 inline-flex border border-[color-mix(in_srgb,var(--vassal-gold)_50%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_35%,transparent)] px-6 py-3 font-[family-name:var(--font-display)] text-xs tracking-[0.22em] uppercase text-[var(--vassal-cream)] transition hover:bg-[color-mix(in_srgb,var(--vassal-red)_55%,transparent)]"
          >
            Join Vassal
          </a>
        </div>
      </div>
    </section>
  );
}
