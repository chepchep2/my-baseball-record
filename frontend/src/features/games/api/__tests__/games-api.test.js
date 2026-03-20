import { describe, expect, it, vi } from "vitest";
import { createGame, deleteGame, getGameDetail, updateGame } from "../games-api";

describe("games-api", () => {
  it("GET /api/games/{id} 응답을 현재 상세 화면 shape로 변환한다", async () => {
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
        pitcher: {
          innings: 1,
          additionalOuts: 0,
          runsAllowed: 0,
          earnedRuns: 0,
          hitsAllowed: 1,
          walks: 0,
          strikeOuts: 2,
          hitByPitch: 0,
          homeRunsAllowed: 0,
          battersFaced: 4,
          wins: 0,
          losses: 0,
          saves: 0,
          holds: 0,
        },
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
    expect(game.batter.atBats).toBe(3);
    expect(game.pitcher.innings).toBe(1);
  });

  it("POST /api/games 응답도 상세 화면 shape로 변환한다", async () => {
    const apiClient = {
      post: vi.fn().mockResolvedValue({
        id: 201,
        gameInfo: {
          playedAt: "2026-03-20",
          seasonYear: 2026,
          gameType: "LEAGUE",
          teamName: "블루스톰",
          opponentName: "스카이워커스",
          memo: null,
        },
        participationType: "BATTER",
        batter: {
          plateAppearances: 3,
          atBats: 3,
          singles: 1,
          doubles: 0,
          triples: 0,
          homeRuns: 0,
          walks: 0,
          strikeOuts: 1,
          hitByPitch: 0,
          runsBattedIn: 0,
          runs: 1,
          stolenBases: 0,
          caughtStealing: 0,
          sacrificeHits: 0,
        },
        pitcher: null,
      }),
    };

    const result = await createGame(apiClient, { gameInfo: {}, batter: {}, pitcher: null });

    expect(apiClient.post).toHaveBeenCalledWith("/api/games", { gameInfo: {}, batter: {}, pitcher: null });
    expect(result.id).toBe(201);
    expect(result.playedAt).toBe("2026-03-20");
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
