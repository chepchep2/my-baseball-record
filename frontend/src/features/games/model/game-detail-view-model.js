export function toGameDetailViewModel(response) {
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
