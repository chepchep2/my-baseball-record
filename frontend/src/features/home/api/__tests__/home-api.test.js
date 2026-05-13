import { describe, expect, it, vi } from "vitest";
import { getHomeDashboard } from "../home-api";

vi.mock("@/features/auth/api/auth-api", () => ({
  isMockAuthMode: vi.fn(() => false),
}));

import { isMockAuthMode } from "@/features/auth/api/auth-api";

describe("home-api", () => {
  it("season/career stats와 recent games를 합쳐 홈 대시보드를 만든다", async () => {
    isMockAuthMode.mockReturnValue(false);
    const apiClient = {
      get: vi.fn()
        .mockResolvedValueOnce({
          scope: "season",
          games: 12,
          plateAppearances: 39,
          walksAndHitByPitch: 7,
          battingAverage: "0.280",
          ops: "0.750",
          hits: 24,
          onBasePercentage: "0.350",
          sluggingPercentage: "0.400",
        })
        .mockResolvedValueOnce({
          scope: "career",
          games: 31,
          plateAppearances: 107,
          walksAndHitByPitch: 15,
          battingAverage: "0.265",
          ops: "0.720",
          hits: 87,
          onBasePercentage: "0.330",
          sluggingPercentage: "0.390",
        })
        .mockResolvedValueOnce({
          items: [
            {
              gameId: 1,
              playedAtLabel: "3/22 14:10",
              plateAppearances: 4,
              hits: 1,
              battingAverage: "0.333",
            },
            {
              gameId: 2,
              playedAtLabel: "3/15 09:30",
              plateAppearances: 5,
              hits: 2,
              battingAverage: "0.500",
            },
          ],
        }),
    };

    const result = await getHomeDashboard(apiClient, { selectedScope: "season" });

    expect(apiClient.get).toHaveBeenNthCalledWith(1, "/api/stats?scope=season");
    expect(apiClient.get).toHaveBeenNthCalledWith(2, "/api/stats?scope=career");
    expect(apiClient.get).toHaveBeenNthCalledWith(3, "/api/games/recent?limit=3");
    expect(result.tabs).toEqual([
      { key: "season", label: "올해 시즌", active: true },
      { key: "career", label: "통산", active: false },
    ]);
    expect(result.seasonSummaryItems).toEqual([
      ["경기", "12"],
      ["타석", "39"],
      ["타율", ".280"],
      ["OPS", ".750"],
      ["안타", "24"],
      ["사사구", "7"],
      ["출루율", ".350"],
      ["장타율", ".400"],
    ]);
    expect(result.recentGames).toEqual([
      { id: 1, playedLabel: "3/22 14:10", summaryLabel: "타석 4 · 안타 1 · 타율 .333" },
      { id: 2, playedLabel: "3/15 09:30", summaryLabel: "타석 5 · 안타 2 · 타율 .500" },
    ]);
    expect(result.isEmpty).toBe(false);
  });

  it("recent games가 비어 있으면 빈 홈 모델을 반환한다", async () => {
    isMockAuthMode.mockReturnValue(false);
    const apiClient = {
      get: vi.fn()
        .mockResolvedValueOnce({
          scope: "season",
          games: 0,
          plateAppearances: 0,
          walksAndHitByPitch: 0,
          battingAverage: "0.000",
          ops: "0.000",
          hits: 0,
          onBasePercentage: "0.000",
          sluggingPercentage: "0.000",
        })
        .mockResolvedValueOnce({
          scope: "career",
          games: 0,
          plateAppearances: 0,
          walksAndHitByPitch: 0,
          battingAverage: "0.000",
          ops: "0.000",
          hits: 0,
          onBasePercentage: "0.000",
          sluggingPercentage: "0.000",
        })
        .mockResolvedValueOnce({ items: [] }),
    };

    const result = await getHomeDashboard(apiClient, { selectedScope: "career" });

    expect(result.isEmpty).toBe(true);
    expect(result.recentGames).toEqual([]);
    expect(result.tabs[1].active).toBe(true);
  });

  it("mock auth mode면 로컬 목데이터로 홈 대시보드를 만든다", async () => {
    isMockAuthMode.mockReturnValue(true);
    const apiClient = { get: vi.fn() };

    const result = await getHomeDashboard(apiClient, { selectedScope: "season" });

    expect(apiClient.get).not.toHaveBeenCalled();
    expect(result.seasonSummaryItems).toEqual([
      ["경기", "3"],
      ["타석", "12"],
      ["타율", ".400"],
      ["OPS", "1.300"],
      ["안타", "4"],
      ["사사구", "2"],
      ["출루율", ".500"],
      ["장타율", ".800"],
    ]);
    expect(result.recentGames).toHaveLength(3);
    expect(result.isEmpty).toBe(false);
  });
});
