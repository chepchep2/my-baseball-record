import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthPage from "../page";

const { replaceMock, beginKakaoLoginMock, clearAuthErrorMock, authState } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  beginKakaoLoginMock: vi.fn(),
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
  }),
}));

vi.mock("@/features/auth/api/auth-api", () => ({
  beginKakaoLogin: beginKakaoLoginMock,
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
    const button = screen.getByRole("button", { name: "카카오로 시작하기" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("kakao-button-visual");
  });

  it("카카오 로그인 버튼을 누르면 백엔드 로그인 시작 URL로 이동한다", async () => {
    render(<AuthPage />);

    await userEvent.click(screen.getByRole("button", { name: "카카오로 시작하기" }));

    await waitFor(() => expect(beginKakaoLoginMock).toHaveBeenCalledTimes(1));
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
