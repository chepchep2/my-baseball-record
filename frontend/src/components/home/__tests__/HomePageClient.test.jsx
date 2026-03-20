import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePageClient from "../HomePageClient";
import { getStats } from "@/features/stats/api/stats-api";

vi.mock("@/features/stats/api/stats-api", () => ({
  getStats: vi.fn(),
}));

vi.mock("@/features/auth/session/useAuthSession", () => ({
  useAuthSession: () => ({
    apiClient: { get: vi.fn() },
  }),
}));

vi.mock("@/components/layout/AppPageLayout", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("@/components/navigation/BottomTabBar", () => ({
  default: () => <div>tabs</div>,
}));

vi.mock("@/components/layout/PageHeader", () => ({
  default: ({ title, context }) => (
    <div>
      <h1>{title}</h1>
      <span>{context}</span>
    </div>
  ),
}));

describe("HomePageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("현재 시즌 stats를 조회해 핵심 지표를 보여준다", async () => {
    getStats.mockResolvedValue({
      summaryItems: [
        ["경기수", "24"],
        ["타수", "88"],
        ["총안타", "31"],
        ["타율", ".352"],
        ["OPS", ".898"],
      ],
      detailItems: [],
      isEmpty: false,
    });

    render(<HomePageClient recordType="batter" currentYear={2026} />);

    await waitFor(() =>
      expect(getStats).toHaveBeenCalledWith(
        expect.any(Object),
        {
          scope: "current_season",
          recordType: "batter",
          gameFilter: "all",
        },
      ),
    );

    expect(screen.getByText("경기수")).toBeInTheDocument();
    expect(screen.getAllByText("24").length).toBeGreaterThan(0);
    expect(screen.getByText(".352")).toBeInTheDocument();
    expect(screen.getByText("(2026 시즌)")).toBeInTheDocument();
  });

  it("빈 기록이면 안내 문구를 보여준다", async () => {
    getStats.mockResolvedValue({
      summaryItems: [],
      detailItems: [],
      isEmpty: true,
    });

    render(<HomePageClient recordType="pitcher" currentYear={2026} />);

    expect(await screen.findByText("아직 기록이 없습니다. 첫 경기를 저장해 보세요.")).toBeInTheDocument();
  });
});
