"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { profileHandle } from "../lib/profile";
import { FollowButton } from "./FollowButton";
import { PetitionCompose } from "./PetitionCompose";
import { VassalLogo } from "./VassalLogo";

export type ProfileListPerson = {
  id: string;
  name: string;
  xUsername: string | null;
  avatarUrl: string | null;
  holding: "fan" | "estate";
  handle: string;
};

export type PublicProfileData = {
  user: {
    id: string;
    name: string;
    holding: "fan" | "estate";
    decree: string;
    xUsername: string | null;
    avatarUrl: string | null;
    headerUrl: string | null;
  };
  counts: { followers: number; following: number };
  isFollowing: boolean;
  isSelf: boolean;
  court: { slug: string; name: string; role: "lord" | "vassal" } | null;
  followers: ProfileListPerson[];
  following: ProfileListPerson[];
};

type Tab = "about" | "followers" | "following";

export function PublicProfile({
  initial,
  initialTab,
}: {
  initial: PublicProfileData;
  initialTab?: Tab;
}) {
  const [data, setData] = useState(initial);
  const [tab, setTab] = useState<Tab>(initialTab ?? "about");
  const handle = useMemo(
    () =>
      profileHandle({
        id: data.user.id,
        x_username: data.user.xUsername,
      }),
    [data.user.id, data.user.xUsername],
  );

  const people = tab === "followers" ? data.followers : data.following;

  return (
    <div className="min-h-dvh bg-[var(--vassal-black)] text-[var(--vassal-cream)]">
      <header className="sticky top-0 z-30 border-b border-[color-mix(in_srgb,var(--vassal-gold)_28%,transparent)] bg-[color-mix(in_srgb,var(--vassal-black)_88%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <VassalLogo size={28} />
            <span className="font-[family-name:var(--font-display)] text-xs tracking-[0.24em]">
              PROFILE
            </span>
          </Link>
          {data.isSelf ? (
            <Link
              href="/dashboard"
              className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.16em] uppercase text-[var(--vassal-gold)]"
            >
              Your holding
            </Link>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 pb-16">
        <section className="profile-banner overflow-hidden border border-[color-mix(in_srgb,var(--vassal-gold)_24%,transparent)]">
          <div
            className="h-36 bg-[linear-gradient(120deg,#2a0a10,#120608_55%,#1a0c08)] sm:h-40"
            style={
              data.user.headerUrl
                ? {
                    backgroundImage: `linear-gradient(180deg,rgba(7,4,5,0.2),rgba(7,4,5,0.65)), url(${data.user.headerUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          />
          <div className="relative px-5 pb-5">
            <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <Avatar name={data.user.name} src={data.user.avatarUrl} large />
                <div className="pb-1">
                  <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.28em] uppercase text-[var(--vassal-gold)]">
                    {data.user.holding === "fan" ? "Fan Court" : "Estate"}
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
              {!data.isSelf ? (
                <FollowButton
                  userId={data.user.id}
                  handle={handle}
                  initialFollowing={data.isFollowing}
                  onChange={({ isFollowing, counts }) =>
                    setData((prev) => ({ ...prev, counts, isFollowing }))
                  }
                />
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-5">
              <button
                type="button"
                className="text-left"
                onClick={() => setTab("followers")}
              >
                <span className="font-[family-name:var(--font-display)] text-lg tracking-[0.06em] text-[var(--vassal-gold)]">
                  {data.counts.followers}
                </span>
                <span className="ml-2 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.16em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                  Followers
                </span>
              </button>
              <button
                type="button"
                className="text-left"
                onClick={() => setTab("following")}
              >
                <span className="font-[family-name:var(--font-display)] text-lg tracking-[0.06em] text-[var(--vassal-gold)]">
                  {data.counts.following}
                </span>
                <span className="ml-2 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.16em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                  Following
                </span>
              </button>
            </div>
          </div>
        </section>

        <nav className="hall-tabs mt-5" aria-label="Profile sections">
          {(
            [
              ["about", "About"],
              ["followers", "Followers"],
              ["following", "Following"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`hall-tab ${tab === id ? "hall-tab-active" : ""}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === "about" ? (
          <section className="dash-panel mt-5 p-4">
            {data.user.decree ? (
              <>
                <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
                  Decree
                </h2>
                <p className="mt-2 font-[family-name:var(--font-body)] text-base italic text-[color-mix(in_srgb,var(--vassal-cream)_80%,transparent)]">
                  {data.user.decree}
                </p>
              </>
            ) : (
              <p className="font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                No decree posted yet.
              </p>
            )}
            {data.court ? (
              <Link
                href={`/hall/${data.court.slug}`}
                className="mt-5 inline-flex border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-4 py-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase"
              >
                {data.court.role === "lord" ? "Enter their hall" : "Shared hall"}{" "}
                · {data.court.name}
              </Link>
            ) : null}
            <p className="mt-4 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_50%,transparent)]">
              Follow to keep them in your court circle. Swearing fealty (joining a
              hall) is separate.
            </p>
            {!data.isSelf ? (
              <div className="mt-8 border-t border-[color-mix(in_srgb,var(--vassal-gold)_20%,transparent)] pt-6">
                <PetitionCompose
                  toHandle={handle}
                  title="Petition this holding"
                  subtitle={
                    data.user.holding === "estate"
                      ? "Send a repair, renewal, or house ask. They seal on their dashboard."
                      : "Ask for access, favor, or an audience. They seal on their dashboard."
                  }
                />
              </div>
            ) : null}
          </section>
        ) : (
          <section className="dash-panel mt-5 p-4">
            <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
              {tab === "followers" ? "Followers" : "Following"}
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {people.length === 0 ? (
                <li className="font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                  {tab === "followers"
                    ? "No followers yet."
                    : "Not following anyone yet."}
                </li>
              ) : (
                people.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/u/${encodeURIComponent(p.handle)}`}
                      className="flex items-center gap-3 py-1 transition hover:text-[var(--vassal-gold)]"
                    >
                      <Avatar name={p.name} src={p.avatarUrl} />
                      <div className="min-w-0">
                        <p className="truncate font-[family-name:var(--font-display)] text-sm tracking-[0.06em]">
                          {p.name}
                        </p>
                        <p className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.12em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_50%,transparent)]">
                          {p.xUsername ? `@${p.xUsername}` : p.holding}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function Avatar({
  name,
  src,
  large,
}: {
  name: string;
  src?: string | null;
  large?: boolean;
}) {
  const size = large
    ? "h-20 w-20 sm:h-24 sm:w-24 border-2 border-[var(--vassal-black)]"
    : "h-9 w-9 border border-[color-mix(in_srgb,var(--vassal-gold)_35%,transparent)]";
  return (
    <div
      className={`${size} shrink-0 overflow-hidden rounded-full bg-[var(--vassal-stone)]`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] text-xs text-[var(--vassal-gold)] sm:text-sm">
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}
    </div>
  );
}
