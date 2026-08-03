"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import type { Petition } from "../lib/features";
import { holdingHomeHref, LANDING_HREF } from "../lib/home";
import type { CourtRank } from "../lib/ranks";
import {
  CourtPanel,
  type CourtMembershipSummary,
  type PendingJoinSummary,
} from "./CourtPanel";
import { FealtyQueue, type FealtyQueueItem } from "./FealtyQueue";
import { PetitionCompose } from "./PetitionCompose";
import { PetitionCourt } from "./PetitionCourt";
import { VassalLogo } from "./VassalLogo";

export type DecreePost = {
  id: string;
  body: string;
  createdAt: string;
};

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
  follows: {
    followers: number;
    following: number;
    handle: string;
  };
  stats: {
    tenants: number;
    openPetitions: number;
    standingAvg: number;
  };
  decree: string;
  decrees: DecreePost[];
  petitions: Petition[];
  tenants: Array<{
    id: string;
    name: string;
    rank: string;
    standing: number;
    status: string;
  }>;
  court: CourtMembershipSummary | null;
  pendingJoin?: PendingJoinSummary | null;
  waitlist?: FealtyQueueItem[];
};

type DashboardShellProps = {
  initialData: DashboardData | null;
  loadError?: string;
};

type TabId = "overview" | "court" | "petitions" | "tenants";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "court", label: "Court" },
  { id: "petitions", label: "Petitions" },
  { id: "tenants", label: "Tenants" },
];

