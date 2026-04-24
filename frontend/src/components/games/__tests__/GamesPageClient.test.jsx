import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GamesPageClient from "../GamesPageClient";
import { getGames } from "@/features/games/api/games-api";

const replaceMock = vi.fn();
const routerMock = {
  replace: replaceMock,
};

const authSessionMock = vi.hoisted(() => ({
  apiClient: { get: vi.fn() },
  isAuthenticated: true,
  isBootstrapping: false,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

vi.mock("@/features/auth/session/useAuthSession", () => ({
  useAuthSession: () => authSessionMock,
}));

vi.mock("@/features/games/api/games-api", () => ({
  getGames: vi.fn(),
}));

vi.mock("@/components/layout/AppPageLayout", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

describe("GamesPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authSessionMock.apiClient = { get: vi.fn() };
    authSessionMock.isAuthenticated = true;
    authSessionMock.isBootstrapping = false;
  });

  it("전체 경기 목록을 보유 연도/월 선택과 카드 링크로 보여준다", async () => {
    getGames.mockResolvedValue([
      { id: 201, playedDate: "2026-04-05", playedLabel: "4/5 11:30", summaryLabel: "타석 4 · 안타 1 · 타율 .333" },
      { id: 101, playedDate: "2024-03-18", playedLabel: "3/18 10:00", summaryLabel: "타석 3 · 안타 0 · 타율 .000" },
    ]);

    render(<GamesPageClient initialYear={2026} initialMonth={null} />);

    await waitFor(() => expect(getGames).toHaveBeenCalledWith(expect.any(Object), {}));

    expect(screen.getByRole("heading", { name: "전체 경기 기록" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "새 기록" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("연도")).toHaveValue("2026");
    expect(screen.getByRole("option", { name: "2026년" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "2024년" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "2025년" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("월")).toHaveValue("");
    expect(screen.getByRole("option", { name: "전체" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /4\/5 11:30/ })).toHaveAttribute("href", "/games/201");
    expect(screen.getByText("타석 4 · 안타 1 · 타율 .333")).toBeInTheDocument();
  });

  it("월을 선택하면 전체 목록 안에서 해당 월 경기만 보여준다", async () => {
    getGames.mockResolvedValue([
      { id: 201, playedDate: "2026-04-05", playedLabel: "4/5 11:30", summaryLabel: "타석 4 · 안타 1 · 타율 .333" },
      { id: 202, playedDate: "2026-05-01", playedLabel: "5/1 09:00", summaryLabel: "타석 4 · 안타 2 · 타율 .500" },
    ]);

    render(<GamesPageClient initialYear={2026} initialMonth={null} />);

    await screen.findByText("4/5 11:30");
    await userEvent.selectOptions(screen.getByLabelText("월"), "4");

    expect(screen.getByText("4/5 11:30")).toBeInTheDocument();
    expect(screen.queryByText("5/1 09:00")).not.toBeInTheDocument();
    expect(getGames).toHaveBeenCalledTimes(1);
  });

  it("인증되지 않은 상태면 auth 화면으로 이동한다", async () => {
    authSessionMock.isAuthenticated = false;

    render(<GamesPageClient initialYear={2026} initialMonth={null} />);

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/auth?next=%2Fgames"));
    expect(getGames).not.toHaveBeenCalled();
  });
});
