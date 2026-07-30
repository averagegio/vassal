"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  RANK_LABEL,
  THEME_LABEL,
  WIDGET_LABEL,
  type CourtRank,
  type HallTheme,
  type HallWidget,
  HALL_THEMES,
  HALL_WIDGETS,
} from "../lib/ranks";
import { VassalLogo } from "./VassalLogo";

export type HallLeaderRow = {
  userId: string;
  name: string;
  avatarUrl: string | null | undefined;
  xUsername: string | null | undefined;
  rank: CourtRank | string;
  standing: number;
  role: "lord" | "vassal";
};

export type HallData = {
  court: {
    id: string;
    slug: string;
    name: string;
    theme: HallTheme;
    widget: HallWidget;
    tagline: string;
  };
  lord: {
    id: string;
    name: string;
    avatarUrl: string | null;
    xUsername: string | null;
  } | null;
  leaderboard: HallLeaderRow[];
  playlist: Array<{
    id: string;
    title: string;
    artist: string;
    url: string;
    by?: string;
  }>;
  moodboard: Array<{
    id: string;
    title: string;
    imageUrl: string;
    sourceUrl: string;
    by?: string;
  }>;
  viewer: {
    isMember: boolean;
    isLord: boolean;
    rank: string | null;
    standing: number | null;
    userId?: string | null;
  };
};

type LordsHallProps = {
  initial: HallData;
};

