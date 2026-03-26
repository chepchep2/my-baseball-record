const API_BASE_URL = (
  typeof process !== "undefined" && process.env ? process.env.NEXT_PUBLIC_API_BASE_URL || "" : ""
).replace(/\/$/, "");

export function isMockAuthMode() {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }
  }

  return API_BASE_URL === "";
}

function buildUrl(path) {
  if (!path.startsWith("/")) {
    throw new Error(`Invalid API path: ${path}`);
  }

  return `${API_BASE_URL}${path}`;
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
    refreshToken: `mock-refresh-${provider.toLowerCase()}`,
    accessTokenExpiresAt: "2099-12-31T23:59:59Z",
    refreshTokenExpiresAt: "2099-12-31T23:59:59Z",
    user: {
      id: 1,
      displayName: "카카오 사용자",
      email: "kakao-user@example.com",
      provider,
    },
  };
}

function isMockToken(token) {
  return typeof token === "string" && token.startsWith("mock-");
}

export async function loginWithKakao(token, fetchImpl = fetch) {
  if (!token || !token.trim()) {
    throw new ApiError("카카오 로그인 정보가 필요합니다.", { code: "INVALID_KAKAO_TOKEN", status: 400 });
  }

  if (isMockAuthMode() || isMockToken(token)) {
    return buildMockSession("KAKAO");
  }

  return requestJson("/api/auth/kakao", {
    method: "POST",
    body: { token: token.trim() },
    fetchImpl,
  });
}

export async function refreshSession(refreshToken, fetchImpl = fetch) {
  if (!refreshToken || !refreshToken.trim()) {
    throw new ApiError("refreshToken이 필요합니다.", { code: "REFRESH_TOKEN_INVALID", status: 401 });
  }

  if (isMockAuthMode() || isMockToken(refreshToken)) {
    return buildMockSession("KAKAO");
  }

  return requestJson("/api/auth/refresh", {
    method: "POST",
    body: { refreshToken: refreshToken.trim() },
    fetchImpl,
  });
}

export async function logoutSession(refreshToken, fetchImpl = fetch) {
  if (!refreshToken || !refreshToken.trim()) {
    return null;
  }

  if (isMockAuthMode() || isMockToken(refreshToken)) {
    return null;
  }

  return requestJson("/api/auth/logout", {
    method: "POST",
    body: { refreshToken: refreshToken.trim() },
    fetchImpl,
  }).catch((error) => {
    if (error instanceof ApiError && error.status === 204) {
      return null;
    }
    throw error;
  });
}
