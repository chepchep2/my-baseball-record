import { calculateAtBats } from "@/features/entry/model/entry-validation";

function toNumber(value) {
  const parsed = Number.parseInt(String(value ?? "0"), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function buildGameInfoPayload(game, overrides = {}) {
  return {
    playedDate: overrides.playedDate,
    playedHour: overrides.playedHour,
    playedMinute: overrides.playedMinute,
    teamName: overrides.teamName ?? game.teamName ?? null,
    opponentName: overrides.opponentName ?? game.opponentName ?? null,
    memo: overrides.memo ?? game.memo ?? null,
  };
}

function buildBatterPayload(batter) {
  if (!batter) {
    return null;
  }

  return {
    plateAppearances: batter.plateAppearances ?? 0,
    atBats: batter.atBats ?? 0,
    singles: batter.singles ?? 0,
    doubles: batter.doubles ?? 0,
    triples: batter.triples ?? 0,
    homeRuns: batter.homeRuns ?? 0,
    walks: batter.walks ?? 0,
    strikeOuts: batter.strikeOuts ?? 0,
    hitByPitch: batter.hitByPitch ?? 0,
    runsBattedIn: batter.runsBattedIn ?? 0,
    runs: batter.runs ?? 0,
    stolenBases: batter.stolenBases ?? 0,
    caughtStealing: batter.caughtStealing ?? 0,
    sacrificeHits: batter.sacrificeHits ?? 0,
  };
}

function buildPitcherPayload(pitcher) {
  if (!pitcher) {
    return null;
  }

  return {
    innings: pitcher.innings ?? 0,
    additionalOuts: pitcher.additionalOuts ?? 0,
    runsAllowed: pitcher.runsAllowed ?? 0,
    earnedRuns: pitcher.earnedRuns ?? 0,
    hitsAllowed: pitcher.hitsAllowed ?? 0,
    walks: pitcher.walks ?? 0,
    hitByPitch: pitcher.hitByPitch ?? 0,
    homeRunsAllowed: pitcher.homeRunsAllowed ?? 0,
    strikeOuts: pitcher.strikeOuts ?? 0,
    battersFaced: pitcher.battersFaced ?? 0,
    wins: pitcher.wins ?? 0,
    losses: pitcher.losses ?? 0,
    saves: pitcher.saves ?? 0,
    holds: pitcher.holds ?? 0,
  };
}

export function buildGameRecordUpdatePayload(game, draft) {
  return {
    gameInfo: buildGameInfoPayload(game),
    batter: game.batter
      ? {
          ...buildBatterPayload(game.batter),
          plateAppearances: toNumber(draft.plateAppearances),
          atBats: calculateAtBats(draft),
          singles: toNumber(draft.singles),
          doubles: toNumber(draft.doubles),
          triples: toNumber(draft.triples),
          homeRuns: toNumber(draft.homeRuns),
          walks: toNumber(draft.walksAndHitByPitch),
        }
      : null,
    pitcher: buildPitcherPayload(game.pitcher),
  };
}

export function buildGameDateTimeUpdatePayload(game, draft) {
  return {
    gameInfo: buildGameInfoPayload(game, {
      playedDate: draft.date,
      playedHour: toNumber(draft.hour),
      playedMinute: toNumber(draft.minute),
    }),
    batter: buildBatterPayload(game.batter),
    pitcher: buildPitcherPayload(game.pitcher),
  };
}
