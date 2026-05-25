import { ApiError } from "@/features/auth/api/auth-api";

function getApiBaseUrl() {
  const configuredApiBaseUrl = (
    typeof process !== "undefined" && process.env ? process.env.NEXT_PUBLIC_API_BASE_URL || "" : ""
  ).replace(/\/$/, "");

  if (configuredApiBaseUrl) {
    return configuredApiBaseUrl;
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${protocol}//${hostname}:8080`;
    }
  }

  return "";
}

function buildUrl(url) {
  if (!url.startsWith("/")) {
    return url;
  }

  return `${getApiBaseUrl()}${url}`;
}

async function parseResponseBody(response) {
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

function buildHeaders(initialHeaders, accessToken) {
  const headers = new Headers(initialHeaders || {});
  headers.set("Content-Type", "application/json");

  const mockAuthEnabled =
    typeof process !== "undefined" &&
    process.env &&
    process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === "true";

  if (mockAuthEnabled) {
    headers.set("X-Dev-User-Id", "1");
  }

  if (accessToken && !mockAuthEnabled) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  } else {
    headers.delete("Authorization");
  }

  return headers;
}

export function createApiClient({
  fetchImpl = fetch,
  getAccessToken,
  refreshSession,
  onRefreshSuccess,
  onRefreshFailed,
}) {
  async function request(url, init = {}, retried = false) {
    const accessToken = getAccessToken?.() || null;
    const headers = buildHeaders(init.headers, accessToken);
    const response = await fetchImpl(buildUrl(url), {
      ...init,
      headers,
      credentials: "include",
    });

    if (response.status === 401 && !retried && refreshSession) {
      try {
        const refreshedSession = await refreshSession();
        onRefreshSuccess?.(refreshedSession);
        return request(url, init, true);
      } catch (error) {
        onRefreshFailed?.(error);
        throw error;
      }
    }

    const payload = await parseResponseBody(response);

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

  return {
    get: (url, init = {}) => request(url, { ...init, method: "GET" }),
    post: (url, body, init = {}) =>
      request(url, {
        ...init,
        method: "POST",
        body: JSON.stringify(body),
      }),
    put: (url, body, init = {}) =>
      request(url, {
        ...init,
        method: "PUT",
        body: JSON.stringify(body),
      }),
    delete: (url, init = {}) => request(url, { ...init, method: "DELETE" }),
  };
}
