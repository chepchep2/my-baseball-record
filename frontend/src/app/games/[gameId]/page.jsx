import GameDetailPageClient from "@/components/games/GameDetailPageClient";

export default async function GameDetailPage({ params }) {
  const resolvedParams = await params;
  return <GameDetailPageClient gameId={resolvedParams.gameId} />;
}
