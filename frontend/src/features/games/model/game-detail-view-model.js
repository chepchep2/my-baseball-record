export function toGameDetailViewModel(response) {
  if (!response?.gameInfo) {
    return {
      id: response.gameId ?? response.id,
      playedDate: response.playedDate,
      playedHour: response.playedHour,
      playedMinute: response.playedMinute,
      playedAtLabel: response.playedAtLabel,
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
      batter: null,
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
