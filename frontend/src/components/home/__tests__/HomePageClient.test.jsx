import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePageClient from "../HomePageClient";
import { getHomeDashboard } from "@/features/home/api/home-api";

const { replaceMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
}));

const authSessionMock = vi.hoisted(() => ({
  apiClient: { get: vi.fn() },
  isAuthenticated: true,
  isBootstrapping: false,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("@/features/home/api/home-api", () => ({
  getHomeDashboard: vi.fn(),
}));

vi.mock("@/features/auth/session/useAuthSession", () => ({
  useAuthSession: () => authSessionMock,
}));

vi.mock("@/components/layout/AppPageLayout", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

describe("HomePageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authSessionMock.apiClient = { get: vi.fn() };
    authSessionMock.isAuthenticated = true;
    authSessionMock.isBootstrapping = false;
  });

  it("올해 시즌 홈 대시보드를 조회해 핵심 지표와 최근 경기 3개를 보여준다", async () => {
    getHomeDashboard.mockResolvedValue({
      tabs: [
        { key: "season", label: "올해 시즌", active: true },
        { key: "career", label: "통산", active: false },
      ],
      seasonSummaryItems: [
        ["타율", ".280"],
        ["OPS", ".750"],
        ["안타", "24"],
        ["출루율", ".350"],
        ["장타율", ".400"],
      ],
      careerSummaryItems: [
        ["타율", ".265"],
        ["OPS", ".720"],
        ["안타", "87"],
        ["출루율", ".330"],
        ["장타율", ".390"],
      ],
      recentGames: [
        { id: 1, playedLabel: "3/22 14:10", summaryLabel: "타석 4 · 안타 1 · 타율 .333" },
        { id: 2, playedLabel: "3/15 09:30", summaryLabel: "타석 5 · 안타 2 · 타율 .500" },
        { id: 3, playedLabel: "3/10 11:00", summaryLabel: "타석 3 · 안타 0 · 타율 .000" },
      ],
      isEmpty: false,
    });

    render(<HomePageClient selectedScope="season" />);

    await waitFor(() =>
      expect(getHomeDashboard).toHaveBeenCalledWith(expect.any(Object), { selectedScope: "season" }),
    );

    expect(screen.getByText("올해 시즌")).toBeInTheDocument();
    expect(screen.getByText("통산")).toBeInTheDocument();
    expect(screen.getByText("타율")).toBeInTheDocument();
    expect(screen.getByText(".280")).toBeInTheDocument();
    expect(screen.getByText("최근 경기 기록 리스트")).toBeInTheDocument();
    expect(screen.getByText("3/22 14:10")).toBeInTheDocument();
    expect(screen.getByText("타석 5 · 안타 2 · 타율 .500")).toBeInTheDocument();
    expect(screen.getByText("3/10 11:00")).toBeInTheDocument();
  });

  it("기록이 0건이면 입력 화면으로 이동한다", async () => {
    getHomeDashboard.mockResolvedValue({
      tabs: [],
      seasonSummaryItems: [],
      careerSummaryItems: [],
      recentGames: [],
      isEmpty: true,
    });

    render(<HomePageClient selectedScope="career" />);

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/games/new"));
  });

  it("세션 bootstrap 중에는 홈 조회를 시작하지 않는다", () => {
    authSessionMock.isBootstrapping = true;

    render(<HomePageClient selectedScope="season" />);

    expect(getHomeDashboard).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("인증되지 않은 상태면 auth 화면으로 이동한다", async () => {
    authSessionMock.isAuthenticated = false;

    render(<HomePageClient selectedScope="career" />);

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/auth?next=%2Fhome%3Fscope%3Dcareer"));
    expect(getHomeDashboard).not.toHaveBeenCalled();
  });
});
