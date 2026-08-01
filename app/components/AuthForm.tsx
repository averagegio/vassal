"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent, type ReactNode } from "react";
import { LANDING_HREF } from "../lib/home";
import { VassalLogo } from "./VassalLogo";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  return (
    <Suspense fallback={<AuthShell />}>
      <AuthFormInner mode={mode} />
    </Suspense>
  );
}

function AuthShell({ children }: { children?: ReactNode }) {
  return (
    <div className="auth-shell relative flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 cobblestone opacity-40" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(176,16,32,0.22),transparent_60%)]" aria-hidden />
      <div className="relative flex w-full max-w-md flex-col">{children}</div>
    </div>
  );
}

function AuthFormInner({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courtSlug = searchParams.get("court") || "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [holding, setHolding] = useState<"fan" | "estate">(
    searchParams.get("holding") === "estate" && !courtSlug ? "estate" : "fan",
  );
  const [error, setError] = useState(searchParams.get("error") || "");
  const [pending, setPending] = useState(false);

  const isSignup = mode === "signup";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password required.");
      return;
    }
    if (isSignup && !name.trim()) {
      setError("Name required.");
      return;
    }
    if (password.length < 6) {
      setError("Password needs 6+ characters.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch(isSignup ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isSignup
            ? { name, email, password, holding }
            : { email, password },
        ),
      });
      const data = (await res.json()) as {
        error?: string;
        homeHref?: string;
      };
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setPending(false);
        return;
      }

      let next = data.homeHref || "/dashboard";
      if (courtSlug) {
        const join = await fetch("/api/court", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "join", slug: courtSlug }),
        });
        const joinJson = (await join.json().catch(() => null)) as {
          error?: string;
          court?: { slug: string };
        } | null;
        if (join.ok && joinJson?.court?.slug) {
          next = `/hall/${encodeURIComponent(joinJson.court.slug)}`;
        } else {
          next = `/dashboard?courtError=${encodeURIComponent(
            joinJson?.error || "Could not swear fealty.",
          )}`;
        }
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Could not reach the realm.");
      setPending(false);
    }
  };

  const xHref = `/api/auth/x?mode=${isSignup ? "signup" : "login"}&holding=${
    courtSlug ? "fan" : holding
  }${courtSlug ? `&court=${encodeURIComponent(courtSlug)}` : ""}`;

  return (
    <AuthShell>
      <Link
        href={LANDING_HREF}
        className="mb-6 inline-flex items-center gap-2 self-start font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.2em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)] transition hover:text-[var(--vassal-cream)]"
      >
        <span aria-hidden className="text-sm leading-none">
          ←
        </span>
        Back
      </Link>

      <Link
        href={LANDING_HREF}
        className="mb-8 flex flex-col items-center text-center"
      >
        <VassalLogo size={56} />
        <span className="mt-3 font-[family-name:var(--font-display)] text-lg tracking-[0.32em] text-[var(--vassal-cream)]">
          VASSAL
        </span>
      </Link>

      <div className="auth-panel px-6 py-8 sm:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-[0.14em] text-[var(--vassal-cream)]">
          {isSignup ? "Join" : "Enter"}
        </h1>
        <p className="mt-2 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)]">
          {courtSlug
            ? `Join @${courtSlug.replace(/^@/, "")}'s community.`
            : isSignup
              ? "Pick what you're building."
              : "Welcome back."}
        </p>

        {isSignup && !courtSlug && (
          <fieldset className="mt-6">
            <legend className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.22em] uppercase text-[var(--vassal-gold)]">
              Path
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <HoldingPick
                active={holding === "fan"}
                onClick={() => setHolding("fan")}
                title="Fan Court"
                subtitle="Creator community"
              />
              <HoldingPick
                active={holding === "estate"}
                onClick={() => setHolding("estate")}
                title="Estate"
                subtitle="Rentals & property"
              />
            </div>
          </fieldset>
        )}

        <a
          href={xHref}
          className="mt-6 flex w-full items-center justify-center gap-2 border border-[color-mix(in_srgb,var(--vassal-cream)_35%,transparent)] bg-black px-5 py-3 font-[family-name:var(--font-display)] text-xs tracking-[0.18em] uppercase text-[var(--vassal-cream)] transition hover:border-[var(--vassal-cream)]"
        >
          <XMark />
          {isSignup ? "Sign up with X" : "Continue with X"}
        </a>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-[color-mix(in_srgb,var(--vassal-gold)_25%,transparent)]" />
          <span className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.2em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_45%,transparent)]">
            or email
          </span>
          <span className="h-px flex-1 bg-[color-mix(in_srgb,var(--vassal-gold)_25%,transparent)]" />
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {isSignup && (
            <Field
              id="name"
              label="Name"
              value={name}
              onChange={setName}
              autoComplete="name"
            />
          )}
          <Field
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          <Field
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={isSignup ? "new-password" : "current-password"}
          />

          {error && (
            <p
              role="alert"
              className="font-[family-name:var(--font-display)] text-xs tracking-[0.08em] text-[var(--vassal-blood)]"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 border border-[color-mix(in_srgb,var(--vassal-gold)_50%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_40%,transparent)] px-5 py-3 font-[family-name:var(--font-display)] text-xs tracking-[0.22em] uppercase text-[var(--vassal-cream)] transition hover:bg-[color-mix(in_srgb,var(--vassal-red)_55%,transparent)] disabled:opacity-60"
          >
            {pending ? "Please wait…" : isSignup ? "Join" : "Enter"}
          </button>
        </form>

        <p className="mt-6 text-center font-[family-name:var(--font-body)] text-sm text-[color-mix(in_srgb,var(--vassal-cream)_60%,transparent)]">
          {isSignup ? (
            <>
              Already a member?{" "}
              <Link href="/login" className="text-[var(--vassal-gold)] underline-offset-4 hover:underline">
                Log in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/signup" className="text-[var(--vassal-gold)] underline-offset-4 hover:underline">
                Sign up
              </Link>
            </>
          )}
        </p>
      </div>
    </AuthShell>
  );
}

function XMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.849L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-2" htmlFor={id}>
      <span className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.22em] uppercase text-[var(--vassal-gold)]">
        {label}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="auth-input border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-[color-mix(in_srgb,var(--vassal-black)_70%,transparent)] px-3 py-2.5 font-[family-name:var(--font-body)] text-[var(--vassal-cream)] outline-none transition focus:border-[var(--vassal-blood)]"
      />
    </label>
  );
}

function HoldingPick({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3 py-3 text-left transition ${
        active
          ? "border-[var(--vassal-blood)] bg-[color-mix(in_srgb,var(--vassal-red)_30%,transparent)] text-[var(--vassal-cream)]"
          : "border-[color-mix(in_srgb,var(--vassal-gold)_28%,transparent)] text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)] hover:border-[var(--vassal-gold)]"
      }`}
    >
      <span className="block font-[family-name:var(--font-display)] text-xs tracking-[0.14em] uppercase">
        {title}
      </span>
      {subtitle ? (
        <span className="mt-1 block font-[family-name:var(--font-body)] text-[0.7rem] normal-case tracking-normal italic text-[color-mix(in_srgb,var(--vassal-cream)_60%,transparent)]">
          {subtitle}
        </span>
      ) : null}
    </button>
  );
}
