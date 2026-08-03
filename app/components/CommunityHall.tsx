"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { HallCommentJson } from "../lib/comments";
import { profileHandle } from "../lib/profile";
import { RANK_LABEL, type CourtRank } from "../lib/ranks";

export type CommunityHallProps = {
  comments: HallCommentJson[];
  courtSlug: string;
  isMember: boolean;
  isLord: boolean;
  waitlisted?: boolean;
  viewerUserId?: string | null;
  busy?: boolean;
  onPost: (body: string, parentId?: string | null) => Promise<boolean>;
  onCheer: (commentId: string) => Promise<void>;
  onRemove: (commentId: string) => Promise<void>;
  onNeedAuth: () => void;
};

function formatWhen(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function CommunityHall({
  comments,
  courtSlug,
  isMember,
  isLord,
  waitlisted,
  viewerUserId,
  busy,
  onPost,
  onCheer,
  onRemove,
  onNeedAuth,
}: CommunityHallProps) {
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");

  const threads = useMemo(() => {
    const roots = comments.filter((c) => !c.parentId);
    const byParent = new Map<string, HallCommentJson[]>();
    for (const c of comments) {
      if (!c.parentId) continue;
      const list = byParent.get(c.parentId) ?? [];
      list.push(c);
      byParent.set(c.parentId, list);
    }
    for (const list of byParent.values()) {
      list.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }
    return roots.map((root) => ({
      root,
      replies: byParent.get(root.id) ?? [],
    }));
  }, [comments]);

  const submitRoot = async () => {
    if (!isMember) {
      onNeedAuth();
      return;
    }
    const ok = await onPost(draft);
    if (ok) setDraft("");
  };

  const submitReply = async (parentId: string) => {
    if (!isMember) {
      onNeedAuth();
      return;
    }
    const ok = await onPost(replyDraft, parentId);
    if (ok) {
      setReplyDraft("");
      setReplyTo(null);
    }
  };

  return (
    <div className="hall-community">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
            Community hall
          </h2>
          <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
            Speak, reply, and cheer — season points come from service in this
            court.
          </p>
        </div>
        <span className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_45%,transparent)]">
          {comments.length} {comments.length === 1 ? "word" : "words"}
        </span>
      </div>

      {isMember ? (
        <div className="hall-comment-compose mt-5">
          <label className="sr-only" htmlFor={`hall-speak-${courtSlug}`}>
            Speak in the hall
          </label>
          <textarea
            id={`hall-speak-${courtSlug}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            maxLength={800}
            placeholder="Address the court…"
            className="auth-input w-full resize-y border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2 font-[family-name:var(--font-body)] text-sm italic"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.12em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_40%,transparent)]">
              {draft.trim().length}/800
            </span>
            <button
              type="button"
              disabled={busy || !draft.trim()}
              onClick={() => void submitRoot()}
              className="border border-[color-mix(in_srgb,var(--vassal-gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_28%,transparent)] px-4 py-2 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase disabled:opacity-50"
            >
              Speak
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_60%,transparent)]">
          {waitlisted
            ? "You are on the waitlist — the Lord must seal before you speak. Visitors can still read."
            : "Join the waitlist to speak. Visitors can still read the court."}
        </p>
      )}

      <ul className="mt-6 flex flex-col gap-4">
        {threads.length === 0 ? (
          <li className="font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
            The hall is quiet. Be the first voice of the season.
          </li>
        ) : (
          threads.map(({ root, replies }) => (
            <li key={root.id} className="hall-comment-thread">
              <CommentRow
                comment={root}
                isMember={isMember}
                isLord={isLord}
                viewerUserId={viewerUserId}
                busy={busy}
                onCheer={() => void onCheer(root.id)}
                onRemove={() => void onRemove(root.id)}
                onReply={() => {
                  if (!isMember) {
                    onNeedAuth();
                    return;
                  }
                  setReplyTo((prev) => (prev === root.id ? null : root.id));
                  setReplyDraft("");
                }}
              />
              {replies.length > 0 ? (
                <ul className="hall-comment-replies mt-3 flex flex-col gap-3">
                  {replies.map((reply) => (
                    <li key={reply.id}>
                      <CommentRow
                        comment={reply}
                        nested
                        isMember={isMember}
                        isLord={isLord}
                        viewerUserId={viewerUserId}
                        busy={busy}
                        onCheer={() => void onCheer(reply.id)}
                        onRemove={() => void onRemove(reply.id)}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
              {replyTo === root.id ? (
                <div className="mt-3 pl-3 sm:pl-8">
                  <textarea
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    rows={2}
                    maxLength={800}
                    placeholder={`Reply to ${root.author.name}…`}
                    className="auth-input w-full resize-y border border-[color-mix(in_srgb,var(--vassal-gold)_28%,transparent)] bg-transparent px-3 py-2 font-[family-name:var(--font-body)] text-sm italic"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy || !replyDraft.trim()}
                      onClick={() => void submitReply(root.id)}
                      className="border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-3 py-1.5 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase disabled:opacity-50"
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setReplyTo(null);
                        setReplyDraft("");
                      }}
                      className="border border-[color-mix(in_srgb,var(--vassal-gold)_22%,transparent)] px-3 py-1.5 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function CommentRow({
  comment,
  nested,
  isMember,
  isLord,
  viewerUserId,
  busy,
  onCheer,
  onRemove,
  onReply,
}: {
  comment: HallCommentJson;
  nested?: boolean;
  isMember: boolean;
  isLord: boolean;
  viewerUserId?: string | null;
  busy?: boolean;
  onCheer: () => void;
  onRemove: () => void;
  onReply?: () => void;
}) {
  const mine = viewerUserId && comment.author.userId === viewerUserId;
  const canRemove = Boolean(isLord || mine);
  const handle = profileHandle({
    id: comment.author.userId,
    x_username: comment.author.xUsername,
  });
  const rankLabel = comment.author.rank
    ? RANK_LABEL[(comment.author.rank as CourtRank) || "serf"] ||
      comment.author.rank
    : null;

  return (
    <article
      className={`hall-comment ${nested ? "hall-comment-nested" : ""} ${
        comment.author.role === "lord" ? "hall-comment-lord" : ""
      }`}
    >
      <div className="flex gap-3">
        <Link
          href={`/u/${encodeURIComponent(handle)}`}
          className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[color-mix(in_srgb,var(--vassal-gold)_35%,transparent)] bg-[var(--vassal-stone)]"
        >
          {comment.author.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comment.author.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] text-xs text-[var(--vassal-gold)]">
              {comment.author.name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <Link
              href={`/u/${encodeURIComponent(handle)}`}
              className="font-[family-name:var(--font-display)] text-sm tracking-[0.06em] hover:text-[var(--vassal-gold)]"
            >
              {comment.author.name}
              {comment.author.role === "lord" ? " · Lord" : ""}
              {mine ? " · You" : ""}
            </Link>
            {rankLabel ? (
              <span className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.12em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_45%,transparent)]">
                {rankLabel}
              </span>
            ) : null}
            <span className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.1em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_35%,transparent)]">
              {formatWhen(comment.createdAt)}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap font-[family-name:var(--font-body)] text-[0.95rem] leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_88%,transparent)]">
            {comment.body}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy || !isMember || Boolean(mine)}
              onClick={onCheer}
              className={`hall-chip ${comment.cheeredByMe ? "hall-chip-active" : ""}`}
              title={
                mine
                  ? "Cheer another vassal"
                  : comment.cheeredByMe
                    ? "Remove cheer"
                    : "Cheer this word"
              }
            >
              Cheer{comment.cheerCount > 0 ? ` · ${comment.cheerCount}` : ""}
            </button>
            {onReply ? (
              <button
                type="button"
                disabled={busy}
                onClick={onReply}
                className="hall-chip"
              >
                Reply
              </button>
            ) : null}
            {canRemove ? (
              <button
                type="button"
                disabled={busy}
                onClick={onRemove}
                className="hall-chip hall-chip-muted"
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
