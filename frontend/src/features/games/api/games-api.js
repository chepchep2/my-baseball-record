import { toGameDetailViewModel } from "@/features/games/model/game-detail-view-model";

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
