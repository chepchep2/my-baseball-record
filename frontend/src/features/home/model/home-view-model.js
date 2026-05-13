function formatAverage(value) {
  if (!value) {
    return ".000";
  }

  return String(value).startsWith("0") ? String(value).slice(1) : String(value);
}

function formatCount(value) {
  return String(value ?? 0);
}

function toRecentSummaryLabel(game) {
  return `타석 ${game.plateAppearances} · 안타 ${game.hits} · 타율 ${formatAverage(game.battingAverage)}`;
}

export function toHomeSummaryItems(summary) {
  return [
    ["경기", formatCount(summary.games)],
    ["타석", formatCount(summary.plateAppearances)],
    ["타율", formatAverage(summary.battingAverage)],
    ["OPS", formatAverage(summary.ops)],
    ["안타", formatCount(summary.hits)],
    ["사사구", formatCount(summary.walksAndHitByPitch)],
    ["출루율", formatAverage(summary.onBasePercentage)],
    ["장타율", formatAverage(summary.sluggingPercentage)],
  ];
}

export function toRecentGameItems(games) {
  return (games ?? []).slice(0, 3).map((game) => ({
    id: game.gameId ?? game.id,
    playedLabel: game.playedAtLabel ?? game.playedLabel,
    summaryLabel: game.summaryLabel ?? toRecentSummaryLabel(game),
  }));
}

export function toHomeViewModel({ seasonSummary, careerSummary, recentGames, selectedScope = "season", isEmpty = false }) {
  return {
    tabs: [
      { key: "season", label: "올해 시즌", active: selectedScope === "season" },
      { key: "career", label: "통산", active: selectedScope === "career" },
    ],
    seasonSummaryItems: toHomeSummaryItems(seasonSummary),
    careerSummaryItems: toHomeSummaryItems(careerSummary),
    recentGames: toRecentGameItems(recentGames),
    isEmpty,
  };
}
