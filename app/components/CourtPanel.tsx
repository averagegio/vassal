"use client";

import Link from "next/link";
import { useState } from "react";
import {
  HALL_THEMES,
  HALL_WIDGETS,
  RANK_LABEL,
  THEME_LABEL,
  WIDGET_LABEL,
  type CourtRank,
  type HallTheme,
  type HallWidget,
} from "../lib/ranks";

export type CourtMembershipSummary = {
  slug: string;
  name: string;
  rank: CourtRank | string;
  standing: number;
  role: "lord" | "vassal";
  theme?: HallTheme;
  widget?: HallWidget;
};

type CourtPanelProps = {
  holding: "fan" | "estate";
  membership: CourtMembershipSummary | null;
  onMembership: (m: CourtMembershipSummary | null) => void;
};

export function CourtPanel({ holding, membership, onMembership }: CourtPanelProps) {
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [theme, setTheme] = useState<HallTheme>("crimson");
  const [widget, setWidget] = useState<HallWidget>("none");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (holding !== "fan") {
    return (
      <section className="dash-panel p-5">
        <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
          Fan Court
        </h2>
        <p className="mt-3 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
          Halls and retinue leaderboards live on the Fan Court holding.
        </p>
      </section>
    );
  }

  if (membership) {
    return (
      <section className="dash-panel p-5">
        <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
          Your court
        </h2>
        <p className="mt-3 font-[family-name:var(--font-display)] text-xl tracking-[0.08em]">
          {membership.name}
        </p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_60%,transparent)]">
          {membership.role === "lord" ? "Lord" : "Vassal"}
          {" · "}
          {RANK_LABEL[(membership.rank as CourtRank) || "serf"] || membership.rank}
          {" · "}
          {membership.standing} standing
        </p>
        <Link
          href={`/hall/${membership.slug}`}
          className="mt-5 inline-flex border border-[color-mix(in_srgb,var(--vassal-gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-4 py-2.5 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.18em] uppercase transition hover:bg-[color-mix(in_srgb,var(--vassal-red)_45%,transparent)]"
        >
          Enter Lord&apos;s Hall
        </Link>
        <p className="mt-3 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
          Shared season scoreboard for every vassal
          {membership.role === "lord"
            ? ", plus Lord setup for DJ playlists or fashion mood boards."
            : " — and the community widget your Lord enabled."}
        </p>
      </section>
    );
  }

  return (
    <section className="dash-panel p-5">
      <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
        Join the fealty game
      </h2>
      <p className="mt-2 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)]">
        Open a hall as Lord, or swear into one with a slug.
      </p>

      {mode === "idle" ? (
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("create")}
            className="border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-3 py-3 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase"
          >
            Open a hall
          </button>
          <button
            type="button"
            onClick={() => setMode("join")}
            className="border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-3 py-3 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase"
          >
            Swear fealty
          </button>
        </div>
      ) : null}

      {mode === "create" ? (
        <form
          className="mt-5 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              setBusy(true);
              setError("");
              try {
                const res = await fetch("/api/court", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "create",
                    name,
                    theme,
                    widget,
                  }),
                });
                const json = (await res.json()) as {
                  error?: string;
                  court?: { slug: string; name: string; theme: HallTheme; widget: HallWidget };
                  member?: { rank: string; standing: number; role: "lord" | "vassal" };
                };
                if (!res.ok || !json.court || !json.member) {
                  setError(json.error || "Could not open hall.");
                  return;
                }
                onMembership({
                  slug: json.court.slug,
                  name: json.court.name,
                  rank: json.member.rank,
                  standing: json.member.standing,
                  role: json.member.role,
                  theme: json.court.theme,
                  widget: json.court.widget,
                });
              } finally {
                setBusy(false);
              }
            })();
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Hall name"
            className="auth-input border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
          />
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as HallTheme)}
            className="auth-input border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
          >
            {HALL_THEMES.map((t) => (
              <option key={t} value={t}>
                {THEME_LABEL[t]}
              </option>
            ))}
          </select>
          <select
            value={widget}
            onChange={(e) => setWidget(e.target.value as HallWidget)}
            className="auth-input border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
          >
            {HALL_WIDGETS.map((w) => (
              <option key={w} value={w}>
                {WIDGET_LABEL[w]}
              </option>
            ))}
          </select>
          {error ? (
            <p className="text-[0.7rem] text-[var(--vassal-blood)]">{error}</p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="px-3 py-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={busy}
              className="border border-[color-mix(in_srgb,var(--vassal-gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-4 py-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase disabled:opacity-60"
            >
              {busy ? "Opening…" : "Open hall"}
            </button>
          </div>
        </form>
      ) : null}

      {mode === "join" ? (
        <form
          className="mt-5 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              setBusy(true);
              setError("");
              try {
                const res = await fetch("/api/court", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "join", slug }),
                });
                const json = (await res.json()) as {
                  error?: string;
                  court?: { slug: string; name: string };
                  member?: { rank: string; standing: number; role: "lord" | "vassal" };
                };
                if (!res.ok || !json.court || !json.member) {
                  setError(json.error || "Could not join.");
                  return;
                }
                onMembership({
                  slug: json.court.slug,
                  name: json.court.name,
                  rank: json.member.rank,
                  standing: json.member.standing,
                  role: json.member.role,
                });
              } finally {
                setBusy(false);
              }
            })();
          }}
        >
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Court slug (e.g. meridian)"
            className="auth-input border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
          />
          {error ? (
            <p className="text-[0.7rem] text-[var(--vassal-blood)]">{error}</p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="px-3 py-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={busy}
              className="border border-[color-mix(in_srgb,var(--vassal-gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-4 py-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase disabled:opacity-60"
            >
              {busy ? "Swearing…" : "Swear fealty"}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
