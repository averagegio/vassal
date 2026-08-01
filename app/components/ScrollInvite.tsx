import Link from "next/link";
import type { ScrollPublic } from "../lib/scroll-types";
import { VassalLogo } from "./VassalLogo";

type ScrollInviteProps = {
  scroll: ScrollPublic;
  /** When true, show CTAs for joining / opening a hall. */
  interactive?: boolean;
};

export function ScrollInvite({
  scroll,
  interactive = true,
}: ScrollInviteProps) {
  const isVassal = scroll.kind === "vassal";
  const ctaHref = isVassal
    ? scroll.court
      ? `/signup?court=${encodeURIComponent(scroll.court.slug)}&holding=fan`
      : "/signup?holding=fan"
    : "/signup?holding=fan";
  const ctaLabel = isVassal ? "Swear fealty" : "Open a hall as Lord";
  const secondaryHref = isVassal
    ? scroll.court
      ? `/hall/${encodeURIComponent(scroll.court.slug)}`
      : "/login"
    : "/login";
  const secondaryLabel = isVassal ? "View the hall" : "Already sworn? Enter";

  return (
    <div className="scroll-page">
      <div className="scroll-page-glow" aria-hidden />
      <div className="relative mx-auto flex min-h-dvh max-w-xl flex-col px-4 py-10">
        <Link href="/" className="mb-8 flex items-center gap-2 self-start">
          <VassalLogo size={28} />
          <span className="font-[family-name:var(--font-display)] text-xs tracking-[0.24em] text-[var(--vassal-cream)]">
            VASSAL
          </span>
        </Link>

        <article className="parchment-scroll parchment-unfurl">
          <div className="parchment-roll parchment-roll-top" aria-hidden />
          <div className="parchment-inner">
            <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.28em] uppercase text-[color-mix(in_srgb,#5c3a1e_80%,#1a120c)]">
              {isVassal ? "Vassal summons" : "Lord nomination"}
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight tracking-[0.04em] text-[#2a1a10]">
              {scroll.title}
            </h1>
            {scroll.court ? (
              <p className="mt-2 font-[family-name:var(--font-display)] text-xs tracking-[0.16em] uppercase text-[color-mix(in_srgb,#5c3a1e_75%,transparent)]">
                {scroll.court.name}
                {scroll.court.tagline ? ` · ${scroll.court.tagline}` : ""}
              </p>
            ) : null}
            <p className="mt-8 font-[family-name:var(--font-body)] text-lg italic text-[#3a2414]">
              {scroll.greeting}
            </p>
            <p className="mt-5 whitespace-pre-wrap font-[family-name:var(--font-body)] text-base leading-relaxed text-[#2c1c12]">
              {scroll.body}
            </p>
            <p className="mt-8 font-[family-name:var(--font-body)] text-base italic text-[#3a2414]">
              {scroll.signOff}
            </p>
            <p className="mt-6 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase text-[color-mix(in_srgb,#5c3a1e_65%,transparent)]">
              Sealed by {scroll.author.name}
              {scroll.author.xUsername ? ` · @${scroll.author.xUsername}` : ""}
            </p>
          </div>
          <div className="parchment-roll parchment-roll-bottom" aria-hidden />
        </article>

        {interactive ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center border border-[color-mix(in_srgb,var(--vassal-gold)_50%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_40%,transparent)] px-5 py-3 font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.18em] uppercase text-[var(--vassal-cream)] transition hover:bg-[color-mix(in_srgb,var(--vassal-red)_55%,transparent)]"
            >
              {ctaLabel}
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center border border-[color-mix(in_srgb,var(--vassal-gold)_35%,transparent)] px-5 py-3 font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.18em] uppercase text-[var(--vassal-cream)]"
            >
              {secondaryLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
