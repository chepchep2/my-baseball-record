import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthPage from "../page";

const { replaceMock, loginWithProviderTokenMock, clearAuthErrorMock, authState } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  loginWithProviderTokenMock: vi.fn().mockResolvedValue({}),
  clearAuthErrorMock: vi.fn(),
  authState: {
    isAuthenticated: false,
    isBootstrapping: false,
    authError: null,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("@/features/auth/session/useAuthSession", () => ({
  useAuthSession: () => ({
    ...authState,
    clearAuthError: clearAuthErrorMock,
    loginWithProviderToken: loginWithProviderTokenMock,
  }),
}));

vi.mock("@/features/auth/kakao/kakao-auth", () => ({
  mountKakaoLoginButton: vi.fn(async ({ element, onSuccess }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "카카오로 시작하기";
    button.addEventListener("click", () => onSuccess("mock-kakao-token"));
    element.appendChild(button);
    return { ok: true, cleanup: () => {} };
  }),
}));

describe("AuthPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = false;
    authState.isBootstrapping = false;
    authState.authError = null;
  });

  it("카카오 로그인 버튼과 소개 문구를 보여준다", async () => {
    render(<AuthPage />);

    expect(screen.getByText("MY BASEBALL RECORD")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /경기 후 기록,/ })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "카카오로 시작하기" })).toBeInTheDocument();
  });

  it("카카오 로그인 성공 시 홈으로 이동한다", async () => {
    render(<AuthPage />);

    await userEvent.click(await screen.findByRole("button", { name: "카카오로 시작하기" }));

    await waitFor(() => expect(loginWithProviderTokenMock).toHaveBeenCalledWith("mock-kakao-token"));
    expect(replaceMock).toHaveBeenCalledWith("/home");
  });
});
