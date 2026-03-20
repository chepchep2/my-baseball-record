function formatNumber(value) {
  if (value === null || value === undefined) {
    return "0";
  }

  return String(value);
}

function formatAverage(value) {
  if (!value) {
    return ".000";
  }

  return value.startsWith("0") ? value.slice(1) : value;
}

export function toStatsViewModel(response) {
  if (response.recordType === "pitcher") {
    return {
      summaryItems: [
        ["경기수", formatNumber(response.summary.games)],
        ["이닝", response.summary.inningsPitchedDisplay || "0.0"],
        ["ERA", response.summary.era || "0.00"],
        ["WHIP", response.summary.whip || "0.00"],
        ["삼진", formatNumber(response.summary.strikeOuts)],
        ["승", formatNumber(response.summary.wins)],
      ],
      detailItems: [
        ["경기수", formatNumber(response.details.games)],
        ["이닝", response.details.inningsPitchedDisplay || "0.0"],
        ["ERA", response.details.era || "0.00"],
        ["WHIP", response.details.whip || "0.00"],
        ["삼진", formatNumber(response.details.strikeOuts)],
        ["승", formatNumber(response.details.wins)],
        ["패", formatNumber(response.details.losses)],
        ["세이브", formatNumber(response.details.saves)],
        ["홀드", formatNumber(response.details.holds)],
        ["실점", formatNumber(response.details.runsAllowed)],
        ["자책", formatNumber(response.details.earnedRuns)],
        ["피안타", formatNumber(response.details.hitsAllowed)],
        ["볼넷", formatNumber(response.details.walks)],
        ["사구", formatNumber(response.details.hitByPitch)],
        ["피안타율", response.details.battingAverageAllowed || ".000"],
      ],
      isEmpty: Boolean(response.isEmpty),
    };
  }

  return {
    summaryItems: [
      ["경기수", formatNumber(response.summary.games)],
      ["타수", formatNumber(response.summary.atBats)],
      ["총안타", formatNumber(response.summary.hits)],
      ["타율", formatAverage(response.summary.battingAverage)],
      ["OPS", formatAverage(response.summary.ops)],
    ],
    detailItems: [
      ["타석", formatNumber(response.details.plateAppearances)],
      ["타수", formatNumber(response.details.atBats)],
      ["총안타", formatNumber(response.summary.hits)],
      ["홈런", formatNumber(response.details.homeRuns)],
      ["타점", formatNumber(response.details.runsBattedIn)],
      ["득점", formatNumber(response.details.runs)],
      ["1루타", formatNumber(response.details.singles)],
      ["2루타", formatNumber(response.details.doubles)],
      ["3루타", formatNumber(response.details.triples)],
      ["도루", formatNumber(response.details.stolenBases)],
      ["도루자", formatNumber(response.details.caughtStealing)],
      ["희생타", formatNumber(response.details.sacrificeHits)],
      ["볼넷", formatNumber(response.details.walks)],
      ["사구", formatNumber(response.details.hitByPitch)],
      ["삼진", formatNumber(response.details.strikeOuts)],
    ],
    isEmpty: Boolean(response.isEmpty),
  };
}
