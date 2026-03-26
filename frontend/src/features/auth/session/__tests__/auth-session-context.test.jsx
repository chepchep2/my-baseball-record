import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthSessionProvider, useAuthSession } from "../AuthSessionContext";
import { loginWithKakao, logoutSession } from "../../api/auth-api";

vi.mock("../../api/auth-api", () => ({
  isMockAuthMode: vi.fn(() => false),
  loginWithKakao: vi.fn(),
  refreshSession: vi.fn(),
  logoutSession: vi.fn(),
}));

function Probe() {
  const { isAuthenticated, user, loginWithProviderToken, logout, isBootstrapping } = useAuthSession();

  return (
    <div>
      <p data-testid="boot">{isBootstrapping ? "booting" : "ready"}</p>
      <p data-testid="auth">{isAuthenticated ? "yes" : "no"}</p>
      <p data-testid="user">{user?.displayName ?? "none"}</p>
      <button type="button" onClick={() => loginWithProviderToken("provider-token")}>
        login
      </button>
      <button type="button" onClick={() => logout()}>
        logout
      </button>
    </div>
  );
}

describe("AuthSessionContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("카카오 로그인 성공 시 인증 상태와 저장소를 갱신한다", async () => {
    loginWithKakao.mockResolvedValue({
      accessToken: "access-1",
      refreshToken: "refresh-1",
      accessTokenExpiresAt: "2026-03-20T00:00:00Z",
      refreshTokenExpiresAt: "2026-04-20T00:00:00Z",
      user: { id: 1, displayName: "조상우", email: "user@gmail.com", provider: "KAKAO" },
    });

    render(
      <AuthSessionProvider>
        <Probe />
      </AuthSessionProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("boot")).toHaveTextContent("ready"));
    await userEvent.click(screen.getByRole("button", { name: "login" }));

    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("yes"));
    expect(screen.getByTestId("user")).toHaveTextContent("조상우");
    expect(window.localStorage.getItem("auth.refreshToken")).toBe("refresh-1");
  });

  it("로그아웃 시 서버 호출 후 로컬 세션을 삭제한다", async () => {
    loginWithKakao.mockResolvedValue({
      accessToken: "access-1",
      refreshToken: "refresh-1",
      accessTokenExpiresAt: "2026-03-20T00:00:00Z",
      refreshTokenExpiresAt: "2026-04-20T00:00:00Z",
      user: { id: 1, displayName: "조상우", email: "user@gmail.com", provider: "KAKAO" },
    });
    logoutSession.mockResolvedValue(null);

    render(
      <AuthSessionProvider>
        <Probe />
      </AuthSessionProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("boot")).toHaveTextContent("ready"));
    await userEvent.click(screen.getByRole("button", { name: "login" }));
    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("yes"));

    await userEvent.click(screen.getByRole("button", { name: "logout" }));

    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("no"));
    expect(window.localStorage.getItem("auth.refreshToken")).toBeNull();
    expect(logoutSession).toHaveBeenCalledWith("refresh-1");
  });
});
