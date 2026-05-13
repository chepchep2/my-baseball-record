const CONFIGURED_API_BASE_URL = (
  typeof process !== "undefined" && process.env ? process.env.NEXT_PUBLIC_API_BASE_URL || "" : ""
).replace(/\/$/, "");
const MOCK_AUTH_ENABLED = (
  typeof process !== "undefined" && process.env ? process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH || "" : ""
) === "true";

function getApiBaseUrl() {
  if (MOCK_AUTH_ENABLED) {
    return "";
  }

  if (CONFIGURED_API_BASE_URL) {
    return CONFIGURED_API_BASE_URL;
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${protocol}//${hostname}:8080`;
    }
  }

  return "";
}

export function isMockAuthMode() {
  return MOCK_AUTH_ENABLED;
}

function buildUrl(path) {
  if (!path.startsWith("/")) {
    throw new Error(`Invalid API path: ${path}`);
  }

  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    throw new Error("API base URL이 설정되지 않았습니다.");
  }

  return `${apiBaseUrl}${path}`;
}

async function parseBody(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.code = options.code ?? null;
    this.retryable = options.retryable ?? false;
    this.fieldErrors = options.fieldErrors ?? [];
  }
}

async function requestJson(path, { method, body, fetchImpl = fetch }) {
  const response = await fetchImpl(buildUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(payload?.message || "요청에 실패했습니다.", {
      status: response.status,
      code: payload?.code || null,
      retryable: Boolean(payload?.retryable),
      fieldErrors: payload?.fieldErrors || [],
    });
  }

  return payload;
}

export async function loginWithGoogle(idToken, fetchImpl = fetch) {
  if (!idToken || !idToken.trim()) {
    throw new ApiError("Google idToken이 필요합니다.", { code: "INVALID_GOOGLE_TOKEN", status: 400 });
  }

  return requestJson("/api/auth/google", {
    method: "POST",
    body: { idToken: idToken.trim() },
    fetchImpl,
  });
}

function buildMockSession(provider = "KAKAO") {
  return {
    accessToken: `mock-access-${provider.toLowerCase()}`,
    expiresIn: 900,
    accessTokenExpiresAt: "2099-12-31T23:59:59Z",
    user: {
      id: 1,
      nickname: "카카오 사용자",
      displayName: "카카오 사용자",
      provider,
      profileImageUrl: null,
    },
  };
}

function toExpiresAt(expiresIn) {
  if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
    return null;
  }

  return new Date(Date.now() + expiresIn * 1000).toISOString();
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  if (user.displayName) {
    return user;
  }

  return {
    id: user.id,
    nickname: user.nickname ?? null,
    displayName: user.nickname ?? null,
    email: null,
    provider: "KAKAO",
    profileImageUrl: user.profileImageUrl ?? null,
  };
}

function normalizeSession(session) {
  return {
    accessToken: session?.accessToken ?? null,
    expiresIn: session?.expiresIn ?? null,
    accessTokenExpiresAt: session?.accessTokenExpiresAt ?? toExpiresAt(session?.expiresIn),
    user: normalizeUser(session?.user),
  };
}

export function beginKakaoLogin(locationImpl = typeof window !== "undefined" ? window.location : null) {
  const loginUrl = buildUrl("/api/auth/kakao/login");

  if (locationImpl?.assign) {
    locationImpl.assign(loginUrl);
  }

  return loginUrl;
}

export async function getAuthSession(fetchImpl = fetch) {
  if (isMockAuthMode()) {
    return buildMockSession("KAKAO");
  }

  const payload = await requestJson("/api/auth/session", {
    method: "GET",
    fetchImpl,
  });

  return normalizeSession(payload);
}

export async function refreshSession(fetchImpl = fetch) {
  if (isMockAuthMode()) {
    return buildMockSession("KAKAO");
  }

  const payload = await requestJson("/api/auth/refresh", {
    method: "POST",
    fetchImpl,
  });

  return normalizeSession(payload);
}

export async function logoutSession(fetchImpl = fetch) {
  if (isMockAuthMode()) {
    return null;
  }

  return requestJson("/api/auth/logout", {
    method: "POST",
    fetchImpl,
  }).catch((error) => {
    if (error instanceof ApiError && error.status === 204) {
      return null;
    }
    throw error;
  });
}
