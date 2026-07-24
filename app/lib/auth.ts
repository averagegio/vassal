export type VassalSession = {
  name: string;
  email: string;
  holding: "fan" | "estate";
  createdAt: string;
};

const STORAGE_KEY = "vassal.session";

export function getSession(): VassalSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VassalSession;
  } catch {
    return null;
  }
}

export function saveSession(session: VassalSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}
