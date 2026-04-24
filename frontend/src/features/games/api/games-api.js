import { toGameDetailViewModel } from "@/features/games/model/game-detail-view-model";

function formatAverage(value) {
  if (!value) {
    return ".000";
  }

  return String(value).startsWith("0") ? String(value).slice(1) : String(value);
}

function toGameSummaryItem(game) {
  return {
    id: game.gameId ?? game.id,
    playedDate: game.playedDate,
    playedLabel: game.playedAtLabel ?? game.playedLabel,
    summaryLabel: game.summaryLabel ?? `타석 ${game.plateAppearances} · 안타 ${game.hits} · 타율 ${formatAverage(game.battingAverage)}`,
  };
}

export async function getGames(apiClient, { year, month } = {}) {
  const params = new URLSearchParams();

  if (year) {
    params.set("year", String(year));
  }

  if (month) {
    params.set("month", String(month));
  }

  const query = params.toString();
  const response = await apiClient.get(query ? `/api/games?${query}` : "/api/games");
  return (response.items ?? []).map(toGameSummaryItem);
}

export async function getGameDetail(apiClient, gameId) {
  const response = await apiClient.get(`/api/games/${gameId}`);
  return toGameDetailViewModel(response);
}

export async function createGame(apiClient, payload) {
  const response = await apiClient.post("/api/games", payload);
  return toGameDetailViewModel(response);
}

export async function updateGame(apiClient, gameId, payload) {
  const response = await apiClient.put(`/api/games/${gameId}`, payload);
  return toGameDetailViewModel(response);
}

export async function deleteGame(apiClient, gameId) {
  return apiClient.delete(`/api/games/${gameId}`);
}
