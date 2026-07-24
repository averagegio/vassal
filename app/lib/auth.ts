export type VassalSession = {
  name: string;
  email: string;
  holding: "fan" | "estate";
  createdAt: string;
};

const STORAGE_KEY = "vassal.session";

let cachedRaw: string | null | undefined;
let cachedSession: VassalSession | null = null;
const listeners = new Set<() => void>();

function readSession(): VassalSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSession;
  cachedRaw = raw;
  if (!raw) {
    cachedSession = null;
    return null;
  }
  try {
    cachedSession = JSON.parse(raw) as VassalSession;
  } catch {
    cachedSession = null;
  }
  return cachedSession;
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function getSession(): VassalSession | null {
  return readSession();
}

/** Stable snapshot for useSyncExternalStore — same reference until storage changes. */
export function getSessionSnapshot(): VassalSession | null {
  return readSession();
}

export function getServerSessionSnapshot(): VassalSession | null {
  return null;
}

export function subscribeSession(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStoreChange);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStoreChange);
    }
  };
}

export function saveSession(session: VassalSession) {
  const raw = JSON.stringify(session);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedSession = session;
  emit();
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY);
  cachedRaw = null;
  cachedSession = null;
  emit();
}
