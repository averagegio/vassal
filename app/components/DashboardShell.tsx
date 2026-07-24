"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { clearSession, getSession } from "../lib/auth";
import { FAN_PETITIONS, RE_PETITIONS } from "../lib/features";
import { PetitionCourt } from "./PetitionCourt";
import { VassalLogo } from "./VassalLogo";

const emptySubscribe = () => () => {};

export function DashboardShell() {
  const router = useRouter();
  const session = useSyncExternalStore(emptySubscribe, getSession, () => null);
  const [tab, setTab] = useState<"overview" | "petitions" | "tenants">("overview");

  useEffect(() => {
    if (!session) router.replace("/login");
  }, [session, router]);

  const isFan = session?.holding !== "estate";
  const petitions = useMemo(
    () => (isFan ? FAN_PETITIONS : RE_PETITIONS),
    [isFan],
  );

  const logout = () => {
    clearSession();
    router.push("/");
  };

  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--vassal-black)] text-[var(--vassal-cream)]">
        <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.28em] uppercase text-[var(--vassal-gold)]">
          Opening court…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--vassal-black)] text-[var(--vassal-cream)]">
      <header className="sticky top-0 z-40 border-b border-[color-mix(in_srgb,var(--vassal-red)_40%,transparent)] bg-[color-mix(in_srgb,var(--vassal-black)_92%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <VassalLogo size={36} />
            <span className="font-[family-name:var(--font-display)] text-sm tracking-[0.28em]">
              VASSAL
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <p className="hidden font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.18em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)] sm:block">
              {session.name}
            </p>
            <button
              type="button"
              onClick={logout}
              className="border border-[color-mix(in_srgb,var(--vassal-gold)_35%,transparent)] px-3 py-1.5 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase transition hover:border-[var(--vassal-blood)]"
            >
              Leave
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.28em] uppercase text-[var(--vassal-gold)]">
              {isFan ? "Fan Court" : "Estate Holding"}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-[0.1em] sm:text-3xl">
              {session.name}&apos;s solar
            </h1>
          </div>
          <nav className="mt-4 flex gap-2 sm:mt-0" aria-label="Dashboard">
            {(
              [
                ["overview", "Overview"],
                ["petitions", "Petitions"],
                ["tenants", "Tenants"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`px-3 py-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase transition ${
                  tab === id
                    ? "border-b-2 border-[var(--vassal-blood)] text-[var(--vassal-cream)]"
                    : "text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)] hover:text-[var(--vassal-cream)]"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {tab === "overview" && (
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Tenants" value={isFan ? "128" : "14"} />
            <Stat label="Open petitions" value="3" />
            <Stat label="Standing avg" value={isFan ? "72" : "88"} />
            <Stat label="Tribute / mo" value={isFan ? "$2.4k" : "$6.1k"} />
          </section>
        )}

        {tab === "overview" && (
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="dash-panel p-5">
              <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
                Today&apos;s decree
              </h2>
              <p className="mt-3 font-[family-name:var(--font-body)] text-base italic leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_85%,transparent)]">
                {isFan
                  ? "Siege week. Retainers first at dusk audience."
                  : "Quiet hours hold. Unit 2B repair dispatched."}
              </p>
              <button
                type="button"
                className="mt-5 border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-4 py-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.18em] uppercase transition hover:border-[var(--vassal-blood)]"
              >
                Edit decree
              </button>
            </div>
            <div className="dash-panel p-5">
              <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
                Steward pulse
              </h2>
              <ul className="mt-4 space-y-3">
                <Pulse text={isFan ? "12 duties completed overnight" : "4 rent nudges sent"} />
                <Pulse text={isFan ? "3 petitions queued by rank" : "1 leak flagged urgent"} />
                <Pulse text={isFan ? "Coronation candidates: 2" : "Lease chill risk: Unit 5C"} />
              </ul>
            </div>
          </section>
        )}

        {tab === "petitions" && (
          <section className="mt-8">
            <PetitionCourt
              title="Seal board"
              subtitle="Grant, defer, or deny."
              seed={petitions}
              grantLabel={isFan ? "Grant" : "Dispatch"}
            />
          </section>
        )}

        {tab === "tenants" && (
          <section className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[color-mix(in_srgb,var(--vassal-gold)_25%,transparent)]">
                  {["Name", "Rank", "Standing", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.18em] uppercase text-[var(--vassal-gold)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(isFan
                  ? [
                      ["Mira of the North", "Freeholder", "91", "Active"],
                      ["Cole the Steady", "Serf", "64", "Streak"],
                      ["Lord Ash", "Retainer", "97", "Audience"],
                      ["Rin Vale", "Serf", "41", "Cooling"],
                    ]
                  : [
                      ["Elena · 2B", "High", "94", "Repair open"],
                      ["Jordan · 4A", "Renewal", "88", "Guest ok"],
                      ["Maya · Pine", "Guest", "70", "Checked out"],
                      ["Sam · 5C", "At risk", "52", "Chill"],
                    ]
                ).map((row) => (
                  <tr
                    key={row[0]}
                    className="border-b border-[color-mix(in_srgb,var(--vassal-cream)_8%,transparent)]"
                  >
                    {row.map((cell) => (
                      <td
                        key={cell}
                        className="px-3 py-3 font-[family-name:var(--font-body)] text-sm text-[color-mix(in_srgb,var(--vassal-cream)_85%,transparent)]"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="dash-panel px-4 py-5">
      <p className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.2em] uppercase text-[var(--vassal-gold)]">
        {label}
      </p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-[0.06em] text-[var(--vassal-cream)]">
        {value}
      </p>
    </div>
  );
}

function Pulse({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-[var(--vassal-blood)]" />
      <span className="font-[family-name:var(--font-body)] text-sm text-[color-mix(in_srgb,var(--vassal-cream)_80%,transparent)]">
        {text}
      </span>
    </li>
  );
}
