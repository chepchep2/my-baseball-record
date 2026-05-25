import MatchRecordDetailPageClient from "@/features/matches/components/MatchRecordDetailPageClient";

export default async function MatchRecordDetailPage({ params }) {
  const resolvedParams = await params;
  return (
    <MatchRecordDetailPageClient
      gameId={resolvedParams.gameId}
      batterRecordId={resolvedParams.batterRecordId}
    />
  );
}
