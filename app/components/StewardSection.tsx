import { SHARED_STEWARD } from "../lib/features";

export function StewardSection() {
  return (
    <section
      id="steward"
      className="relative overflow-hidden border-t border-[color-mix(in_srgb,var(--vassal-red)_40%,transparent)]"
    >
      <div className="steward-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            Shared across both holdings
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl tracking-[0.12em] text-[var(--vassal-cream)] sm:text-4xl">
            The AI Steward
          </h2>
          <p className="mt-4 font-[family-name:var(--font-body)] text-base italic leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_78%,transparent)]">
            One landlord voice. One Steward who keeps fan courts and freeholds
            interactive between your appearances—decrees, favor lists, and house
            law under your seal.
          </p>
        </header>

        <ul className="mx-auto mt-14 grid max-w-4xl gap-10 sm:grid-cols-3">
          {SHARED_STEWARD.map((item) => (
            <li key={item.id} className="text-center sm:text-left">
              <span className="mx-auto mb-4 block h-2 w-2 rotate-45 bg-[var(--vassal-blood)] sm:mx-0" />
              <h3 className="font-[family-name:var(--font-display)] text-base tracking-[0.08em] text-[var(--vassal-cream)]">
                {item.title}
              </h3>
              <p className="mt-3 font-[family-name:var(--font-body)] text-sm leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_72%,transparent)]">
                {item.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-16 max-w-2xl border border-[color-mix(in_srgb,var(--vassal-gold)_28%,transparent)] px-6 py-8 text-center">
          <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.14em] text-[var(--vassal-cream)]">
            Patreon sells access. OnlyFans sells intimacy-at-scale.
          </p>
          <p className="mt-3 font-[family-name:var(--font-body)] text-base italic leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_80%,transparent)]">
            Vassal sells a landlord you live under—and a Steward who keeps the
            realm alive between audiences, whether the holding is a fandom or a
            door with a key.
          </p>
        </div>
      </div>
    </section>
  );
}
