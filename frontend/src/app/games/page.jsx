import GamesPageClient from "@/components/games/GamesPageClient";
import { getTodayValue } from "@/lib/mock-games";

export default function GamesPage() {
  return <GamesPageClient games={[]} initialTodayValue={getTodayValue()} />;
}
