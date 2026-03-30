const SESSION_META_KEY = "auth.sessionMeta";

let accessTokenMemory = null;

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveSessionTokens(session) {
  accessTokenMemory = session?.accessToken || null;

  if (!isBrowser()) {
    return;
  }
  const previousSessionMeta = readSessionMeta();

  const sessionMeta = {
    accessTokenExpiresAt: session?.accessTokenExpiresAt || null,
    user: session?.user || previousSessionMeta?.user || null,
  };

  window.localStorage.setItem(SESSION_META_KEY, JSON.stringify(sessionMeta));
}

export function readSessionMeta() {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_META_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    window.localStorage.removeItem(SESSION_META_KEY);
    return null;
  }
}

export function getAccessToken() {
  return accessTokenMemory;
}

export function setAccessToken(nextAccessToken) {
  accessTokenMemory = nextAccessToken || null;
}

export function clearSessionTokens() {
  accessTokenMemory = null;

  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(SESSION_META_KEY);
}
