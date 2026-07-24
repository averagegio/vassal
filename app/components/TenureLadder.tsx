import type { TenureTier } from "../lib/features";

type TenureLadderProps = {
  eyebrow: string;
  title: string;
  tiers: TenureTier[];
};

export function TenureLadder({ eyebrow, title, tiers }: TenureLadderProps) {
  return (
    <div className="w-full max-w-lg">
      <div className="mb-6 text-center sm:text-left">
        <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.28em] uppercase text-[var(--vassal-gold)]">
          {eyebrow}
        </p>
        <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl tracking-[0.1em] text-[var(--vassal-cream)]">
          {title}
        </h3>
      </div>

      <ol className="flex flex-col">
        {tiers.map((tier, i) => (
          <li
            key={tier.id}
            className="tenure-rung relative border-l border-[color-mix(in_srgb,var(--vassal-gold)_35%,transparent)] py-5 pl-6"
          >
            <span
              className="absolute -left-[5px] top-7 h-2.5 w-2.5 rotate-45 bg-[var(--vassal-blood)]"
              aria-hidden
            />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="font-[family-name:var(--font-display)] text-base tracking-[0.08em] text-[var(--vassal-cream)]">
                {tier.name}
              </h4>
              <span className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.2em] uppercase text-[var(--vassal-gold)]">
                {tier.rent}
              </span>
            </div>
            <p className="mt-2 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)]">
              {tier.blurb}
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {tier.perks.map((perk) => (
                <li
                  key={perk}
                  className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]"
                >
                  {perk}
                </li>
              ))}
            </ul>
            {i < tiers.length - 1 && (
              <span className="sr-only">Next rank</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
