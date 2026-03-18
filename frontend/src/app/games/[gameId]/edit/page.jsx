import GameForm from "@/lib/GameForm";

export default async function GameEditPage({ params }) {
  const resolvedParams = await params;
  return <GameForm mode="edit" gameId={resolvedParams.gameId} />;
}
