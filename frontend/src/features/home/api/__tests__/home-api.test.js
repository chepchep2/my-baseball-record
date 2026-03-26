import { describe, expect, it } from "vitest";
import { getHomeDashboard } from "../home-api";

describe("home-api", () => {
  it("mock 홈 대시보드를 season scope 기준으로 조립한다", async () => {
    const result = await getHomeDashboard({ selectedScope: "season", hasRecords: true });

    expect(result.tabs).toEqual([
      { key: "season", label: "올해 시즌", active: true },
      { key: "career", label: "통산", active: false },
    ]);
    expect(result.seasonSummaryItems[0]).toEqual(["타율", ".280"]);
    expect(result.recentGames).toHaveLength(2);
  });

  it("기록이 없으면 빈 홈 모델을 반환한다", async () => {
    const result = await getHomeDashboard({ selectedScope: "career", hasRecords: false });

    expect(result.isEmpty).toBe(true);
    expect(result.recentGames).toEqual([]);
    expect(result.tabs[1].active).toBe(true);
  });
});
