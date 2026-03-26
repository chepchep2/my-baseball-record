import { beforeEach, describe, expect, it } from "vitest";
import { getHomeDashboard } from "../home-api";

describe("home-api", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("mock 홈 대시보드를 season scope 기준으로 조립한다", async () => {
    window.localStorage.setItem("milestone-1.mock-games", JSON.stringify([
      {
        id: "game-1",
        playedAt: `${new Date().getFullYear()}-03-22`,
        playedLabel: "3/22 14:10",
        summaryLabel: "타석 4 · 안타 1 · 타율 .333",
        plateAppearances: 4,
        walksAndHitByPitch: 1,
        singles: 1,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        hits: 1,
        battingAverage: ".333",
        onBasePercentage: ".500",
        sluggingPercentage: ".333",
        ops: ".833",
      },
      {
        id: "game-2",
        playedAt: `${new Date().getFullYear()}-03-15`,
        playedLabel: "3/15 09:30",
        summaryLabel: "타석 5 · 안타 2 · 타율 .500",
        plateAppearances: 5,
        walksAndHitByPitch: 1,
        singles: 1,
        doubles: 1,
        triples: 0,
        homeRuns: 0,
        hits: 2,
        battingAverage: ".500",
        onBasePercentage: ".600",
        sluggingPercentage: ".750",
        ops: "1.350",
      },
    ]));

    const result = await getHomeDashboard({ selectedScope: "season" });

    expect(result.tabs).toEqual([
      { key: "season", label: "올해 시즌", active: true },
      { key: "career", label: "통산", active: false },
    ]);
    expect(result.seasonSummaryItems).toEqual([
      ["타율", ".429"],
      ["OPS", "1.127"],
      ["안타", "3"],
      ["출루율", ".556"],
      ["장타율", ".571"],
    ]);
    expect(result.recentGames).toHaveLength(2);
  });

  it("기록이 없으면 빈 홈 모델을 반환한다", async () => {
    const result = await getHomeDashboard({ selectedScope: "career" });

    expect(result.isEmpty).toBe(true);
    expect(result.recentGames).toEqual([]);
    expect(result.tabs[1].active).toBe(true);
  });

  it("타율은 안타를 타수로 나눈 값으로 계산한다", async () => {
    window.localStorage.setItem("milestone-1.mock-games", JSON.stringify([
      {
        id: "game-1",
        playedAt: `${new Date().getFullYear()}-03-22`,
        playedLabel: "3/22 14:10",
        summaryLabel: "타석 5 · 안타 1 · 타율 1.000",
        plateAppearances: 5,
        walksAndHitByPitch: 4,
        singles: 1,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        hits: 1,
        battingAverage: "1.000",
        onBasePercentage: "1.000",
        sluggingPercentage: "1.000",
        ops: "2.000",
      },
    ]));

    const result = await getHomeDashboard({ selectedScope: "season" });

    expect(result.seasonSummaryItems[0]).toEqual(["타율", "1.000"]);
  });
});
