import { describe, expect, it, vi } from "vitest";
import { createGame, deleteGame, getGameDetail, getGames, updateGame } from "../games-api";

describe("games-api", () => {
  it("GET /api/games 연도/월 목록 응답을 경기 카드 shape로 변환한다", async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({
        items: [
          {
            gameId: 201,
            playedDate: "2026-04-05",
            playedHour: 11,
            playedMinute: 30,
            playedAtLabel: "4/5 11:30",
            plateAppearances: 4,
            hits: 1,
            battingAverage: "0.333",
          },
        ],
      }),
    };

    const games = await getGames(apiClient, { year: 2026, month: 4 });

    expect(apiClient.get).toHaveBeenCalledWith("/api/games?year=2026&month=4");
    expect(games).toEqual([
      {
        id: 201,
        playedDate: "2026-04-05",
        playedLabel: "4/5 11:30",
        summaryLabel: "타석 4 · 안타 1 · 타율 .333",
      },
    ]);
  });

  it("GET /api/games 월 전체 조회는 month query를 제외한다", async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({ items: [] }),
    };

    await getGames(apiClient, { year: 2026, month: null });

    expect(apiClient.get).toHaveBeenCalledWith("/api/games?year=2026");
  });

  it("GET /api/games 목록 응답은 최근 목록처럼 3개로 자르지 않는다", async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({
        items: [1, 2, 3, 4].map((id) => ({
          gameId: id,
          playedAtLabel: `4/${id} 11:30`,
          plateAppearances: 4,
          hits: 1,
          battingAverage: "0.333",
        })),
      }),
    };

    const games = await getGames(apiClient, { year: 2026, month: null });

    expect(games).toHaveLength(4);
  });

  it("GET /api/games/{id} legacy 상세 응답을 현재 상세 화면 shape로 변환한다", async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({
        id: 101,
        gameInfo: {
          playedAt: "2026-03-18",
          seasonYear: 2026,
          gameType: "LEAGUE",
          teamName: "블루스톰",
          opponentName: "레전드",
          memo: "비 오는 날 경기",
        },
        participationType: "BOTH",
        batter: {
          plateAppearances: 4,
          atBats: 3,
          singles: 1,
          doubles: 1,
          triples: 0,
          homeRuns: 1,
          walks: 1,
          strikeOuts: 0,
          hitByPitch: 0,
          runsBattedIn: 3,
          runs: 2,
          stolenBases: 0,
          caughtStealing: 0,
          sacrificeHits: 0,
        },
        pitcher: null,
      }),
    };

    const game = await getGameDetail(apiClient, 101);

    expect(apiClient.get).toHaveBeenCalledWith("/api/games/101");
    expect(game).toMatchObject({
      id: 101,
      playedAt: "2026-03-18",
      seasonYear: 2026,
      gameType: "LEAGUE",
      teamName: "블루스톰",
      opponentName: "레전드",
      memo: "비 오는 날 경기",
      participationType: "BOTH",
    });
  });

  it("POST /api/games flat 응답을 생성 후 홈 이동에 필요한 shape로 변환한다", async () => {
    const apiClient = {
      post: vi.fn().mockResolvedValue({
        gameId: 201,
        playedDate: "2026-03-20",
        playedHour: 19,
        playedMinute: 0,
        playedAtLabel: "3/20 19:00",
        plateAppearances: 3,
        walksAndHitByPitch: 0,
        singles: 1,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        atBats: 3,
        hits: 1,
        battingAverage: 0.333,
        onBasePercentage: 0.333,
        sluggingPercentage: 0.333,
        ops: 0.666,
      }),
    };

    const payload = {
      playedDate: "2026-03-20",
      playedHour: 19,
      playedMinute: 0,
      plateAppearances: 3,
      walksAndHitByPitch: 0,
      singles: 1,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
    };

    const result = await createGame(apiClient, payload);

    expect(apiClient.post).toHaveBeenCalledWith("/api/games", payload);
    expect(result).toMatchObject({
      id: 201,
      playedDate: "2026-03-20",
      playedHour: 19,
      playedMinute: 0,
      plateAppearances: 3,
      hits: 1,
    });
  });

  it("PUT /api/games/{id} 응답도 상세 화면 shape로 변환한다", async () => {
    const apiClient = {
      put: vi.fn().mockResolvedValue({
        id: 101,
        gameInfo: {
          playedAt: "2026-03-18",
          seasonYear: 2026,
          gameType: "LEAGUE",
          teamName: "블루스톰",
          opponentName: "레전드",
          memo: "수정 완료",
        },
        participationType: "BATTER",
        batter: {
          plateAppearances: 4,
          atBats: 4,
          singles: 2,
          doubles: 0,
          triples: 0,
          homeRuns: 0,
          walks: 0,
          strikeOuts: 1,
          hitByPitch: 0,
          runsBattedIn: 1,
          runs: 1,
          stolenBases: 0,
          caughtStealing: 0,
          sacrificeHits: 0,
        },
        pitcher: null,
      }),
    };

    const result = await updateGame(apiClient, 101, { gameInfo: {}, batter: {}, pitcher: null });

    expect(apiClient.put).toHaveBeenCalledWith("/api/games/101", { gameInfo: {}, batter: {}, pitcher: null });
    expect(result.memo).toBe("수정 완료");
  });

  it("DELETE /api/games/{id}를 호출한다", async () => {
    const apiClient = {
      delete: vi.fn().mockResolvedValue(null),
    };

    await deleteGame(apiClient, 101);

    expect(apiClient.delete).toHaveBeenCalledWith("/api/games/101");
  });
});
