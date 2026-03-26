import { toHomeViewModel } from "@/features/home/model/home-view-model";
import { buildHomeDashboardData } from "@/features/home/api/mock-home-store";

export async function getHomeDashboard({ selectedScope = "season" } = {}) {
  return toHomeViewModel(buildHomeDashboardData(selectedScope));
}