export function LordsHall({ initial }: LordsHallProps) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songUrl, setSongUrl] = useState("");
  const [pinTitle, setPinTitle] = useState("");
  const [pinImage, setPinImage] = useState("");
  const [pinSource, setPinSource] = useState("");

  const theme = data.court.theme;

  const refresh = async () => {
    const res = await fetch(`/api/court/${data.court.slug}`);
    if (!res.ok) return;
    const json = (await res.json()) as HallData;
    setData(json);
  };

  const saveTheme = async (patch: {
    theme?: HallTheme;
    widget?: HallWidget;
    tagline?: string;
  }) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/court/${data.court.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(json.error || "Could not update hall.");
        return;
      }
      await refresh();
      setMessage("Hall updated.");
    } finally {
      setBusy(false);
    }
  };

  const swearFealty = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/court", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", slug: data.court.slug }),
      });
      const json = (await res.json()) as { error?: string };
      if (res.status === 401) {
        router.push(
          `/signup?court=${encodeURIComponent(data.court.slug)}&holding=fan`,
        );
        return;
      }
      if (!res.ok) {
        setMessage(json.error || "Could not swear fealty.");
        return;
      }
      await refresh();
      setMessage("Fealty sworn. Welcome to the hall.");
    } finally {
      setBusy(false);
    }
  };

  const addSong = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/court/${data.court.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "playlist",
          title: songTitle,
          artist: songArtist,
          url: songUrl,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(json.error || "Could not add song.");
        return;
      }
      setSongTitle("");
      setSongArtist("");
      setSongUrl("");
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const addPin = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/court/${data.court.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "moodboard",
          title: pinTitle,
          imageUrl: pinImage,
          sourceUrl: pinSource,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(json.error || "Could not pin.");
        return;
      }
      setPinTitle("");
      setPinImage("");
      setPinSource("");
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`hall-shell hall-theme-${theme} min-h-dvh text-[var(--vassal-cream)]`}>
      <header className="sticky top-0 z-30 border-b border-[color-mix(in_srgb,var(--vassal-gold)_28%,transparent)] bg-[color-mix(in_srgb,var(--vassal-black)_88%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <VassalLogo size={28} />
            <span className="font-[family-name:var(--font-display)] text-xs tracking-[0.24em]">
              HALL
            </span>
          </Link>
          {data.viewer.isMember ? (
            <p className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
              {RANK_LABEL[(data.viewer.rank as CourtRank) || "serf"] || "Member"}
              {data.viewer.standing != null ? ` · ${data.viewer.standing}` : ""}
            </p>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => void swearFealty()}
              className="border border-[color-mix(in_srgb,var(--vassal-gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_35%,transparent)] px-3 py-1.5 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.16em] uppercase"
            >
              Swear fealty
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 pb-16">
        <section className="hall-hero px-5 py-6">
          <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.28em] uppercase text-[var(--vassal-gold)]">
            Lord&apos;s Hall
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-[0.08em]">
            {data.court.name}
          </h1>
          {data.court.tagline ? (
            <p className="mt-2 font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
              {data.court.tagline}
            </p>
          ) : null}
          {data.lord ? (
            <p className="mt-3 font-[family-name:var(--font-display)] text-xs tracking-[0.14em] text-[color-mix(in_srgb,var(--vassal-cream)_60%,transparent)]">
              Lord {data.lord.name}
              {data.lord.xUsername ? ` · @${data.lord.xUsername}` : ""}
            </p>
          ) : null}
        </section>

        {message ? (
          <p
            role="status"
            className="mt-4 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.12em] text-[var(--vassal-gold)]"
          >
            {message}
          </p>
        ) : null}

        {data.viewer.isLord ? (
          <section className="dash-panel mt-6 p-4">
            <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
              Theme the hall
            </h2>
            <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
              DJ? Fashion? Set the mood your vassals curate in.
            </p>
            <label className="mt-4 block">
              <span className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase text-[var(--vassal-gold)]">
                Theme
              </span>
              <select
                className="auth-input mt-2 w-full border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2 text-[var(--vassal-cream)]"
                value={data.court.theme}
                disabled={busy}
                onChange={(e) =>
                  void saveTheme({ theme: e.target.value as HallTheme })
                }
              >
                {HALL_THEMES.map((t) => (
                  <option key={t} value={t}>
                    {THEME_LABEL[t]}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase text-[var(--vassal-gold)]">
                Widget
              </span>
              <select
                className="auth-input mt-2 w-full border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2 text-[var(--vassal-cream)]"
                value={data.court.widget}
                disabled={busy}
                onChange={(e) =>
                  void saveTheme({ widget: e.target.value as HallWidget })
                }
              >
                {HALL_WIDGETS.map((w) => (
                  <option key={w} value={w}>
                    {WIDGET_LABEL[w]}
                  </option>
                ))}
              </select>
            </label>
          </section>
        ) : null}

        <section className="dash-panel mt-6 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
              Retinue leaderboard
            </h2>
            <span className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_45%,transparent)]">
              {data.leaderboard.length} sworn
            </span>
          </div>
          <ol className="mt-4 flex flex-col gap-3">
            {data.leaderboard.map((row, index) => (
              <li
                key={row.userId}
                className={`hall-rank-row flex items-center gap-3 ${
                  row.role === "lord" ? "hall-rank-lord" : ""
                }`}
              >
                <span className="w-6 font-[family-name:var(--font-display)] text-xs text-[var(--vassal-gold)]">
                  {index + 1}
                </span>
                <Avatar name={row.name} src={row.avatarUrl} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-[family-name:var(--font-display)] text-sm tracking-[0.06em]">
                    {row.name}
                    {row.role === "lord" ? " · Lord" : ""}
                  </p>
                  <p className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                    {RANK_LABEL[(row.rank as CourtRank) || "serf"] || row.rank}
                    {" · "}
                    {row.standing} standing
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {data.court.widget === "playlist" ? (
          <section className="dash-panel mt-6 p-4">
            <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
              Court playlist
            </h2>
            <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
              Vassals add tracks. Lord sets the booth tone.
            </p>
            {data.viewer.isMember ? (
              <div className="mt-4 flex flex-col gap-2">
                <input
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="Song title"
                  className="auth-input border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
                />
                <input
                  value={songArtist}
                  onChange={(e) => setSongArtist(e.target.value)}
                  placeholder="Artist"
                  className="auth-input border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
                />
                <input
                  value={songUrl}
                  onChange={(e) => setSongUrl(e.target.value)}
                  placeholder="Spotify / YouTube link (optional)"
                  className="auth-input border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void addSong()}
                  className="mt-1 border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-3 py-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase"
                >
                  Add to playlist
                </button>
              </div>
            ) : null}
            <ul className="mt-5 flex flex-col gap-3">
              {data.playlist.length === 0 ? (
                <li className="font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                  No tracks yet.
                </li>
              ) : (
                data.playlist.map((t) => (
                  <li key={t.id} className="hall-track">
                    <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.06em]">
                      {t.title}
                      {t.artist ? ` — ${t.artist}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-[color-mix(in_srgb,var(--vassal-cream)_50%,transparent)]">
                      {t.by ? `Added by ${t.by}` : ""}
                      {t.url ? (
                        <>
                          {" · "}
                          <a
                            href={t.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--vassal-gold)] underline-offset-2 hover:underline"
                          >
                            Open
                          </a>
                        </>
                      ) : null}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </section>
        ) : null}

        {data.court.widget === "moodboard" ? (
          <section className="dash-panel mt-6 p-4">
            <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
              Mood board
            </h2>
            <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
              Pin image links from Pinterest or the open web.
            </p>
            {data.viewer.isMember ? (
              <div className="mt-4 flex flex-col gap-2">
                <input
                  value={pinImage}
                  onChange={(e) => setPinImage(e.target.value)}
                  placeholder="Image URL (https://…)"
                  className="auth-input border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
                />
                <input
                  value={pinSource}
                  onChange={(e) => setPinSource(e.target.value)}
                  placeholder="Pinterest / source link (optional)"
                  className="auth-input border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
                />
                <input
                  value={pinTitle}
                  onChange={(e) => setPinTitle(e.target.value)}
                  placeholder="Caption (optional)"
                  className="auth-input border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void addPin()}
                  className="mt-1 border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-3 py-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase"
                >
                  Pin to board
                </button>
              </div>
            ) : null}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {data.moodboard.length === 0 ? (
                <p className="col-span-full font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                  No pins yet.
                </p>
              ) : (
                data.moodboard.map((p) => (
                  <a
                    key={p.id}
                    href={p.sourceUrl || p.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hall-pin block overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imageUrl}
                      alt={p.title || "Mood pin"}
                      className="aspect-[3/4] w-full object-cover"
                    />
                    <p className="truncate px-2 py-1.5 text-[0.65rem] text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)]">
                      {p.title || p.by || "Pin"}
                    </p>
                  </a>
                ))
              )}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function Avatar({ name, src }: { name: string; src?: string | null }) {
  return (
    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[color-mix(in_srgb,var(--vassal-gold)_35%,transparent)] bg-[var(--vassal-stone)]">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] text-xs text-[var(--vassal-gold)]">
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}
    </div>
  );
}
