import { safeHttpUrl } from "./ranks";

export type ApiFeedItem = {
  title: string;
  subtitle: string;
  url: string;
  imageUrl: string;
  description: string;
};

const MAX_BYTES = 1_000_000;
const FETCH_TIMEOUT_MS = 8_000;
const MAX_ITEMS = 40;

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    host === "localhost" ||
    host === "metadata.google.internal" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return true;
  }

  // IPv4
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const parts = ipv4.slice(1).map(Number);
    if (parts.some((n) => n > 255)) return true;
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }

  // IPv6 condensed checks
  if (host === "::1" || host === "0:0:0:0:0:0:0:1") return true;
  if (host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) {
    return true;
  }
  return false;
}

/** Public http(s) URL safe enough to server-fetch (blocks obvious SSRF targets). */
export function safePublicApiUrl(input: string): string | null {
  const url = safeHttpUrl(input);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.username || parsed.password) return null;
    if (isPrivateHostname(parsed.hostname)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function sanitizeJsonPath(input: string | undefined): string {
  const raw = (input ?? "").trim().slice(0, 120);
  if (!raw) return "";
  // Allow dotted paths of simple identifiers / numeric indexes: data.items.0
  if (!/^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)*$/.test(raw)) {
    throw new Error("JSON path must look like data.items (letters, numbers, dots).");
  }
  return raw;
}

function dig(value: unknown, path: string): unknown {
  if (!path) return value;
  let cur: unknown = value;
  for (const part of path.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    if (Array.isArray(cur)) {
      const index = Number(part);
      if (!Number.isInteger(index)) return undefined;
      cur = cur[index];
    } else {
      cur = (cur as Record<string, unknown>)[part];
    }
  }
  return cur;
}

function asString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

function pickString(obj: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = asString(obj[key]);
    if (value) return value;
  }
  return "";
}

function normalizeItem(raw: unknown, index: number): ApiFeedItem | null {
  if (typeof raw === "string" || typeof raw === "number") {
    const title = String(raw).trim();
    if (!title) return null;
    return {
      title: title.slice(0, 200),
      subtitle: "",
      url: "",
      imageUrl: "",
      description: "",
    };
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const title =
    pickString(obj, [
      "title",
      "name",
      "label",
      "headline",
      "track",
      "song",
      "subject",
    ]) || `Item ${index + 1}`;
  const subtitle = pickString(obj, [
    "subtitle",
    "artist",
    "author",
    "byline",
    "creator",
    "username",
    "handle",
  ]);
  const url = pickString(obj, [
    "url",
    "link",
    "href",
    "permalink",
    "source",
    "web_url",
  ]);
  const imageUrl = pickString(obj, [
    "imageUrl",
    "image_url",
    "image",
    "thumbnail",
    "thumbnail_url",
    "thumb",
    "cover",
    "artwork",
  ]);
  const description = pickString(obj, [
    "description",
    "body",
    "text",
    "summary",
    "content",
    "caption",
    "excerpt",
  ]);
  return {
    title: title.slice(0, 200),
    subtitle: subtitle.slice(0, 160),
    url: safeHttpUrl(url) || "",
    imageUrl: safeHttpUrl(imageUrl) || "",
    description: description.slice(0, 400),
  };
}

function extractArray(payload: unknown, jsonPath: string): unknown[] {
  const rooted = dig(payload, jsonPath);
  if (Array.isArray(rooted)) return rooted;

  if (rooted && typeof rooted === "object" && !Array.isArray(rooted)) {
    const obj = rooted as Record<string, unknown>;
    for (const key of ["items", "results", "data", "records", "entries", "list"]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
    return [rooted];
  }

  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const key of ["items", "results", "data", "records", "entries", "list"]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
    return [payload];
  }
  if (payload == null) return [];
  return [payload];
}

export async function fetchApiFeed(input: {
  apiUrl: string;
  jsonPath?: string;
}): Promise<{ items: ApiFeedItem[]; count: number }> {
  const apiUrl = safePublicApiUrl(input.apiUrl);
  if (!apiUrl) {
    throw new Error("API URL must be a public http(s) link.");
  }
  const jsonPath = sanitizeJsonPath(input.jsonPath);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(apiUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "application/json, text/plain;q=0.9, */*;q=0.1",
        "User-Agent": "VassalHallWidget/1.0",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`API responded with ${res.status}.`);
    }

    const finalUrl = res.url ? new URL(res.url) : new URL(apiUrl);
    if (isPrivateHostname(finalUrl.hostname)) {
      throw new Error("API redirected to a blocked host.");
    }

    const lengthHeader = res.headers.get("content-length");
    if (lengthHeader && Number(lengthHeader) > MAX_BYTES) {
      throw new Error("API response is too large.");
    }

    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) {
      throw new Error("API response is too large.");
    }
    const text = new TextDecoder("utf-8").decode(buf);
    let payload: unknown;
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      throw new Error("API response was not valid JSON.");
    }

    const rows = extractArray(payload, jsonPath);
    const items = rows
      .slice(0, MAX_ITEMS)
      .map((row, i) => normalizeItem(row, i))
      .filter((row): row is ApiFeedItem => Boolean(row));

    return { items, count: items.length };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("API request timed out.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
