function toOptionalString(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

function toRequiredNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }

  return Number.parseInt(String(value), 10) || 0;
}

function hasAnyRecordValue(record) {
  return Object.values(record).some((value) => value !== "" && value !== null && value !== undefined);
}

function toBatterPayload(batter) {
  if (!hasAnyRecordValue(batter)) {
    return null;
  }

  return {
    plateAppearances: toRequiredNumber(batter.plateAppearances),
    atBats: toRequiredNumber(batter.atBats),
    singles: toRequiredNumber(batter.singles),
    doubles: toRequiredNumber(batter.doubles),
    triples: toRequiredNumber(batter.triples),
    homeRuns: toRequiredNumber(batter.homeRuns),
    walks: toRequiredNumber(batter.walks),
    strikeOuts: toRequiredNumber(batter.strikeOuts),
    hitByPitch: toRequiredNumber(batter.hitByPitch),
    runsBattedIn: toRequiredNumber(batter.runsBattedIn),
    runs: toRequiredNumber(batter.runs),
    stolenBases: toRequiredNumber(batter.stolenBases),
    caughtStealing: toRequiredNumber(batter.caughtStealing),
    sacrificeHits: toRequiredNumber(batter.sacrificeHits),
  };
}

function toPitcherPayload(pitcher) {
  if (!hasAnyRecordValue(pitcher)) {
    return null;
  }

  return {
    innings: toRequiredNumber(pitcher.innings),
    additionalOuts: toRequiredNumber(pitcher.additionalOuts),
    runsAllowed: toRequiredNumber(pitcher.runsAllowed),
    earnedRuns: toRequiredNumber(pitcher.earnedRuns),
    hitsAllowed: toRequiredNumber(pitcher.hitsAllowed),
    walks: toRequiredNumber(pitcher.walks),
    hitByPitch: toRequiredNumber(pitcher.hitByPitch),
    homeRunsAllowed: toRequiredNumber(pitcher.homeRunsAllowed),
    strikeOuts: toRequiredNumber(pitcher.strikeOuts),
    battersFaced: toRequiredNumber(pitcher.battersFaced),
    wins: toRequiredNumber(pitcher.wins),
    losses: toRequiredNumber(pitcher.losses),
    saves: toRequiredNumber(pitcher.saves),
    holds: toRequiredNumber(pitcher.holds),
  };
}

export function toCreateGamePayload(form) {
  return {
    gameInfo: {
      playedAt: form.gameDate,
      seasonYear: form.seasonYear ? Number.parseInt(form.seasonYear, 10) : null,
      gameType: form.gameType,
      teamName: toOptionalString(form.teamName),
      opponentName: toOptionalString(form.opponentName),
      memo: toOptionalString(form.memo),
    },
    batter: toBatterPayload(form.batter),
    pitcher: toPitcherPayload(form.pitcher),
  };
}

export function toUpdateGamePayload(form) {
  return {
    gameInfo: {
      teamName: toOptionalString(form.teamName),
      opponentName: toOptionalString(form.opponentName),
      memo: toOptionalString(form.memo),
    },
    batter: toBatterPayload(form.batter),
    pitcher: toPitcherPayload(form.pitcher),
  };
}
