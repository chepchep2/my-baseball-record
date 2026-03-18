import { DRAFT_TTL_MS } from "@/lib/game-form-data";

function now() {
  return Date.now();
}

function parseDraft(rawValue) {
  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

export function readDraft(key) {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return null;
  }

  const parsed = parseDraft(rawValue);
  if (!parsed || !parsed.updatedAt || !parsed.values) {
    window.localStorage.removeItem(key);
    return null;
  }

  if (now() - parsed.updatedAt > DRAFT_TTL_MS) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
    return null;
  }

  return parsed.values;
}

export function writeDraft(key, values) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    key,
    JSON.stringify({
      updatedAt: now(),
      values,
    }),
  );
  window.sessionStorage.setItem(key, "active");
}

export function clearDraft(key) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(key);
  window.sessionStorage.removeItem(key);
}

export function shouldAutoRestoreDraft(key) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(key) === "active";
}
