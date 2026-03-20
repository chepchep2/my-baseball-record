import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RecordsPageClient from "../RecordsPageClient";
import { getStats } from "@/features/stats/api/stats-api";

vi.mock("@/features/stats/api/stats-api", () => ({
  getStats: vi.fn(),
}));

vi.mock("@/features/auth/session/useAuthSession", () => ({
  useAuthSession: () => ({
    apiClient: { get: vi.fn() },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
  usePathname: () => "/records",
  useSearchParams: () =>
    new URLSearchParams({
      type: "pitcher",
      scope: "career",
      gameType: "nonOfficial",
    }),
}));

vi.mock("@/components/layout/AppPageLayout", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("@/components/navigation/BottomTabBar", () => ({
  default: () => <div>tabs</div>,
}));

vi.mock("@/components/layout/PageHeader", () => ({
  default: ({ title }) => <h1>{title}</h1>,
}));

describe("RecordsPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("URL 필터를 stats API query로 바꿔 조회하고 응답을 렌더링한다", async () => {
    getStats.mockResolvedValue({
      summaryItems: [
        ["경기수", "9"],
        ["이닝", "24.1"],
        ["ERA", "2.18"],
        ["WHIP", "1.03"],
        ["삼진", "22"],
        ["승", "3"],
      ],
      detailItems: [
        ["경기수", "9"],
        ["이닝", "24.1"],
        ["ERA", "2.18"],
        ["WHIP", "1.03"],
      ],
      isEmpty: false,
    });

    render(<RecordsPageClient />);

    await waitFor(() =>
      expect(getStats).toHaveBeenCalledWith(
        expect.any(Object),
        {
          scope: "career",
          recordType: "pitcher",
          gameFilter: "non_official",
        },
      ),
    );

    expect((await screen.findAllByText("24.1")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("2.18").length).toBeGreaterThan(0);
  });

  it("빈 기록이면 안내 문구를 보여준다", async () => {
    getStats.mockResolvedValue({
      summaryItems: [],
      detailItems: [],
      isEmpty: true,
    });

    render(<RecordsPageClient />);

    expect(await screen.findByText("아직 기록이 없습니다. 첫 경기를 저장해 보세요.")).toBeInTheDocument();
  });
});
