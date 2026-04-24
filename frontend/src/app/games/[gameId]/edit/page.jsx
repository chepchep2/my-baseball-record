import GameRecordEditPageClient from "@/components/games/GameRecordEditPageClient";

export default async function GameEditPage({ params }) {
  const resolvedParams = await params;
  return <GameRecordEditPageClient gameId={resolvedParams.gameId} />;
}
