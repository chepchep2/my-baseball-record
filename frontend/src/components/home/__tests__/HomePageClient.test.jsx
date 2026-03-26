import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePageClient from "../HomePageClient";
import { getHomeDashboard } from "@/features/home/api/home-api";

const { replaceMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("@/features/home/api/home-api", () => ({
  getHomeDashboard: vi.fn(),
}));

vi.mock("@/components/layout/AppPageLayout", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

describe("HomePageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("올해 시즌 홈 대시보드를 조회해 핵심 지표와 최근 경기 2개를 보여준다", async () => {
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
      ],
      isEmpty: false,
    });

    render(<HomePageClient selectedScope="season" />);

    await waitFor(() =>
      expect(getHomeDashboard).toHaveBeenCalledWith({ selectedScope: "season" }),
    );

    expect(screen.getByText("올해 시즌")).toBeInTheDocument();
    expect(screen.getByText("통산")).toBeInTheDocument();
    expect(screen.getByText("타율")).toBeInTheDocument();
    expect(screen.getByText(".280")).toBeInTheDocument();
    expect(screen.getByText("최근 경기 기록 리스트")).toBeInTheDocument();
    expect(screen.getByText("3/22 14:10")).toBeInTheDocument();
    expect(screen.getByText("타석 5 · 안타 2 · 타율 .500")).toBeInTheDocument();
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
});
