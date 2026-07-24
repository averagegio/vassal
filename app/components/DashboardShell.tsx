"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import type { Petition } from "../lib/features";
import { PetitionCourt } from "./PetitionCourt";
import { VassalLogo } from "./VassalLogo";

export type DashboardData = {
  user: {
    id: string;
    name: string;
    email: string;
    holding: "fan" | "estate";
    xUsername: string | null;
    avatarUrl: string | null;
    headerUrl: string | null;
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
  const [uploading, setUploading] = useState<"avatar" | "header" | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const headerInput = useRef<HTMLInputElement>(null);

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

  const onPickImage = async (
    kind: "avatar" | "header",
    file: File | null,
  ) => {
    if (!file || !data) return;
    setUploading(kind);
    try {
      const dataUrl = await resizeImage(
        file,
        kind === "avatar" ? 400 : 1200,
        kind === "avatar" ? 400 : 400,
        kind === "avatar" ? 0.85 : 0.8,
      );
      const res = await fetch("/api/profile/image", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, dataUrl }),
      });
      if (!res.ok) return;
      const json = (await res.json()) as {
        user: { avatarUrl: string | null; headerUrl: string | null };
      };
      setData({
        ...data,
        user: {
          ...data.user,
          avatarUrl: json.user.avatarUrl,
          headerUrl: json.user.headerUrl,
        },
      });
    } finally {
      setUploading(null);
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
            {data.user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.user.avatarUrl}
                alt=""
                className="hidden h-8 w-8 rounded-full object-cover sm:block"
              />
            ) : null}
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
        <section className="profile-banner relative overflow-hidden border border-[color-mix(in_srgb,var(--vassal-gold)_24%,transparent)]">
          <div
            className="relative h-36 bg-[linear-gradient(120deg,#2a0a10,#120608_55%,#1a0c08)] sm:h-44"
            style={
              data.user.headerUrl
                ? {
                    backgroundImage: `linear-gradient(180deg,rgba(7,4,5,0.15),rgba(7,4,5,0.55)), url(${data.user.headerUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            <input
              ref={headerInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                void onPickImage("header", e.target.files?.[0] ?? null)
              }
            />
            <button
              type="button"
              onClick={() => headerInput.current?.click()}
              disabled={uploading === "header"}
              className="absolute right-3 top-3 border border-[color-mix(in_srgb,var(--vassal-cream)_40%,transparent)] bg-[color-mix(in_srgb,var(--vassal-black)_55%,transparent)] px-3 py-1.5 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.16em] uppercase backdrop-blur-sm transition hover:border-[var(--vassal-gold)] disabled:opacity-60"
            >
              {uploading === "header" ? "Uploading…" : "Upload header"}
            </button>
          </div>

          <div className="relative px-5 pb-5 pt-0 sm:px-6">
            <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="relative">
                  <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-[var(--vassal-black)] bg-[var(--vassal-stone)] sm:h-24 sm:w-24">
                    {data.user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.user.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] text-xl text-[var(--vassal-gold)]">
                        {data.user.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <input
                    ref={avatarInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      void onPickImage("avatar", e.target.files?.[0] ?? null)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => avatarInput.current?.click()}
                    disabled={uploading === "avatar"}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] bg-[var(--vassal-black)] px-2 py-0.5 font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.14em] uppercase transition hover:border-[var(--vassal-blood)] disabled:opacity-60"
                  >
                    {uploading === "avatar" ? "…" : "Photo"}
                  </button>
                </div>
                <div className="pb-1">
                  <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.28em] uppercase text-[var(--vassal-gold)]">
                    {isFan ? "Fan Court" : "Estate"}
                  </p>
                  <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-[0.08em] sm:text-3xl">
                    {data.user.name}
                  </h1>
                  {data.user.xUsername ? (
                    <p className="mt-1 font-[family-name:var(--font-display)] text-xs tracking-[0.12em] text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                      @{data.user.xUsername}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <nav className="mt-8 flex gap-2" aria-label="Dashboard">
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

async function resizeImage(
  file: File,
  maxW: number,
  maxH: number,
  quality: number,
) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width, maxH / bitmap.height);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
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
