import { describe, expect, it } from "vitest";
import { toHomeSummaryItems, toHomeViewModel } from "../home-view-model";

describe("home-view-model", () => {
  it("홈 요약 지표를 5개 카드 shape로 변환한다", () => {
    expect(
      toHomeSummaryItems({
        battingAverage: "0.280",
        ops: "0.750",
        hits: 24,
        onBasePercentage: "0.350",
        sluggingPercentage: "0.400",
      }),
    ).toEqual([
      ["타율", ".280"],
      ["OPS", ".750"],
      ["안타", "24"],
      ["출루율", ".350"],
      ["장타율", ".400"],
    ]);
  });

  it("최근 경기 리스트는 최대 2개까지만 유지한다", () => {
    const result = toHomeViewModel({
      seasonSummary: {
        battingAverage: "0.280",
        ops: "0.750",
        hits: 24,
        onBasePercentage: "0.350",
        sluggingPercentage: "0.400",
      },
      careerSummary: {
        battingAverage: "0.265",
        ops: "0.720",
        hits: 87,
        onBasePercentage: "0.330",
        sluggingPercentage: "0.390",
      },
      recentGames: [
        { id: 1, playedLabel: "3/22 14:10", summaryLabel: "타석 4 · 안타 1 · 타율 .333" },
        { id: 2, playedLabel: "3/15 09:30", summaryLabel: "타석 5 · 안타 2 · 타율 .500" },
        { id: 3, playedLabel: "3/10 11:00", summaryLabel: "타석 3 · 안타 0 · 타율 .000" },
      ],
      selectedScope: "career",
      isEmpty: false,
    });

    expect(result.tabs).toEqual([
      { key: "season", label: "올해 시즌", active: false },
      { key: "career", label: "통산", active: true },
    ]);
    expect(result.recentGames).toHaveLength(2);
    expect(result.recentGames[0].playedLabel).toBe("3/22 14:10");
  });
});
