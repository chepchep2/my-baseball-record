import { isMockAuthMode } from "@/features/auth/api/auth-api";
import { buildHomeDashboardData } from "@/features/home/api/mock-home-store";
import { toHomeViewModel } from "@/features/home/model/home-view-model";

async function getStatsSummary(apiClient, scope) {
  return apiClient.get(`/api/stats?scope=${scope}`);
}

async function getRecentGames(apiClient) {
  const response = await apiClient.get("/api/games/recent?limit=3");
  return response.items ?? [];
}

export async function getHomeDashboard(apiClient, { selectedScope = "season" } = {}) {
  if (isMockAuthMode()) {
    return toHomeViewModel(buildHomeDashboardData(selectedScope));
  }

  const [seasonSummary, careerSummary, recentGames] = await Promise.all([
    getStatsSummary(apiClient, "season"),
    getStatsSummary(apiClient, "career"),
    getRecentGames(apiClient),
  ]);

  const isEmpty = recentGames.length === 0;

  return toHomeViewModel({
    seasonSummary,
    careerSummary,
    recentGames,
    selectedScope,
    isEmpty,
  });
}
