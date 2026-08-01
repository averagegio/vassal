"use client";

type RealmPathsProps = {
  activePath: "fan" | "estate";
  onSelect: (path: "fan" | "estate") => void;
};

export function RealmPaths({ activePath, onSelect }: RealmPathsProps) {
  return (
    <section
      id="paths"
      className="relative border-t border-[color-mix(in_srgb,var(--vassal-red)_35%,transparent)] px-6 py-16 sm:py-24"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 realm-ash" aria-hidden />
      <div data-tour="paths" className="relative mx-auto max-w-3xl text-center">
        <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
          Two doors
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] text-[var(--vassal-cream)] sm:text-4xl">
          Choose your path
        </h2>
        <p className="mx-auto mt-3 max-w-md font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)]">
          Creator community or rentals — pick one to start.
        </p>
      </div>

      <div className="relative mx-auto mt-10 flex max-w-3xl flex-col gap-4 sm:flex-row sm:gap-6">
        <PathButton
          active={activePath === "fan"}
          onClick={() => onSelect("fan")}
          eyebrow="Creators"
          title="Fan Court"
          body="Paid tiers, member requests, public ranks."
          href="#fan-holding"
        />
        <PathButton
          active={activePath === "estate"}
          onClick={() => onSelect("estate")}
          eyebrow="Property"
          title="Estate"
          body="House rules, repairs, and renewals."
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
      className={`path-door group flex flex-1 flex-col px-6 py-6 text-left transition ${
        active ? "path-door-active" : ""
      }`}
    >
      <span className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.28em] uppercase text-[color-mix(in_srgb,var(--vassal-gold)_80%,transparent)]">
        {eyebrow}
      </span>
      <span className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-[0.08em] text-[var(--vassal-cream)]">
        {title}
      </span>
      <span className="mt-2 font-[family-name:var(--font-body)] text-sm text-[color-mix(in_srgb,var(--vassal-cream)_72%,transparent)]">
        {body}
      </span>
      <span className="mt-5 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.24em] uppercase text-[var(--vassal-blood)] transition group-hover:tracking-[0.3em]">
        Enter →
      </span>
    </a>
  );
}
