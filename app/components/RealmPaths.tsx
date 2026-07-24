"use client";

type RealmPathsProps = {
  activePath: "fan" | "estate";
  onSelect: (path: "fan" | "estate") => void;
};

export function RealmPaths({ activePath, onSelect }: RealmPathsProps) {
  return (
    <section
      id="paths"
      className="relative border-t border-[color-mix(in_srgb,var(--vassal-red)_35%,transparent)] px-6 py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 realm-ash" aria-hidden />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
          Two holdings, one Steward
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] text-[var(--vassal-cream)] sm:text-4xl">
          Choose your court
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-[family-name:var(--font-body)] text-base italic leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
          Vassal runs landlord–tenant membership for creator realms and for
          real property—same rituals, different doors.
        </p>
      </div>

      <div className="relative mx-auto mt-12 flex max-w-3xl flex-col gap-4 sm:flex-row sm:gap-6">
        <PathButton
          active={activePath === "fan"}
          onClick={() => onSelect("fan")}
          eyebrow="Creator membership"
          title="Fan Court"
          body="Tenants swear fealty, pay tribute, petition, and rise in rank under your banner."
          href="#fan-holding"
        />
        <PathButton
          active={activePath === "estate"}
          onClick={() => onSelect("estate")}
          eyebrow="Property Steward"
          title="Estate Holding"
          body="Hosts and small landlords keep tenure warm with house law, repairs, and renewals."
          href="#estate-holding"
        />
      </div>
    </section>
  );
}

function PathButton({
  active,
  onClick,
  eyebrow,
  title,
  body,
  href,
}: {
  active: boolean;
  onClick: () => void;
  eyebrow: string;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`path-door group flex flex-1 flex-col px-6 py-7 text-left transition ${
        active ? "path-door-active" : ""
      }`}
    >
      <span className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.28em] uppercase text-[color-mix(in_srgb,var(--vassal-gold)_80%,transparent)]">
        {eyebrow}
      </span>
      <span className="mt-3 font-[family-name:var(--font-display)] text-2xl tracking-[0.08em] text-[var(--vassal-cream)]">
        {title}
      </span>
      <span className="mt-3 font-[family-name:var(--font-body)] text-sm leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_72%,transparent)]">
        {body}
      </span>
      <span className="mt-6 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.24em] uppercase text-[var(--vassal-blood)] transition group-hover:tracking-[0.3em]">
        Enter holding →
      </span>
    </a>
  );
}
