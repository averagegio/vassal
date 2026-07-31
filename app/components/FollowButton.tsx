"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FollowButtonProps = {
  userId: string;
  handle?: string | null;
  initialFollowing: boolean;
  onChange?: (state: {
    isFollowing: boolean;
    counts: { followers: number; following: number };
  }) => void;
  size?: "sm" | "md";
};

export function FollowButton({
  userId,
  handle,
  initialFollowing,
  onChange,
  size = "md",
}: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/follow", {
        method: following ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, handle: handle || undefined }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const json = (await res.json()) as {
        error?: string;
        isFollowing?: boolean;
        counts?: { followers: number; following: number };
      };
      if (!res.ok) return;
      const next = Boolean(json.isFollowing);
      setFollowing(next);
      if (json.counts) onChange?.({ isFollowing: next, counts: json.counts });
    } finally {
      setBusy(false);
    }
  };

  const pad = size === "sm" ? "px-3 py-1.5 text-[0.55rem]" : "px-4 py-2 text-[0.65rem]";

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void toggle()}
      className={`border font-[family-name:var(--font-display)] tracking-[0.16em] uppercase transition disabled:opacity-60 ${pad} ${
        following
          ? "border-[color-mix(in_srgb,var(--vassal-cream)_35%,transparent)] text-[color-mix(in_srgb,var(--vassal-cream)_75%,transparent)] hover:border-[var(--vassal-blood)]"
          : "border-[color-mix(in_srgb,var(--vassal-gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_32%,transparent)] text-[var(--vassal-cream)] hover:bg-[color-mix(in_srgb,var(--vassal-red)_45%,transparent)]"
      }`}
    >
      {busy ? "…" : following ? "Following" : "Follow"}
    </button>
  );
}
