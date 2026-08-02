"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { profileHandle } from "../lib/profile";
import {
  RANK_LABEL,
  THEME_BLURB,
  THEME_LABEL,
  WIDGET_BLURB,
  WIDGET_LABEL,
  type CourtRank,
  type HallTheme,
  type HallWidget,
  HALL_THEMES,
  HALL_WIDGETS,
} from "../lib/ranks";
import { FollowButton } from "./FollowButton";
import { PetitionCompose } from "./PetitionCompose";
import { ScrollComposer } from "./ScrollComposer";
import { VassalLogo } from "./VassalLogo";

const THEME_SWATCH: Record<HallTheme, { a: string; b: string }> = {
  crimson: { a: "#8b1524", b: "#1a0508" },
  midnight: { a: "#28468c", b: "#05060a" },
  goldleaf: { a: "#c9a227", b: "#0a0804" },
  neon: { a: "#e11d2e", b: "#2a0a18" },
  atelier: { a: "#f3e6d8", b: "#0c0908" },
  frost: { a: "#8cbee6", b: "#050810" },
  verdant: { a: "#286e46", b: "#040805" },
  slate: { a: "#788291", b: "#08090b" },
};

export type HallLeaderRow = {
  userId: string;
  name: string;
  avatarUrl: string | null | undefined;
  xUsername: string | null | undefined;
  rank: CourtRank | string;
  standing: number;
  role: "lord" | "vassal";
};

export type HallScoreRow = {
  userId: string;
  name: string;
  avatarUrl: string | null | undefined;
  xUsername?: string | null;
  rank: CourtRank | string;
  role: "lord" | "vassal";
  standing: number;
  replies: number;
  reposts: number;
  mentions: number;
};

export type HallSeason = {
  id: string;
  title: string;
  targetReplies: number;
  targetReposts: number;
  targetMentions: number;
  startsAt: string;
  endsAt: string;
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
    followers?: number;
  } | null;
  season: HallSeason | null;
  scoreboard: HallScoreRow[];
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
  apiFeeds: Array<{
    id: string;
    label: string;
    apiUrl: string;
    jsonPath: string;
    by?: string;
    userId?: string;
  }>;
  viewer: {
    isMember: boolean;
    isLord: boolean;
    rank: string | null;
    standing: number | null;
    userId?: string | null;
    isFollowingLord?: boolean;
  };
};

type ApiFeedItem = {
  title: string;
  subtitle: string;
  url: string;
  imageUrl: string;
  description: string;
};

type HallTab = "scoreboard" | "community" | "setup";

type LordsHallProps = {
  initial: HallData;
  /** Deep-link tab from `?tab=` (e.g. lord setup). */
  initialTab?: HallTab;
};

function seasonPoints(row: HallScoreRow) {
  return row.replies + row.reposts * 2 + row.mentions * 3;
}

function pct(value: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((value / target) * 100));
}

