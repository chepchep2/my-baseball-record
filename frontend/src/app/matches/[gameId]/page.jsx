import MatchDetailPageClient from "@/features/matches/components/MatchDetailPageClient";

export default async function MatchDetailPage({ params }) {
  const resolvedParams = await params;
  return <MatchDetailPageClient gameId={resolvedParams.gameId} />;
}
