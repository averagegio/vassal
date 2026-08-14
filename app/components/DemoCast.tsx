import Link from "next/link";
import {
  DEMO_CAST,
  DEMO_COURT,
  DEMO_ESTATE,
  DEMO_PASSWORD,
  DEMO_SCENES,
  getCastMember,
  type DemoCastMember,
  type DemoPath,
  type DemoScene,
} from "../lib/demo-cast";
import { LANDING_HREF } from "../lib/home";
import { VassalLogo } from "./VassalLogo";

const PATH_LABEL: Record<DemoPath, string> = {
  fan: "Fan Court",
  estate: "Estate",
  shared: "Shared",
};

export function DemoCast() {
  const fan = DEMO_CAST.filter((m) => m.path === "fan");
  const estate = DEMO_CAST.filter((m) => m.path === "estate");
  const shared = DEMO_CAST.filter((m) => m.path === "shared");

  return (
    <div className="pitch-shell min-h-dvh text-[var(--vassal-cream)]">
      <header className="sticky top-0 z-40 border-b border-[color-mix(in_srgb,var(--vassal-red)_35%,transparent)] bg-[color-mix(in_srgb,var(--vassal-black)_92%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link href={LANDING_HREF} className="flex items-center gap-3">
            <VassalLogo size={34} />
            <span className="font-[family-name:var(--font-display)] text-sm tracking-[0.28em]">
              VASSAL
            </span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 sm:gap-x-4">
            <a
              href="#cast"
              className="hidden font-[family-name:var(--font-display)] text-[0.58rem] tracking-[0.16em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)] transition hover:text-[var(--vassal-blood)] md:inline"
            >
              Cast
            </a>
            <a
              href="#scenes"
              className="hidden font-[family-name:var(--font-display)] text-[0.58rem] tracking-[0.16em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)] transition hover:text-[var(--vassal-blood)] md:inline"
            >
              Scenes
            </a>
            <Link
              href="/pitch"
              className="font-[family-name:var(--font-display)] text-[0.58rem] tracking-[0.16em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)] transition hover:text-[var(--vassal-blood)]"
            >
              Pitch
            </Link>
            <Link
              href="/signup"
              className="border border-[color-mix(in_srgb,var(--vassal-gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_35%,transparent)] px-3 py-1.5 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase transition hover:bg-[color-mix(in_srgb,var(--vassal-red)_55%,transparent)]"
            >
              Join
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-5 py-20 sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute inset-0 pitch-ash" aria-hidden />
        <div className="relative mx-auto max-w-3xl text-center">
          <VassalLogo
            size={72}
            className="pitch-fade mx-auto mb-5 drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
          />
          <h1 className="pitch-fade pitch-delay-1 font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,3.4rem)] font-semibold tracking-[0.28em] text-[var(--vassal-cream)]">
            VASSAL
          </h1>
          <p className="pitch-fade pitch-delay-2 mx-auto mt-5 max-w-xl font-[family-name:var(--font-body)] text-lg italic leading-snug text-[color-mix(in_srgb,var(--vassal-cream)_82%,transparent)]">
            Investor demo cast — characters for the tenure story.
          </p>
          <p className="pitch-fade pitch-delay-3 mx-auto mt-6 max-w-lg font-[family-name:var(--font-display)] text-xs tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
            {DEMO_COURT.name} · {DEMO_ESTATE.name} · one Steward
          </p>
        </div>
      </section>

      <section
        id="cast"
        className="border-b border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            Casting sheet
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] sm:text-4xl">
            Eight faces. One loop.
          </h2>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
            Continuity with prior feature demos (Rowan, Mira, Astra) plus estate
            tenants and the Steward — enough cast for a dual-path investor cut.
          </p>

          <CastGroup title="Fan Court" members={fan} />
          <CastGroup title="Estate" members={estate} />
          <CastGroup title="Shared" members={shared} />
        </div>
      </section>

      <section
        id="scenes"
        className="border-b border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            Storyboard
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] sm:text-4xl">
            Six scenes
          </h2>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
            Shoot in product. Cut for investors. Portraits for lower-thirds and
            cold opens.
          </p>

          <ol className="mt-12 flex flex-col">
            {DEMO_SCENES.map((scene) => (
              <SceneRow key={scene.n} scene={scene} />
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.32em] uppercase text-[var(--vassal-gold)]">
            Seed for recording
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] sm:text-4xl">
            Demo logins
          </h2>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
            After <code className="text-[var(--vassal-gold)]">npm run demo:seed</code>,
            sign in with any cast email. Shared password:{" "}
            <code className="text-[var(--vassal-gold)]">{DEMO_PASSWORD}</code>
          </p>

          <ul className="mt-10 divide-y divide-[color-mix(in_srgb,var(--vassal-gold)_18%,transparent)] border-y border-[color-mix(in_srgb,var(--vassal-gold)_18%,transparent)]">
            {DEMO_CAST.filter((m) => m.id !== "steward").map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-baseline justify-between gap-2 py-4"
              >
                <div>
                  <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.08em]">
                    {m.name}
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                    {m.roleLabel}
                  </p>
                </div>
                <code className="font-[family-name:var(--font-display)] text-xs tracking-[0.06em] text-[var(--vassal-gold)]">
                  {m.handle}@demo.vassal
                </code>
              </li>
            ))}
          </ul>

          <p className="mt-8 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
            Hall:{" "}
            <Link
              href={`/hall/${DEMO_COURT.slug}`}
              className="text-[var(--vassal-gold)] underline-offset-4 hover:underline"
            >
              /hall/{DEMO_COURT.slug}
            </Link>
            . Portraits live under{" "}
            <code className="text-[var(--vassal-gold)]">/public/demo/cast/</code>.
          </p>
        </div>
      </section>
    </div>
  );
}

