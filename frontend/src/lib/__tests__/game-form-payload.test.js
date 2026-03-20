import { describe, expect, it } from "vitest";
import { toCreateGamePayload, toUpdateGamePayload } from "@/features/games/model/game-form-payload";

const baseForm = {
  gameDate: "2026-03-18",
  gameType: "LEAGUE",
  seasonYear: "2026",
  teamName: "블루스톰",
  opponentName: "레전드",
  memo: "비 오는 날 경기",
  batter: {
    plateAppearances: "4",
    atBats: "3",
    singles: "1",
    doubles: "1",
    triples: "",
    homeRuns: "1",
    walks: "1",
    strikeOuts: "",
    hitByPitch: "",
    runsBattedIn: "3",
    runs: "2",
    stolenBases: "",
    caughtStealing: "",
    sacrificeHits: "",
  },
  pitcher: {
    innings: "",
    additionalOuts: "",
    runsAllowed: "",
    earnedRuns: "",
    hitsAllowed: "",
    walks: "",
    strikeOuts: "",
    hitByPitch: "",
    homeRunsAllowed: "",
    battersFaced: "",
    wins: "",
    losses: "",
    saves: "",
    holds: "",
  },
};

describe("game-form-payload", () => {
  it("생성 payload는 gameInfo와 입력된 타자 기록을 계약 shape로 변환한다", () => {
    expect(toCreateGamePayload(baseForm)).toEqual({
      gameInfo: {
        playedAt: "2026-03-18",
        seasonYear: 2026,
        gameType: "LEAGUE",
        teamName: "블루스톰",
        opponentName: "레전드",
        memo: "비 오는 날 경기",
      },
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
    });
  });

  it("수정 payload는 수정 불가 필드를 보내지 않고 수정 가능한 정보만 보낸다", () => {
    expect(toUpdateGamePayload(baseForm)).toEqual({
      gameInfo: {
        teamName: "블루스톰",
        opponentName: "레전드",
        memo: "비 오는 날 경기",
      },
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
    });
  });
});
