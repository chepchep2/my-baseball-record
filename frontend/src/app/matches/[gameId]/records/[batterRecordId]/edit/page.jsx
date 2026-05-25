import MatchRecordEditPageClient from "@/features/matches/components/MatchRecordEditPageClient";

export default async function MatchRecordEditPage({ params }) {
  const resolvedParams = await params;
  return (
    <MatchRecordEditPageClient
      gameId={resolvedParams.gameId}
      batterRecordId={resolvedParams.batterRecordId}
    />
  );
}