function CastGroup({
  title,
  members,
}: {
  title: string;
  members: DemoCastMember[];
}) {
  if (members.length === 0) return null;
  return (
    <div className="mt-14">
      <h3 className="font-[family-name:var(--font-display)] text-xl tracking-[0.14em]">
        {title}
      </h3>
      <ul className="mt-8 grid gap-10 sm:grid-cols-2">
        {members.map((m) => (
          <li key={m.id} className="cast-card flex gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.portrait}
              alt=""
              width={112}
              height={112}
              className="h-28 w-28 shrink-0 object-cover"
            />
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.22em] uppercase text-[var(--vassal-blood)]">
                {m.roleLabel}
              </p>
              <h4 className="mt-1 font-[family-name:var(--font-display)] text-xl tracking-[0.08em]">
                {m.name}
              </h4>
              <p className="mt-1 font-[family-name:var(--font-display)] text-xs tracking-[0.12em] text-[color-mix(in_srgb,var(--vassal-cream)_50%,transparent)]">
                @{m.handle}
              </p>
              <p className="mt-3 font-[family-name:var(--font-body)] text-sm leading-snug text-[color-mix(in_srgb,var(--vassal-cream)_78%,transparent)]">
                {m.blurb}
              </p>
              <p className="mt-3 font-[family-name:var(--font-body)] text-sm italic text-[var(--vassal-gold)]">
                Beat: {m.videoBeat}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SceneRow({ scene }: { scene: DemoScene }) {
  return (
    <li className="relative border-l border-[color-mix(in_srgb,var(--vassal-gold)_35%,transparent)] py-5 pl-6">
      <span
        className="absolute -left-[5px] top-7 h-2.5 w-2.5 rotate-45 bg-[var(--vassal-blood)]"
        aria-hidden
      />
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.28em] uppercase text-[var(--vassal-blood)]">
          {scene.n}
        </span>
        <h3 className="font-[family-name:var(--font-display)] text-lg tracking-[0.08em]">
          {scene.title}
        </h3>
        <span className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.18em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_45%,transparent)]">
          {PATH_LABEL[scene.path]}
        </span>
      </div>
      <p className="mt-2 max-w-2xl font-[family-name:var(--font-body)] text-sm leading-snug text-[color-mix(in_srgb,var(--vassal-cream)_78%,transparent)]">
        {scene.body}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {scene.castIds.map((id) => {
          const member = getCastMember(id);
          if (!member) return null;
          return (
            <div key={id} className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={member.portrait}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 object-cover"
              />
              <span className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.1em]">
                {member.name}
              </span>
            </div>
          );
        })}
      </div>
    </li>
  );
}
