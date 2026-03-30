import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "../api-client";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("api-client", () => {
  it("상대 경로 요청이면 NEXT_PUBLIC_API_BASE_URL을 붙여 호출한다", async () => {
    const originalBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com/";

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    const client = createApiClient({
      fetchImpl: fetchMock,
      getAccessToken: () => null,
    });

    await client.get("/api/stats");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/stats",
      expect.objectContaining({ method: "GET" }),
    );

    process.env.NEXT_PUBLIC_API_BASE_URL = originalBaseUrl;
  });

  it("로컬 개발에서는 env가 없어도 localhost:8080을 붙여 호출한다", async () => {
    const originalBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    process.env.NEXT_PUBLIC_API_BASE_URL = "";
    const originalWindow = global.window;

    global.window = {
      location: {
        protocol: "http:",
        hostname: "localhost",
      },
    };

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    const client = createApiClient({
      fetchImpl: fetchMock,
      getAccessToken: () => null,
    });

    await client.get("/api/stats");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/stats",
      expect.objectContaining({ method: "GET" }),
    );

    process.env.NEXT_PUBLIC_API_BASE_URL = originalBaseUrl;
    global.window = originalWindow;
  });

  it("access token이 있으면 Authorization Bearer 헤더를 추가한다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    const client = createApiClient({
      fetchImpl: fetchMock,
      getAccessToken: () => "access-1",
    });

    await client.get("/api/stats");

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.get("Authorization")).toBe("Bearer access-1");
  });

  it("401이면 refresh 후 한 번 재시도한다", async () => {
    let accessToken = "access-old";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ code: "AUTH_EXPIRED" }, 401))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const refreshMock = vi.fn().mockResolvedValue({
      accessToken: "access-new",
    });

    const client = createApiClient({
      fetchImpl: fetchMock,
      getAccessToken: () => accessToken,
      refreshSession: refreshMock,
      onRefreshSuccess: (session) => {
        accessToken = session.accessToken;
      },
    });

    const result = await client.get("/api/stats");

    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ ok: true });

    const [, retryInit] = fetchMock.mock.calls[1];
    expect(retryInit.headers.get("Authorization")).toBe("Bearer access-new");
  });

  it("refresh 실패 시 onRefreshFailed를 호출한다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ code: "AUTH_EXPIRED" }, 401));
    const refreshError = new Error("refresh failed");
    const refreshMock = vi.fn().mockRejectedValue(refreshError);
    const onRefreshFailed = vi.fn();

    const client = createApiClient({
      fetchImpl: fetchMock,
      getAccessToken: () => "access-1",
      refreshSession: refreshMock,
      onRefreshFailed,
    });

    await expect(client.get("/api/stats")).rejects.toThrow("refresh failed");
    expect(onRefreshFailed).toHaveBeenCalledWith(refreshError);
  });

  it("모든 요청에 credentials include를 넣는다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    const client = createApiClient({
      fetchImpl: fetchMock,
      getAccessToken: () => null,
    });

    await client.get("/api/stats");

    const [, init] = fetchMock.mock.calls[0];
    expect(init.credentials).toBe("include");
  });
});
