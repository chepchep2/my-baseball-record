import { describe, expect, it, vi } from "vitest";
import { getStats } from "../stats-api";

describe("stats-api", () => {
  it("season 조회면 seasonYear를 포함해 GET /api/stats를 호출한다", async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({
        scope: "season",
        seasonYear: 2026,
        recordType: "batter",
        gameFilter: "all",
        summary: {
          games: 24,
          atBats: 88,
          hits: 31,
          battingAverage: "0.352",
          ops: "0.898",
        },
        details: {
          plateAppearances: 96,
          homeRuns: 3,
          runsBattedIn: 18,
          onBasePercentage: "0.410",
          sluggingPercentage: "0.488",
          singles: 22,
          doubles: 5,
          triples: 1,
          walks: 9,
          hitByPitch: 2,
          stolenBases: 4,
          caughtStealing: 1,
          sacrificeHits: 2,
          runs: 14,
          strikeOuts: 7,
        },
        isEmpty: false,
      }),
    };

    const result = await getStats(apiClient, {
      scope: "season",
      seasonYear: 2026,
      recordType: "batter",
      gameFilter: "all",
    });

    expect(apiClient.get).toHaveBeenCalledWith("/api/stats?scope=season&seasonYear=2026&recordType=batter&gameFilter=all");
    expect(result.summaryItems).toEqual([
      ["경기수", "24"],
      ["타수", "88"],
      ["총안타", "31"],
      ["타율", ".352"],
      ["OPS", ".898"],
    ]);
    expect(result.detailItems).toContainEqual(["타석", "96"]);
    expect(result.detailItems).toContainEqual(["볼넷", "9"]);
  });

  it("pitcher 조회면 pitcher 요약/상세 지표로 변환한다", async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({
        scope: "career",
        seasonYear: null,
        recordType: "pitcher",
        gameFilter: "league",
        summary: {
          games: 9,
          inningsPitchedDisplay: "24.1",
          era: "2.18",
          whip: "1.03",
          strikeOuts: 22,
          wins: 3,
        },
        details: {
          games: 9,
          inningsPitchedDisplay: "24.1",
          era: "2.18",
          whip: "1.03",
          strikeOuts: 22,
          wins: 3,
          losses: 1,
          saves: 0,
          holds: 1,
          runsAllowed: 7,
          earnedRuns: 6,
          hitsAllowed: 18,
          walks: 5,
          hitByPitch: 1,
          battingAverageAllowed: ".214",
        },
        isEmpty: false,
      }),
    };

    const result = await getStats(apiClient, {
      scope: "career",
      recordType: "pitcher",
      gameFilter: "league",
    });

    expect(apiClient.get).toHaveBeenCalledWith("/api/stats?scope=career&recordType=pitcher&gameFilter=league");
    expect(result.summaryItems).toEqual([
      ["경기수", "9"],
      ["이닝", "24.1"],
      ["ERA", "2.18"],
      ["WHIP", "1.03"],
      ["삼진", "22"],
      ["승", "3"],
    ]);
    expect(result.detailItems).toContainEqual(["피안타율", ".214"]);
  });
});
