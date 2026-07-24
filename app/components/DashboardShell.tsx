"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { Petition } from "../lib/features";
import { PetitionCourt } from "./PetitionCourt";
import { VassalLogo } from "./VassalLogo";

export type DashboardData = {
  user: {
    id: string;
    name: string;
    email: string;
    holding: "fan" | "estate";
  };
  stats: {
    tenants: number;
    openPetitions: number;
    standingAvg: number;
  };
  decree: string;
  petitions: Petition[];
  tenants: Array<{
    id: string;
    name: string;
    rank: string;
    standing: number;
    status: string;
  }>;
};

type DashboardShellProps = {
  initialData: DashboardData | null;
  loadError?: string;
};

export function DashboardShell({ initialData, loadError }: DashboardShellProps) {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(initialData);
  const [tab, setTab] = useState<"overview" | "petitions" | "tenants">("overview");
  const [decreeDraft, setDecreeDraft] = useState(initialData?.decree ?? "");
  const [savingDecree, setSavingDecree] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const saveDecree = async () => {
    setSavingDecree(true);
    try {
      const res = await fetch("/api/decree", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decree: decreeDraft }),
      });
      if (res.ok && data) {
        setData({ ...data, decree: decreeDraft.trim() });
      }
    } finally {
      setSavingDecree(false);
    }
  };

  if (loadError || !data) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[var(--vassal-black)] px-6 text-center text-[var(--vassal-cream)]">
        <p className="font-[family-name:var(--font-body)] text-base italic">
          {loadError || "Could not load your holding."}
        </p>
        <Link href="/login" className="text-[var(--vassal-gold)] underline-offset-4 hover:underline">
          Log in
        </Link>
      </div>
    );
  }

  const isFan = data.user.holding !== "estate";

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
              {data.user.name}
            </p>
            <button
              type="button"
              onClick={() => void logout()}
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
              {isFan ? "Fan Court" : "Estate"}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-[0.1em] sm:text-3xl">
              {data.user.name}&apos;s holding
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
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-3">
              <Stat label="Tenants" value={String(data.stats.tenants)} />
              <Stat label="Open petitions" value={String(data.stats.openPetitions)} />
              <Stat label="Standing" value={String(data.stats.standingAvg)} />
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="dash-panel p-5">
                <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
                  Today&apos;s decree
                </h2>
                <textarea
                  value={decreeDraft}
                  onChange={(e) => setDecreeDraft(e.target.value)}
                  rows={3}
                  className="mt-3 w-full resize-none border border-[color-mix(in_srgb,var(--vassal-gold)_25%,transparent)] bg-transparent px-3 py-2 font-[family-name:var(--font-body)] text-base italic leading-relaxed text-[var(--vassal-cream)] outline-none focus:border-[var(--vassal-blood)]"
                />
                <button
                  type="button"
                  onClick={() => void saveDecree()}
                  disabled={savingDecree}
                  className="mt-4 border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-4 py-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.18em] uppercase transition hover:border-[var(--vassal-blood)] disabled:opacity-60"
                >
                  {savingDecree ? "Saving…" : "Save decree"}
                </button>
              </div>
              <div className="dash-panel p-5">
                <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
                  Steward
                </h2>
                <ul className="mt-4 space-y-3">
                  <Pulse
                    text={
                      data.stats.openPetitions > 0
                        ? `${data.stats.openPetitions} petitions await your seal`
                        : "No open petitions"
                    }
                  />
                  <Pulse text={`${data.stats.tenants} tenants under your banner`} />
                  <Pulse text={`Court standing averages ${data.stats.standingAvg}`} />
                </ul>
              </div>
            </section>
          </>
        )}

        {tab === "petitions" && (
          <section className="mt-8">
            {data.petitions.length === 0 ? (
              <Empty label="No petitions yet." />
            ) : (
              <PetitionCourt
                title="Petition board"
                subtitle="Grant, defer, or deny."
                seed={data.petitions}
                grantLabel="Grant"
                persist
              />
            )}
          </section>
        )}

        {tab === "tenants" && (
          <section className="mt-8">
            {data.tenants.length === 0 ? (
              <Empty label="No tenants yet." />
            ) : (
              <div className="overflow-x-auto">
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
                    {data.tenants.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-[color-mix(in_srgb,var(--vassal-cream)_8%,transparent)]"
                      >
                        <Td>{row.name}</Td>
                        <Td>{row.rank}</Td>
                        <Td>{row.standing}</Td>
                        <Td>{row.status}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

function Td({ children }: { children: ReactNode }) {
  return (
    <td className="px-3 py-3 font-[family-name:var(--font-body)] text-sm text-[color-mix(in_srgb,var(--vassal-cream)_85%,transparent)]">
      {children}
    </td>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <p className="font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_60%,transparent)]">
      {label}
    </p>
  );
}
