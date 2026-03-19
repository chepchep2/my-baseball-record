import { ApiError } from "@/features/auth/api/auth-api";

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

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  } else {
    headers.delete("Authorization");
  }

  return headers;
}

export function createApiClient({
  fetchImpl = fetch,
  getAccessToken,
  getRefreshToken,
  refreshSession,
  onRefreshSuccess,
  onRefreshFailed,
}) {
  async function request(url, init = {}, retried = false) {
    const accessToken = getAccessToken?.() || null;
    const headers = buildHeaders(init.headers, accessToken);
    const response = await fetchImpl(url, {
      ...init,
      headers,
    });

    if (response.status === 401 && !retried && refreshSession && getRefreshToken) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const refreshedSession = await refreshSession(refreshToken);
          onRefreshSuccess?.(refreshedSession);
          return request(url, init, true);
        } catch (error) {
          onRefreshFailed?.(error);
          throw error;
        }
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