function formatEnds(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function resolveInitialTab(
  initial: HallData,
  requested: HallTab | undefined,
): HallTab {
  if (requested === "setup" && initial.viewer.isLord) return "setup";
  if (requested === "community") return "community";
  if (requested === "scoreboard") return "scoreboard";
  return "scoreboard";
}

type HallSettingsDraft = {
  theme: HallTheme;
  widget: HallWidget;
  tagline: string;
  seasonTitle: string;
  targetReplies: string;
  targetReposts: string;
  targetMentions: string;
};

function draftFromHall(hall: HallData): HallSettingsDraft {
  return {
    theme: hall.court.theme,
    widget: hall.court.widget,
    tagline: hall.court.tagline,
    seasonTitle: hall.season?.title ?? "Season of Service",
    targetReplies: String(hall.season?.targetReplies ?? 60),
    targetReposts: String(hall.season?.targetReposts ?? 20),
    targetMentions: String(hall.season?.targetMentions ?? 15),
  };
}

export function LordsHall({ initial, initialTab }: LordsHallProps) {
  const router = useRouter();
  const [data, setData] = useState<HallData>(() => ({
    ...initial,
    apiFeeds: initial.apiFeeds ?? [],
    playlist: initial.playlist ?? [],
    moodboard: initial.moodboard ?? [],
  }));
  const [tab, setTab] = useState<HallTab>(() =>
    resolveInitialTab(initial, initialTab),
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songUrl, setSongUrl] = useState("");
  const [pinTitle, setPinTitle] = useState("");
  const [pinImage, setPinImage] = useState("");
  const [pinSource, setPinSource] = useState("");
  const [apiLabel, setApiLabel] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [apiJsonPath, setApiJsonPath] = useState("");
  const [activeFeedId, setActiveFeedId] = useState<string | null>(
    initial.apiFeeds[0]?.id ?? null,
  );
  const [apiItems, setApiItems] = useState<ApiFeedItem[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(
    initial.playlist[0]?.id ?? null,
  );
  const [draft, setDraft] = useState<HallSettingsDraft>(() =>
    draftFromHall(initial),
  );
  const [previewing, setPreviewing] = useState(false);

  const settingsDirty = useMemo(() => {
    const saved = draftFromHall(data);
    return (
      draft.theme !== saved.theme ||
      draft.widget !== saved.widget ||
      draft.tagline !== saved.tagline ||
      draft.seasonTitle !== saved.seasonTitle ||
      draft.targetReplies !== saved.targetReplies ||
      draft.targetReposts !== saved.targetReposts ||
      draft.targetMentions !== saved.targetMentions
    );
  }, [draft, data]);

  // Draft look while editing, previewing, or when unsaved changes remain.
  const showDraftLook = previewing || tab === "setup" || settingsDirty;
  const theme = showDraftLook ? draft.theme : data.court.theme;
  const displayTagline = showDraftLook ? draft.tagline : data.court.tagline;
  const displayWidget = showDraftLook ? draft.widget : data.court.widget;
  const displaySeasonTitle = showDraftLook
    ? draft.seasonTitle
    : data.season?.title || "Season scoreboard";
  const displayTargets = {
    replies: showDraftLook
      ? Number(draft.targetReplies) || (data.season?.targetReplies ?? 60)
      : (data.season?.targetReplies ?? 60),
    reposts: showDraftLook
      ? Number(draft.targetReposts) || (data.season?.targetReposts ?? 20)
      : (data.season?.targetReposts ?? 20),
    mentions: showDraftLook
      ? Number(draft.targetMentions) || (data.season?.targetMentions ?? 15)
      : (data.season?.targetMentions ?? 15),
  };

  const myScore = useMemo(
    () =>
      data.scoreboard.find((r) => r.userId === data.viewer.userId) ?? null,
    [data.scoreboard, data.viewer.userId],
  );
  const activeTrack =
    data.playlist.find((t) => t.id === activeTrackId) ?? data.playlist[0] ?? null;
  const resolvedFeedId = activeFeedId ?? data.apiFeeds[0]?.id ?? null;
  const activeFeed =
    data.apiFeeds.find((f) => f.id === resolvedFeedId) ?? null;
  const visibleApiItems = activeFeed ? apiItems : [];

  useEffect(() => {
    if (!activeTrackId && data.playlist[0]) {
      setActiveTrackId(data.playlist[0].id);
    }
  }, [activeTrackId, data.playlist]);

  const loadFeedItems = async (feedId: string) => {
    setApiLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/court/${data.court.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "api-preview", feedId }),
      });
      const json = (await res.json()) as {
        error?: string;
        items?: ApiFeedItem[];
      };
      if (!res.ok) {
        setApiItems([]);
        setMessage(json.error || "Could not load API feed.");
        return;
      }
      setApiItems(json.items ?? []);
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    if (data.court.widget !== "api" || !resolvedFeedId) return;
    let cancelled = false;
    void (async () => {
      setApiLoading(true);
      try {
        const res = await fetch(`/api/court/${data.court.slug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "api-preview", feedId: resolvedFeedId }),
        });
        const json = (await res.json()) as {
          error?: string;
          items?: ApiFeedItem[];
        };
        if (cancelled) return;
        if (!res.ok) {
          setApiItems([]);
          setMessage(json.error || "Could not load API feed.");
          return;
        }
        setApiItems(json.items ?? []);
      } finally {
        if (!cancelled) setApiLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [data.court.widget, resolvedFeedId, data.court.slug]);

  const refresh = async (opts?: { syncDraft?: boolean }) => {
    const res = await fetch(`/api/court/${data.court.slug}`);
    if (!res.ok) return;
    const json = (await res.json()) as HallData;
    const next: HallData = {
      ...json,
      season: json.season ?? null,
      scoreboard: json.scoreboard ?? [],
      apiFeeds: json.apiFeeds ?? [],
      playlist: json.playlist ?? [],
      moodboard: json.moodboard ?? [],
    };
    setData(next);
    if (opts?.syncDraft !== false) {
      setDraft(draftFromHall(next));
    }
  };

  const discardDraft = () => {
    setDraft(draftFromHall(data));
    setPreviewing(false);
    setMessage("Draft discarded.");
  };

  const previewDraft = () => {
    setPreviewing(true);
    setTab("scoreboard");
    setMessage("Previewing unsaved hall settings.");
  };

  const saveHallSettings = async () => {
    if (!settingsDirty) {
      setMessage("No changes to save.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/court/${data.court.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: draft.theme,
          widget: draft.widget,
          tagline: draft.tagline,
          seasonTitle: draft.seasonTitle,
          targetReplies: Number(draft.targetReplies),
          targetReposts: Number(draft.targetReposts),
          targetMentions: Number(draft.targetMentions),
        }),
      });
      if (res.status === 401 || res.status === 404) {
        setMessage("Sign in as Lord to save hall changes.");
        return;
      }
      const json = (await res.json()) as {
        error?: string;
        court?: HallData["court"];
        season?: HallSeason;
      };
      if (!res.ok) {
        setMessage(json.error || "Could not save hall settings.");
        await refresh({ syncDraft: false });
        return;
      }
      await refresh({ syncDraft: true });
      setPreviewing(false);
      setMessage("Hall settings saved.");
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
      setTab("scoreboard");
    } finally {
      setBusy(false);
    }
  };

  const logService = async (field: "replies" | "reposts" | "mentions") => {
    if (!data.viewer.isMember) {
      setMessage("Swear fealty to appear on the scoreboard.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/court/${data.court.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "score", [field]: 1 }),
      });
      const json = (await res.json()) as {
        error?: string;
        scoreboard?: HallScoreRow[];
      };
      if (res.status === 401 || res.status === 404) {
        setMessage("Sign in to log service on the board.");
        return;
      }
      if (!res.ok) {
        setMessage(json.error || "Could not log service.");
        return;
      }
      if (json.scoreboard) {
        setData((prev) => ({ ...prev, scoreboard: json.scoreboard! }));
      } else {
        await refresh();
      }
      setMessage("Service logged on the season board.");
    } finally {
      setBusy(false);
    }
  };

  const addSong = async () => {
    if (!songTitle.trim()) {
      setMessage("Song title required.");
      return;
    }
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
      const json = (await res.json()) as {
        error?: string;
        track?: HallData["playlist"][number];
      };
      if (res.status === 401) {
        setMessage("Sign in to add tracks.");
        return;
      }
      if (!res.ok || !json.track) {
        setMessage(json.error || "Could not add song.");
        return;
      }
      setData((prev) => ({
        ...prev,
        playlist: [json.track!, ...prev.playlist],
      }));
      setActiveTrackId(json.track.id);
      setSongTitle("");
      setSongArtist("");
      setSongUrl("");
      setMessage("Track added to the booth.");
    } finally {
      setBusy(false);
    }
  };

  const addPin = async () => {
    if (!pinImage.trim()) {
      setMessage("Image URL required.");
      return;
    }
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
      const json = (await res.json()) as {
        error?: string;
        pin?: HallData["moodboard"][number];
      };
      if (res.status === 401) {
        setMessage("Sign in to pin.");
        return;
      }
      if (!res.ok || !json.pin) {
        setMessage(json.error || "Could not pin.");
        return;
      }
      setData((prev) => ({
        ...prev,
        moodboard: [json.pin!, ...prev.moodboard],
      }));
      setPinTitle("");
      setPinImage("");
      setPinSource("");
      setMessage("Pinned to the board.");
    } finally {
      setBusy(false);
    }
  };

  const importApiFeed = async () => {
    if (!apiUrl.trim()) {
      setMessage("API URL required.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/court/${data.court.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "api",
          label: apiLabel,
          apiUrl,
          jsonPath: apiJsonPath,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        feed?: HallData["apiFeeds"][number];
      };
      if (res.status === 401) {
        setMessage("Sign in to import an API.");
        return;
      }
      if (!res.ok || !json.feed) {
        setMessage(json.error || "Could not import API.");
        return;
      }
      setData((prev) => ({
        ...prev,
        apiFeeds: [json.feed!, ...prev.apiFeeds],
      }));
      setActiveFeedId(json.feed.id);
      setApiLabel("");
      setApiUrl("");
      setApiJsonPath("");
      setMessage("API feed imported.");
    } finally {
      setBusy(false);
    }
  };

  const previewApiFeed = async () => {
    if (!apiUrl.trim()) {
      setMessage("API URL required to preview.");
      return;
    }
    setApiLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/court/${data.court.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "api-preview",
          apiUrl,
          jsonPath: apiJsonPath,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        items?: ApiFeedItem[];
        count?: number;
      };
      if (!res.ok) {
        setMessage(json.error || "Preview failed.");
        return;
      }
      setApiItems(json.items ?? []);
      setMessage(`Preview loaded ${json.count ?? 0} items.`);
    } finally {
      setApiLoading(false);
    }
  };

  const removeFeed = async (feedId: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/court/${data.court.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "api-remove", feedId }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(json.error || "Could not remove feed.");
        return;
      }
      setData((prev) => {
        const apiFeeds = prev.apiFeeds.filter((f) => f.id !== feedId);
        return { ...prev, apiFeeds };
      });
      if (activeFeedId === feedId) {
        setActiveFeedId(null);
        setApiItems([]);
      }
      setMessage("Feed removed.");
    } finally {
      setBusy(false);
    }
  };

  const tabs: Array<{ id: HallTab; label: string; show: boolean }> = [
    { id: "scoreboard", label: "Scoreboard", show: true },
    { id: "community", label: "Community", show: true },
    { id: "setup", label: "Lord setup", show: data.viewer.isLord },
  ];

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
              {myScore ? ` · ${seasonPoints(myScore)} pts` : ""}
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

      <main className="mx-auto max-w-3xl px-4 py-6 pb-28">
        {previewing && data.viewer.isLord ? (
          <div className="hall-preview-banner mb-4" role="status">
            <div>
              <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
                Previewing unsaved settings
              </p>
              <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)]">
                Theme, widget, tagline, and season goals are draft-only until you
                save.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setTab("setup")}
                className="border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-3 py-2 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase"
              >
                Back to setup
              </button>
              <button
                type="button"
                disabled={busy || !settingsDirty}
                onClick={() => void saveHallSettings()}
                className="border border-[color-mix(in_srgb,var(--vassal-gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-3 py-2 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase disabled:opacity-50"
              >
                Save settings
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={discardDraft}
                className="border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] px-3 py-2 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]"
              >
                Discard
              </button>
            </div>
          </div>
        ) : null}

        <section className="hall-hero px-5 py-6">
          <p className="hall-fade-in font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.28em] uppercase text-[var(--vassal-gold)]">
            Lord&apos;s Hall
            {showDraftLook && settingsDirty ? " · Draft" : ""}
          </p>
          <h1 className="hall-fade-in hall-fade-in-delay mt-2 font-[family-name:var(--font-display)] text-3xl tracking-[0.08em]">
            {data.court.name}
          </h1>
          {displayTagline ? (
            <p className="mt-2 font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)]">
              {displayTagline}
            </p>
          ) : null}
          {data.lord ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href={`/u/${encodeURIComponent(
                  profileHandle({
                    id: data.lord.id,
                    x_username: data.lord.xUsername,
                  }),
                )}`}
                className="font-[family-name:var(--font-display)] text-xs tracking-[0.14em] text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)] hover:text-[var(--vassal-gold)]"
              >
                Lord {data.lord.name}
                {data.lord.xUsername ? ` · @${data.lord.xUsername}` : ""}
                {typeof data.lord.followers === "number"
                  ? ` · ${data.lord.followers} followers`
                  : ""}
              </Link>
              {!data.viewer.isLord && data.viewer.userId !== data.lord.id ? (
                <FollowButton
                  userId={data.lord.id}
                  handle={data.lord.xUsername}
                  initialFollowing={Boolean(data.viewer.isFollowingLord)}
                  size="sm"
                  onChange={({ isFollowing, counts }) =>
                    setData((prev) => ({
                      ...prev,
                      lord: prev.lord
                        ? { ...prev.lord, followers: counts.followers }
                        : prev.lord,
                      viewer: {
                        ...prev.viewer,
                        isFollowingLord: isFollowing,
                      },
                    }))
                  }
                />
              ) : null}
            </div>
          ) : null}
        </section>

        <nav
          className="hall-tabs mt-5"
          aria-label="Hall sections"
        >
          {tabs
            .filter((t) => t.show)
            .map((t) => (
              <button
                key={t.id}
                type="button"
                className={`hall-tab ${tab === t.id ? "hall-tab-active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
        </nav>

        {message ? (
          <p
            role="status"
            className="mt-4 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.12em] text-[var(--vassal-gold)]"
          >
            {message}
          </p>
        ) : null}

        {tab === "scoreboard" ? (
          <section className="dash-panel hall-panel-enter mt-5 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
                  {displaySeasonTitle}
                </h2>
                <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
                  Every vassal sees the same board — replies, reposts, mentions.
                  {previewing && settingsDirty ? " (draft preview)" : ""}
                </p>
              </div>
              {data.season ? (
                <span className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_45%,transparent)]">
                  Ends {formatEnds(data.season.endsAt)}
                </span>
              ) : null}
            </div>

            {data.viewer.isMember ? (
              <div className="hall-log-row mt-4">
                <span className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.16em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                  Log service
                </span>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["replies", "Reply"],
                      ["reposts", "Repost"],
                      ["mentions", "Mention"],
                    ] as const
                  ).map(([field, label]) => (
                    <button
                      key={field}
                      type="button"
                      disabled={busy}
                      onClick={() => void logService(field)}
                      className="hall-chip"
                    >
                      +1 {label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-4 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                Swear fealty to claim a row and log service.
              </p>
            )}

            <ol className="mt-5 flex flex-col gap-4">
              {(data.scoreboard.length
                ? data.scoreboard
                : data.leaderboard.map((r) => ({
                    userId: r.userId,
                    name: r.name,
                    avatarUrl: r.avatarUrl,
                    xUsername: r.xUsername,
                    rank: r.rank,
                    role: r.role,
                    standing: r.standing,
                    replies: 0,
                    reposts: 0,
                    mentions: 0,
                  }))
              )
                .slice()
                .sort((a, b) => seasonPoints(b) - seasonPoints(a))
                .map((row, index) => {
                  const mine = row.userId === data.viewer.userId;
                  return (
                    <li
                      key={row.userId}
                      className={`hall-score-card ${mine ? "hall-score-mine" : ""} ${
                        row.role === "lord" ? "hall-rank-lord" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 font-[family-name:var(--font-display)] text-xs text-[var(--vassal-gold)]">
                          {index + 1}
                        </span>
                        <Link
                          href={`/u/${encodeURIComponent(
                            profileHandle({
                              id: row.userId,
                              x_username: row.xUsername,
                            }),
                          )}`}
                          className="flex min-w-0 flex-1 items-center gap-3 hover:text-[var(--vassal-gold)]"
                        >
                          <Avatar name={row.name} src={row.avatarUrl} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-[family-name:var(--font-display)] text-sm tracking-[0.06em]">
                              {row.name}
                              {row.role === "lord" ? " · Lord" : ""}
                              {mine ? " · You" : ""}
                            </p>
                            <p className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                              {RANK_LABEL[(row.rank as CourtRank) || "serf"] ||
                                row.rank}
                              {" · "}
                              {seasonPoints(row)} season pts
                            </p>
                          </div>
                        </Link>
                      </div>
                      <div className="mt-3 grid gap-2">
                        <Meter
                          label="Replies"
                          value={row.replies}
                          target={displayTargets.replies}
                        />
                        <Meter
                          label="Reposts"
                          value={row.reposts}
                          target={displayTargets.reposts}
                        />
                        <Meter
                          label="Mentions"
                          value={row.mentions}
                          target={displayTargets.mentions}
                        />
                      </div>
                    </li>
                  );
                })}
            </ol>
          </section>
        ) : null}

        {tab === "community" ? (
          <section className="dash-panel hall-panel-enter mt-5 p-4">
            {data.viewer.isMember && !data.viewer.isLord ? (
              <div className="mb-8 border-b border-[color-mix(in_srgb,var(--vassal-gold)_20%,transparent)] pb-8">
                <PetitionCompose
                  courtSlug={data.court.slug}
                  subtitle={`Ask ${data.lord?.name || "your Lord"}. They seal grant, defer, or deny on their dashboard.`}
                />
              </div>
            ) : null}
            {data.viewer.isLord ? (
              <p className="mb-6 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
                Vassal petitions land on your{" "}
                <Link href="/dashboard" className="text-[var(--vassal-gold)] underline-offset-4 hover:underline">
                  dashboard
                </Link>{" "}
                to seal.
              </p>
            ) : null}
            {!data.viewer.isMember ? (
              <p className="mb-6 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
                Swear fealty to file a petition with this Lord.
              </p>
            ) : null}

            {displayWidget === "playlist" ? (
              <>
                <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
                  Court playlist
                </h2>
                <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
                  Shared queue — vassals add tracks the whole court can open.
                </p>

                <div className="hall-player mt-5">
                  {activeTrack ? (
                    <>
                      <p className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.2em] uppercase text-[var(--vassal-gold)]">
                        Now playing
                      </p>
                      <p className="hall-now-playing mt-2 font-[family-name:var(--font-display)] text-xl tracking-[0.06em]">
                        {activeTrack.title}
                      </p>
                      <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)]">
                        {activeTrack.artist || "Unknown artist"}
                        {activeTrack.by ? ` · queued by ${activeTrack.by}` : ""}
                      </p>
                      {activeTrack.url ? (
                        <a
                          href={activeTrack.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex border border-[color-mix(in_srgb,var(--vassal-gold)_45%,transparent)] px-4 py-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase text-[var(--vassal-gold)]"
                        >
                          Open track
                        </a>
                      ) : null}
                    </>
                  ) : (
                    <p className="font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                      Queue is empty — add the first track.
                    </p>
                  )}
                </div>

                {data.viewer.isMember ? (
                  <div className="mt-5 flex flex-col gap-2">
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
                      placeholder="Spotify / YouTube / SoundCloud link"
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

                <ul className="mt-5 flex flex-col gap-2">
                  {data.playlist.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        className={`hall-track-btn ${
                          activeTrack?.id === t.id ? "hall-track-active" : ""
                        }`}
                        onClick={() => setActiveTrackId(t.id)}
                      >
                        <span className="block truncate font-[family-name:var(--font-display)] text-sm tracking-[0.06em]">
                          {t.title}
                          {t.artist ? ` — ${t.artist}` : ""}
                        </span>
                        <span className="mt-1 block text-xs text-[color-mix(in_srgb,var(--vassal-cream)_50%,transparent)]">
                          {t.by ? `Added by ${t.by}` : "Court track"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {displayWidget === "moodboard" ? (
              <>
                <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
                  Mood board
                </h2>
                <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
                  Shared pins — drop image links from anywhere on the open web.
                </p>

                {data.viewer.isMember ? (
                  <div className="mt-5 flex flex-col gap-2">
                    <input
                      value={pinImage}
                      onChange={(e) => setPinImage(e.target.value)}
                      placeholder="Image URL (https://…)"
                      className="auth-input border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
                    />
                    <input
                      value={pinSource}
                      onChange={(e) => setPinSource(e.target.value)}
                      placeholder="Source link (optional)"
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

                <div className="hall-mood-grid mt-5">
                  {data.moodboard.length === 0 ? (
                    <p className="col-span-full font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                      No pins yet — drop the first image.
                    </p>
                  ) : (
                    data.moodboard.map((p) => (
                      <a
                        key={p.id}
                        href={p.sourceUrl || p.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hall-pin hall-pin-reveal block overflow-hidden"
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
              </>
            ) : null}

            {displayWidget === "api" ? (
              <>
                <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
                  API import
                </h2>
                <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
                  Paste a public JSON API — the hall fetches and shows the feed.
                </p>

                {data.viewer.isMember ? (
                  <div className="mt-5 flex flex-col gap-2">
                    <input
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="https://api.example.com/feed.json"
                      className="auth-input border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
                    />
                    <input
                      value={apiLabel}
                      onChange={(e) => setApiLabel(e.target.value)}
                      placeholder="Label (optional)"
                      className="auth-input border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
                    />
                    <input
                      value={apiJsonPath}
                      onChange={(e) => setApiJsonPath(e.target.value)}
                      placeholder="JSON path (optional, e.g. data.items)"
                      className="auth-input border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
                    />
                    <div className="mt-1 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy || apiLoading}
                        onClick={() => void previewApiFeed()}
                        className="border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-3 py-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        disabled={busy || apiLoading}
                        onClick={() => void importApiFeed()}
                        className="border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_28%,transparent)] px-3 py-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase"
                      >
                        Import API
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                    Swear fealty to import your own API feed.
                  </p>
                )}

                {data.apiFeeds.length > 0 ? (
                  <ul className="mt-5 flex flex-col gap-2">
                    {data.apiFeeds.map((feed) => {
                      const active = activeFeed?.id === feed.id;
                      const canRemove =
                        data.viewer.isLord ||
                        (data.viewer.userId &&
                          feed.userId === data.viewer.userId);
                      return (
                        <li key={feed.id} className="flex items-stretch gap-2">
                          <button
                            type="button"
                            className={`hall-track-btn min-w-0 flex-1 ${
                              active ? "hall-track-active" : ""
                            }`}
                            onClick={() => setActiveFeedId(feed.id)}
                          >
                            <span className="block truncate font-[family-name:var(--font-display)] text-sm tracking-[0.06em]">
                              {feed.label || "Untitled feed"}
                            </span>
                            <span className="mt-1 block truncate text-xs text-[color-mix(in_srgb,var(--vassal-cream)_50%,transparent)]">
                              {feed.by ? `Imported by ${feed.by} · ` : ""}
                              {feed.apiUrl}
                            </span>
                          </button>
                          {canRemove ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void removeFeed(feed.id)}
                              className="shrink-0 border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] px-2 font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.12em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_60%,transparent)]"
                            >
                              Remove
                            </button>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}

                <div className="mt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
                      {activeFeed
                        ? activeFeed.label || "Feed items"
                        : "Feed items"}
                    </p>
                    {activeFeed ? (
                      <button
                        type="button"
                        disabled={apiLoading}
                        onClick={() => void loadFeedItems(activeFeed.id)}
                        className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]"
                      >
                        {apiLoading ? "Loading…" : "Refresh"}
                      </button>
                    ) : null}
                  </div>
                  {apiLoading && visibleApiItems.length === 0 ? (
                    <p className="mt-3 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                      Fetching API…
                    </p>
                  ) : null}
                  {!apiLoading && !activeFeed ? (
                    <p className="mt-3 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                      No feeds yet — import a public JSON API to begin.
                    </p>
                  ) : null}
                  {!apiLoading && activeFeed && visibleApiItems.length === 0 ? (
                    <p className="mt-3 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                      No items found. Try a JSON path like data.items.
                    </p>
                  ) : null}
                  <ul className="mt-3 flex flex-col gap-3">
                    {visibleApiItems.map((item, index) => (
                      <li key={`${item.title}-${index}`} className="hall-api-item">
                        <div className="flex gap-3">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="h-16 w-16 shrink-0 object-cover"
                            />
                          ) : null}
                          <div className="min-w-0 flex-1">
                            {item.url ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-[family-name:var(--font-display)] text-sm tracking-[0.06em] text-[var(--vassal-cream)] hover:text-[var(--vassal-gold)]"
                              >
                                {item.title}
                              </a>
                            ) : (
                              <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.06em]">
                                {item.title}
                              </p>
                            )}
                            {item.subtitle ? (
                              <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
                                {item.subtitle}
                              </p>
                            ) : null}
                            {item.description ? (
                              <p className="mt-1 font-[family-name:var(--font-body)] text-sm text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)]">
                                {item.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}

            {displayWidget === "none" ? (
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
                  Community space
                </h2>
                <p className="mt-2 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
                  {data.viewer.isLord
                    ? previewing && draft.widget === "none"
                      ? "Draft preview: no community widget selected. Save from Lord setup when ready."
                      : "Open Lord setup to add a playlist, mood board, or API import widget."
                    : "Your Lord has not enabled a community widget yet. Check the scoreboard while you wait."}
                </p>
                {data.viewer.isLord ? (
                  <button
                    type="button"
                    className="mt-4 border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-4 py-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase"
                    onClick={() => setTab("setup")}
                  >
                    Open Lord setup
                  </button>
                ) : null}
              </div>
            ) : null}

            {data.viewer.isMember && !data.viewer.isLord ? (
              <div className="mt-8">
                <ScrollComposer kind="nominate_lord" courtSlug={data.court.slug} />
              </div>
            ) : null}
          </section>
        ) : null}

        {tab === "setup" && data.viewer.isLord ? (
          <section className="dash-panel hall-panel-enter mt-5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
                  Make the hall yours
                </h2>
                <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
                  Customize as a draft, preview the hall, then save when it looks
                  right.
                </p>
              </div>
              <p
                className={`font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase ${
                  settingsDirty
                    ? "text-[var(--vassal-gold)]"
                    : "text-[color-mix(in_srgb,var(--vassal-cream)_45%,transparent)]"
                }`}
              >
                {settingsDirty ? "Unsaved changes" : "All changes saved"}
              </p>
            </div>

            <div className="mt-5">
              <span className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase text-[var(--vassal-gold)]">
                Hall theme
              </span>
              <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                Live on this page — the shell updates as you pick.
              </p>
              <div className="hall-theme-swatches mt-2">
                {HALL_THEMES.map((t) => {
                  const active = draft.theme === t;
                  const swatch = THEME_SWATCH[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={busy}
                      className={`hall-theme-swatch ${active ? "hall-theme-swatch-active" : ""}`}
                      onClick={() =>
                        setDraft((prev) => ({ ...prev, theme: t }))
                      }
                    >
                      <span
                        className="hall-theme-chip"
                        style={
                          {
                            "--swatch-a": swatch.a,
                            "--swatch-b": swatch.b,
                          } as CSSProperties
                        }
                      />
                      <span className="block font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.08em]">
                        {THEME_LABEL[t]}
                      </span>
                      <span className="mt-1 block font-[family-name:var(--font-body)] text-[0.7rem] italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                        {THEME_BLURB[t]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <span className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase text-[var(--vassal-gold)]">
                Add a widget
              </span>
              <div className="hall-widget-options mt-2">
                {HALL_WIDGETS.map((w) => {
                  const active = draft.widget === w;
                  return (
                    <button
                      key={w}
                      type="button"
                      disabled={busy}
                      className={`hall-widget-option ${active ? "hall-widget-option-active" : ""}`}
                      onClick={() =>
                        setDraft((prev) => ({ ...prev, widget: w }))
                      }
                    >
                      <span className="block font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.1em] uppercase">
                        {WIDGET_LABEL[w]}
                      </span>
                      <span className="mt-1 block font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_60%,transparent)]">
                        {WIDGET_BLURB[w]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-4 block">
              <span className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase text-[var(--vassal-gold)]">
                Tagline
              </span>
              <input
                value={draft.tagline}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, tagline: e.target.value }))
                }
                placeholder="Short tagline for your hall"
                className="auth-input mt-2 w-full border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
              />
            </label>

            <div className="mt-6 border-t border-[color-mix(in_srgb,var(--vassal-gold)_18%,transparent)] pt-5">
              <h3 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
                Season targets
              </h3>
              <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
                Goals every vassal sees on the shared scoreboard.
              </p>
              <label className="mt-4 block">
                <span className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase text-[var(--vassal-gold)]">
                  Season title
                </span>
                <input
                  value={draft.seasonTitle}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      seasonTitle: e.target.value,
                    }))
                  }
                  className="auth-input mt-2 w-full border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
                />
              </label>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.14em] uppercase text-[var(--vassal-gold)]">
                    Replies
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={draft.targetReplies}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        targetReplies: e.target.value,
                      }))
                    }
                    className="auth-input mt-2 w-full border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.14em] uppercase text-[var(--vassal-gold)]">
                    Reposts
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={draft.targetReposts}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        targetReposts: e.target.value,
                      }))
                    }
                    className="auth-input mt-2 w-full border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.14em] uppercase text-[var(--vassal-gold)]">
                    Mentions
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={draft.targetMentions}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        targetMentions: e.target.value,
                      }))
                    }
                    className="auth-input mt-2 w-full border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
                  />
                </label>
              </div>
            </div>

            <div className="hall-settings-actions mt-6">
              <button
                type="button"
                disabled={busy}
                onClick={previewDraft}
                className="border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-4 py-2.5 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase"
              >
                Preview hall
              </button>
              <button
                type="button"
                disabled={busy || !settingsDirty}
                onClick={() => void saveHallSettings()}
                className="border border-[color-mix(in_srgb,var(--vassal-gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-4 py-2.5 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save settings"}
              </button>
              <button
                type="button"
                disabled={busy || !settingsDirty}
                onClick={discardDraft}
                className="border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] px-4 py-2.5 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)] disabled:opacity-50"
              >
                Discard
              </button>
            </div>

            <div className="mt-6">
              <ScrollComposer
                kind="vassal"
                courtSlug={data.court.slug}
                heading="Vassal summons"
                subtitle="Customize a parchment scroll and send the link to prospective members."
              />
            </div>
          </section>
        ) : null}

        {data.viewer.isLord && settingsDirty && !previewing ? (
          <div className="hall-settings-bar">
            <p className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase text-[var(--vassal-gold)]">
              Unsaved hall settings
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={previewDraft}
                className="border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-3 py-2 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase"
              >
                Preview
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void saveHallSettings()}
                className="border border-[color-mix(in_srgb,var(--vassal-gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_35%,transparent)] px-3 py-2 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase"
              >
                Save
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={discardDraft}
                className="border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] px-3 py-2 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]"
              >
                Discard
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function Meter({
  label,
  value,
  target,
}: {
  label: string;
  value: number;
  target: number;
}) {
  const width = pct(value, target);
  return (
    <div>
      <div className="mb-1 flex justify-between gap-2 font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.12em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
        <span>{label}</span>
        <span>
          {value}/{target}
        </span>
      </div>
      <div className="hall-meter">
        <div className="hall-meter-fill" style={{ width: `${width}%` }} />
      </div>
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
