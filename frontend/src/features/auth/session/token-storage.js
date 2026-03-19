const REFRESH_TOKEN_KEY = "auth.refreshToken";
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

  if (session?.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  const sessionMeta = {
    accessTokenExpiresAt: session?.accessTokenExpiresAt || null,
    refreshTokenExpiresAt: session?.refreshTokenExpiresAt || null,
    user: session?.user || null,
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

export function readStoredRefreshToken() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
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

  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(SESSION_META_KEY);
}
