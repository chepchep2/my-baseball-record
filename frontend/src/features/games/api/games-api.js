import { toGameDetailViewModel } from "@/features/games/model/game-detail-view-model";

export async function getGameDetail(apiClient, gameId) {
  const response = await apiClient.get(`/api/games/${gameId}`);
  return toGameDetailViewModel(response);
}
