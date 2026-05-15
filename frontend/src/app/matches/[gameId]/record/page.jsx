import MatchRecordCreatePageClient from "@/features/matches/components/MatchRecordCreatePageClient";

export default async function MatchRecordCreatePage({ params }) {
  const resolvedParams = await params;
  return <MatchRecordCreatePageClient gameId={resolvedParams.gameId} />;
}
