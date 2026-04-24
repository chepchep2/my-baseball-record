export function toGameDetailViewModel(response) {
  if (!response?.gameInfo) {
    const playedDate = response.playedDate;

    return {
      id: response.gameId ?? response.id,
      playedAt: playedDate,
      playedDate: response.playedDate,
      playedHour: response.playedHour,
      playedMinute: response.playedMinute,
      playedAtLabel: response.playedAtLabel,
      seasonYear: playedDate ? Number(String(playedDate).slice(0, 4)) : undefined,
      gameType: "LEAGUE",
      teamName: "",
      opponentName: "",
      memo: "",
      plateAppearances: response.plateAppearances,
      walksAndHitByPitch: response.walksAndHitByPitch,
      singles: response.singles,
      doubles: response.doubles,
      triples: response.triples,
      homeRuns: response.homeRuns,
      atBats: response.atBats,
      hits: response.hits,
      battingAverage: response.battingAverage,
      onBasePercentage: response.onBasePercentage,
      sluggingPercentage: response.sluggingPercentage,
      ops: response.ops,
      participationType: "BATTER",
      batter: {
        plateAppearances: response.plateAppearances ?? 0,
        atBats: response.atBats ?? 0,
        singles: response.singles ?? 0,
        doubles: response.doubles ?? 0,
        triples: response.triples ?? 0,
        homeRuns: response.homeRuns ?? 0,
        walks: response.walksAndHitByPitch ?? 0,
        strikeOuts: 0,
        hitByPitch: 0,
        runsBattedIn: 0,
        runs: 0,
        stolenBases: 0,
        caughtStealing: 0,
        sacrificeHits: 0,
      },
      pitcher: null,
    };
  }

  return {
    id: response.id,
    playedAt: response.gameInfo.playedAt,
    seasonYear: response.gameInfo.seasonYear,
    gameType: response.gameInfo.gameType,
    teamName: response.gameInfo.teamName,
    opponentName: response.gameInfo.opponentName,
    memo: response.gameInfo.memo,
    participationType: response.participationType,
    batter: response.batter,
    pitcher: response.pitcher,
  };
}
