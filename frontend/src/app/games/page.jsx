import GamesPageClient from "@/components/games/GamesPageClient";
import { getTodayValue, mockGames } from "@/lib/mock-games";

export default function GamesPage() {
  return <GamesPageClient games={mockGames} initialTodayValue={getTodayValue()} />;
}