export function DashboardShell({ initialData, loadError }: DashboardShellProps) {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(initialData);
  const [tab, setTab] = useState<TabId>(
    initialData?.user.holding === "fan" && !initialData.court ? "court" : "overview",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [decreeDraft, setDecreeDraft] = useState("");
  const [savingDecree, setSavingDecree] = useState(false);
  const [decreeMessage, setDecreeMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [uploading, setUploading] = useState<"avatar" | "header" | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const headerInput = useRef<HTMLInputElement>(null);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const saveDecree = async () => {
    if (!data) return;
    const text = decreeDraft.trim();
    if (!text) {
      setDecreeMessage({ type: "err", text: "Write a decree before posting." });
      return;
    }
    setSavingDecree(true);
    setDecreeMessage(null);
    try {
      const res = await fetch("/api/decree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decree: text }),
      });
      const json = (await res.json().catch(() => null)) as {
        error?: string;
        decree?: string;
        post?: DecreePost;
      } | null;
      if (!res.ok || !json?.post) {
        setDecreeMessage({
          type: "err",
          text:
            res.status === 401
              ? "Session expired — log in again."
              : json?.error || "Could not post decree.",
        });
        return;
      }
      setData({
        ...data,
        decree: json.decree ?? text,
        decrees: [json.post, ...(data.decrees ?? [])],
      });
      setDecreeDraft("");
      setDecreeMessage({ type: "ok", text: "Posted to the decree feed." });
    } catch {
      setDecreeMessage({ type: "err", text: "Could not reach the realm." });
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
  const lordSetupHref = holdingHomeHref(
    data.court
      ? { slug: data.court.slug, role: data.court.role }
      : null,
  );

  const selectTab = (id: TabId) => {
    setTab(id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-dvh bg-[var(--vassal-black)] text-[var(--vassal-cream)] lg:flex">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-[color-mix(in_srgb,var(--vassal-red)_40%,transparent)] bg-[color-mix(in_srgb,var(--vassal-black)_92%,transparent)] px-4 py-3 backdrop-blur-md lg:hidden">
        <button
          type="button"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center border border-[color-mix(in_srgb,var(--vassal-gold)_35%,transparent)]"
        >
          <span className="sr-only">Menu</span>
          <span aria-hidden className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-4 bg-[var(--vassal-cream)]" />
            <span className="block h-0.5 w-4 bg-[var(--vassal-cream)]" />
            <span className="block h-0.5 w-4 bg-[var(--vassal-cream)]" />
          </span>
        </button>
        <Link href={LANDING_HREF} className="flex items-center gap-2">
          <VassalLogo size={32} />
          <span className="font-[family-name:var(--font-display)] text-sm tracking-[0.28em]">
            VASSAL
          </span>
        </Link>
        <Link
          href={lordSetupHref}
          aria-label="Open your lord dashboard setup"
          className="rounded-full"
        >
          <UserAvatar
            name={data.user.name}
            avatarUrl={data.user.avatarUrl}
            size="sm"
          />
        </Link>
      </header>

      {/* Backdrop for mobile drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

      {/* Sidebar */}
      <aside
        className={`dash-sidebar fixed inset-y-0 left-0 z-50 flex w-[min(86vw,17.5rem)] flex-col transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-60 lg:translate-x-0 lg:border-r lg:border-[color-mix(in_srgb,var(--vassal-red)_35%,transparent)] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <Link href={LANDING_HREF} className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <VassalLogo size={36} />
            <span className="font-[family-name:var(--font-display)] text-sm tracking-[0.28em]">
              VASSAL
            </span>
          </Link>
        </div>

        <div className="mx-5 h-px bg-[color-mix(in_srgb,var(--vassal-red)_40%,transparent)]" />

        <Link
          href={lordSetupHref}
          onClick={() => setSidebarOpen(false)}
          aria-label="Open your lord dashboard setup"
          className="flex items-center gap-3 px-5 py-5 transition hover:bg-[color-mix(in_srgb,var(--vassal-red)_12%,transparent)]"
        >
          <UserAvatar
            name={data.user.name}
            avatarUrl={data.user.avatarUrl}
            size="md"
          />
          <div className="min-w-0 text-left">
            <p className="truncate font-[family-name:var(--font-display)] text-sm tracking-[0.08em] text-[var(--vassal-cream)]">
              {data.user.name}
            </p>
            <p className="mt-0.5 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase text-[var(--vassal-gold)]">
              {data.court?.role === "lord"
                ? "Lord setup"
                : isFan
                  ? "Fan Court"
                  : "Estate"}
            </p>
            {data.user.xUsername ? (
              <p className="mt-1 truncate font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.08em] text-[color-mix(in_srgb,var(--vassal-cream)_50%,transparent)]">
                @{data.user.xUsername}
              </p>
            ) : null}
          </div>
        </Link>

        <nav className="mt-2 flex flex-1 flex-col gap-1 px-3" aria-label="Dashboard">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectTab(item.id)}
              className={`px-3 py-2.5 text-left font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.16em] uppercase transition ${
                tab === item.id
                  ? "border-l-2 border-[var(--vassal-blood)] bg-[color-mix(in_srgb,var(--vassal-red)_18%,transparent)] text-[var(--vassal-cream)]"
                  : "border-l-2 border-transparent text-[color-mix(in_srgb,var(--vassal-cream)_60%,transparent)] hover:text-[var(--vassal-cream)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t border-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] px-5 py-5">
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-3 py-2.5 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.2em] uppercase transition hover:border-[var(--vassal-blood)] hover:bg-[color-mix(in_srgb,var(--vassal-red)_20%,transparent)]"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-5xl">
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
                    <div className="mt-2 flex flex-wrap gap-4">
                      <Link
                        href={`/u/${encodeURIComponent(data.follows.handle)}?tab=followers`}
                        className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.12em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)] hover:text-[var(--vassal-gold)]"
                      >
                        <span className="text-[var(--vassal-gold)]">
                          {data.follows.followers}
                        </span>{" "}
                        Followers
                      </Link>
                      <Link
                        href={`/u/${encodeURIComponent(data.follows.handle)}?tab=following`}
                        className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.12em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)] hover:text-[var(--vassal-gold)]"
                      >
                        <span className="text-[var(--vassal-gold)]">
                          {data.follows.following}
                        </span>{" "}
                        Following
                      </Link>
                      <Link
                        href={`/u/${encodeURIComponent(data.follows.handle)}`}
                        className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.12em] uppercase text-[var(--vassal-gold)]"
                      >
                        Public profile →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {tab === "overview" && (
            <>
              {data.court ? (
                <section className="mb-6">
                  <Link
                    href={lordSetupHref}
                    className="dash-panel flex items-center justify-between gap-3 px-4 py-4 transition hover:border-[color-mix(in_srgb,var(--vassal-blood)_45%,transparent)]"
                  >
                    <div>
                      <p className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.2em] uppercase text-[var(--vassal-gold)]">
                        {data.court.role === "lord"
                          ? "Lord setup"
                          : "Lord\u2019s Hall"}
                      </p>
                      <p className="mt-1 font-[family-name:var(--font-display)] text-lg tracking-[0.06em]">
                        {data.court.name}
                      </p>
                      <p className="mt-1 text-xs tracking-[0.12em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                        {(data.court.rank as string) || "serf"} ·{" "}
                        {data.court.role === "lord"
                          ? "open setup"
                          : "enter retinue"}
                      </p>
                    </div>
                    <span className="font-[family-name:var(--font-display)] text-xs tracking-[0.18em] uppercase text-[var(--vassal-blood)]">
                      Open →
                    </span>
                  </Link>
                </section>
              ) : data.user.holding === "fan" ? (
                <section className="mb-6">
                  <button
                    type="button"
                    onClick={() => setTab("court")}
                    className="dash-panel w-full px-4 py-4 text-left"
                  >
                    <p className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.2em] uppercase text-[var(--vassal-gold)]">
                      Fealty
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-lg tracking-[0.06em]">
                      Join or open a court
                    </p>
                  </button>
                </section>
              ) : null}
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
                  <p className="mt-2 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
                    Seal words for the court feed.
                  </p>
                  <textarea
                    value={decreeDraft}
                    onChange={(e) => {
                      setDecreeDraft(e.target.value);
                      if (decreeMessage) setDecreeMessage(null);
                    }}
                    rows={3}
                    placeholder="Speak to your holding…"
                    className="auth-input mt-3 w-full resize-none border border-[color-mix(in_srgb,var(--vassal-gold)_25%,transparent)] bg-transparent px-3 py-2 font-[family-name:var(--font-body)] text-base italic leading-relaxed text-[var(--vassal-cream)] outline-none focus:border-[var(--vassal-blood)]"
                  />
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void saveDecree()}
                      disabled={savingDecree}
                      className="border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_28%,transparent)] px-4 py-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.18em] uppercase transition hover:border-[var(--vassal-blood)] disabled:opacity-60"
                    >
                      {savingDecree ? "Posting…" : "Post decree"}
                    </button>
                    {decreeMessage ? (
                      <p
                        role="status"
                        className={`font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.12em] ${
                          decreeMessage.type === "ok"
                            ? "text-[var(--vassal-gold)]"
                            : "text-[var(--vassal-blood)]"
                        }`}
                      >
                        {decreeMessage.text}
                      </p>
                    ) : null}
                  </div>
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
                    <Pulse
                      text={
                        (data.decrees?.length ?? 0) > 0
                          ? `${data.decrees.length} decrees on the feed`
                          : "No decrees posted yet"
                      }
                    />
                  </ul>
                </div>
              </section>

              <section className="dash-panel mt-8 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
                    Decree feed
                  </h2>
                  <p className="font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_60%,transparent)]">
                    Latest seals for your court.
                  </p>
                </div>
                {(data.decrees?.length ?? 0) === 0 ? (
                  <p className="mt-5 font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                    No decrees yet. Post above to open the feed.
                  </p>
                ) : (
                  <ol className="mt-5 flex flex-col gap-4">
                    {data.decrees.map((post) => (
                      <li key={post.id} className="decree-post">
                        <time
                          dateTime={post.createdAt}
                          className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.2em] uppercase text-[var(--vassal-gold)]"
                        >
                          {formatDecreeTime(post.createdAt)}
                        </time>
                        <p className="mt-2 font-[family-name:var(--font-body)] text-base italic leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_88%,transparent)]">
                          {post.body}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </>
          )}

          {tab === "court" && (
            <section className="mt-8">
              <CourtPanel
                holding={data.user.holding}
                membership={data.court}
                pendingJoin={data.pendingJoin ?? null}
                onPendingJoin={(pendingJoin) =>
                  setData({ ...data, pendingJoin })
                }
                onMembership={(court) =>
                  setData({
                    ...data,
                    court: court
                      ? {
                          ...court,
                          rank: (court.rank as CourtRank) || "serf",
                        }
                      : null,
                    pendingJoin: null,
                  })
                }
              />
              {data.court?.role === "lord" ? (
                <FealtyQueue
                  seed={data.waitlist ?? []}
                  onChange={(waitlist) => setData({ ...data, waitlist })}
                />
              ) : null}
            </section>
          )}

          {tab === "petitions" && (
            <section className="mt-8 flex flex-col gap-10">
              {data.court?.role === "vassal" ? (
                <PetitionCompose
                  courtSlug={data.court.slug}
                  subtitle={`Ask the Lord of ${data.court.name}. They seal on their board.`}
                />
              ) : null}

              {data.court?.role === "vassal" && data.petitions.length === 0 ? null : (
                <>
                  {data.petitions.length === 0 ? (
                    <Empty
                      label={
                        data.court?.role === "vassal"
                          ? "You seal nothing here — file above, then wait."
                          : "No petitions yet. Members file from your hall or profile."
                      }
                    />
                  ) : (
                    <PetitionCourt
                      title="Petition board"
                      subtitle="Grant, defer, or deny."
                      seed={data.petitions}
                      grantLabel="Grant"
                      persist
                    />
                  )}
                </>
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
        </div>
      </main>
    </div>
  );
}

function UserAvatar({
  name,
  avatarUrl,
  size,
}: {
  name: string;
  avatarUrl: string | null;
  size: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8 text-xs" : "h-11 w-11 text-sm";
  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] bg-[var(--vassal-stone)] ${dim}`}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] text-[var(--vassal-gold)]">
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}
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

function formatDecreeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sealed";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
