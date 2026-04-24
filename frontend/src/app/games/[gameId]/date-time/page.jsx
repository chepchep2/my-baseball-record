import GameDateTimeEditPageClient from "@/components/games/GameDateTimeEditPageClient";

export default async function GameDateTimeEditPage({ params }) {
  const resolvedParams = await params;
  return <GameDateTimeEditPageClient gameId={resolvedParams.gameId} />;
}
