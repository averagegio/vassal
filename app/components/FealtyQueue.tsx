"use client";

import { useState } from "react";
import type { JoinRequestStatus } from "../lib/courts";

export type FealtyQueueItem = {
  id: string;
  userId: string;
  ask: string;
  status: JoinRequestStatus;
  createdAt: string;
  name?: string;
  avatarUrl?: string | null;
  xUsername?: string | null;
};

type FealtyQueueProps = {
  seed: FealtyQueueItem[];
  onChange?: (items: FealtyQueueItem[]) => void;
};

const STATUS_LABEL: Record<JoinRequestStatus, string> = {
  open: "Waiting",
  granted: "Granted",
  denied: "Denied",
  deferred: "Deferred",
};

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function FealtyQueue({ seed, onChange }: FealtyQueueProps) {
  const [items, setItems] = useState(seed);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const seal = async (
    id: string,
    status: Exclude<JoinRequestStatus, "open">,
  ) => {
    setBusyId(id);
    setError(null);
    const previous = items;
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p)),
    );
    try {
      const res = await fetch("/api/court", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "seal-join",
          requestId: id,
          status,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        waitlist?: FealtyQueueItem[];
      };
      if (!res.ok) {
        setItems(previous);
        setError(json.error || "Could not seal that request.");
        return;
      }
      if (json.waitlist) {
        setItems(json.waitlist);
        onChange?.(json.waitlist);
      } else {
        onChange?.(
          previous.map((p) => (p.id === id ? { ...p, status } : p)),
        );
      }
    } catch {
      setItems(previous);
      setError("Could not reach the realm.");
    } finally {
      setBusyId(null);
    }
  };

  const open = items.filter((i) => i.status === "open");
  const rest = items.filter((i) => i.status !== "open");

  return (
    <section className="dash-panel mt-5 p-5">
      <h2 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
        Fealty waitlist
      </h2>
      <p className="mt-2 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)]">
        Open queue — seal who may enter your hall.
      </p>

      {error ? (
        <p className="mt-3 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.12em] text-[var(--vassal-blood)]">
          {error}
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="mt-5 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
          No one is waiting. Share your hall link or a vassal scroll.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-4" aria-label="Fealty waitlist">
          {[...open, ...rest].map((item) => (
            <li key={item.id} className="petition-row">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.06em] text-[var(--vassal-cream)]">
                  {item.name || "Vassal"}
                  {item.xUsername ? ` · @${item.xUsername}` : ""}
                </p>
                <span
                  className={`font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.2em] uppercase ${
                    item.status === "open"
                      ? "text-[var(--vassal-gold)]"
                      : item.status === "granted"
                        ? "text-[var(--vassal-ember)]"
                        : item.status === "denied"
                          ? "text-[var(--vassal-blood)]"
                          : "text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]"
                  }`}
                >
                  {STATUS_LABEL[item.status]}
                  {item.createdAt ? ` · ${formatWhen(item.createdAt)}` : ""}
                </span>
              </div>
              <p className="mt-3 font-[family-name:var(--font-body)] text-sm leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_80%,transparent)]">
                {item.ask?.trim()
                  ? item.ask
                  : "Asks to swear fealty and enter the hall."}
              </p>
              {item.status === "open" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void seal(item.id, "granted")}
                    className="border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-3 py-1.5 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase hover:bg-[color-mix(in_srgb,var(--vassal-gold)_12%,transparent)] disabled:opacity-50"
                  >
                    Grant
                  </button>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void seal(item.id, "deferred")}
                    className="border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-3 py-1.5 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase hover:bg-[color-mix(in_srgb,var(--vassal-gold)_12%,transparent)] disabled:opacity-50"
                  >
                    Defer
                  </button>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void seal(item.id, "denied")}
                    className="border border-[color-mix(in_srgb,var(--vassal-blood)_55%,transparent)] px-3 py-1.5 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase hover:bg-[color-mix(in_srgb,var(--vassal-red)_25%,transparent)] disabled:opacity-50"
                  >
                    Deny
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
