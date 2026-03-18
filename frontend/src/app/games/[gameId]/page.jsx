import GameDetailView from "@/components/games/GameDetailView";
import AppPageLayout from "@/components/layout/AppPageLayout";
import { getGameById, mockGames } from "@/lib/mock-games";

export default async function GameDetailPage({ params }) {
  const resolvedParams = await params;
  const game = getGameById(mockGames, resolvedParams.gameId);

  if (!game) {
    return (
      <AppPageLayout>
          <section className="panel detail-screen-panel">
            <div className="page-title-block">
              <p className="eyebrow">My Baseball Record</p>
              <h1 className="page-title">개별 경기 상세</h1>
              <p className="section-copy">해당 경기를 찾을 수 없습니다.</p>
            </div>
          </section>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout>
        <GameDetailView game={game} />
    </AppPageLayout>
  );
}
