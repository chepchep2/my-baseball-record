import { toHomeViewModel } from "@/features/home/model/home-view-model";

const MOCK_HOME_DATA = {
  seasonSummary: {
    battingAverage: "0.280",
    ops: "0.750",
    hits: 24,
    onBasePercentage: "0.350",
    sluggingPercentage: "0.400",
  },
  careerSummary: {
    battingAverage: "0.265",
    ops: "0.720",
    hits: 87,
    onBasePercentage: "0.330",
    sluggingPercentage: "0.390",
  },
  recentGames: [
    { id: 1, playedLabel: "3/22 14:10", summaryLabel: "타석 4 · 안타 1 · 타율 .333" },
    { id: 2, playedLabel: "3/15 09:30", summaryLabel: "타석 5 · 안타 2 · 타율 .500" },
    { id: 3, playedLabel: "3/10 11:00", summaryLabel: "타석 3 · 안타 0 · 타율 .000" },
  ],
};

export async function getHomeDashboard({ selectedScope = "season", hasRecords = true } = {}) {
  if (!hasRecords) {
    return toHomeViewModel({
      seasonSummary: {
        battingAverage: "0.000",
        ops: "0.000",
        hits: 0,
        onBasePercentage: "0.000",
        sluggingPercentage: "0.000",
      },
      careerSummary: {
        battingAverage: "0.000",
        ops: "0.000",
        hits: 0,
        onBasePercentage: "0.000",
        sluggingPercentage: "0.000",
      },
      recentGames: [],
      selectedScope,
      isEmpty: true,
    });
  }

  return toHomeViewModel({
    ...MOCK_HOME_DATA,
    selectedScope,
    isEmpty: false,
  });
}
