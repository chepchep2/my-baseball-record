import { toStatsViewModel } from "@/features/stats/model/stats-view-model";

function buildStatsQuery({ scope, seasonYear, recordType, gameFilter }) {
  const params = new URLSearchParams();
  params.set("scope", scope);

  if (scope === "season" && seasonYear) {
    params.set("seasonYear", String(seasonYear));
  }

  params.set("recordType", recordType);
  params.set("gameFilter", gameFilter);

  return params.toString();
}

export async function getStats(apiClient, query) {
  const response = await apiClient.get(`/api/stats?${buildStatsQuery(query)}`);
  return toStatsViewModel(response);
}
