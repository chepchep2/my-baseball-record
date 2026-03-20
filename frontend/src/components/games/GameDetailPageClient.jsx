"use client";

import AppPageLayout from "@/components/layout/AppPageLayout";
import GameDetailView from "@/components/games/GameDetailView";
import { useAuthSession } from "@/features/auth/session/useAuthSession";
import { getGameDetail } from "@/features/games/api/games-api";
import { useEffect, useState } from "react";

export default function GameDetailPageClient({ gameId }) {
  const { apiClient } = useAuthSession();
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadGameDetail() {
      setIsLoading(true);
      setNotFound(false);
      setErrorMessage(null);

      try {
        const result = await getGameDetail(apiClient, gameId);
        if (!active) {
          return;
        }
        setGame(result);
      } catch (error) {
        if (!active) {
          return;
        }

        if (error?.code === "GAME_NOT_FOUND" || error?.status === 404) {
          setNotFound(true);
          return;
        }

        setErrorMessage(error?.message || "경기 정보를 불러오지 못했습니다.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadGameDetail();

    return () => {
      active = false;
    };
  }, [apiClient, gameId]);

  if (isLoading) {
    return (
      <AppPageLayout showTabs={false}>
        <section className="panel detail-screen-panel">
          <div className="page-title-block">
            <p className="eyebrow">My Baseball Record</p>
            <h1 className="page-title">개별 경기 상세</h1>
            <p className="section-copy">경기 정보를 불러오는 중입니다.</p>
          </div>
        </section>
      </AppPageLayout>
    );
  }

  if (notFound) {
    return (
      <AppPageLayout showTabs={false}>
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

  if (errorMessage) {
    return (
      <AppPageLayout showTabs={false}>
        <section className="panel detail-screen-panel">
          <div className="page-title-block">
            <p className="eyebrow">My Baseball Record</p>
            <h1 className="page-title">개별 경기 상세</h1>
            <p className="section-copy">{errorMessage}</p>
          </div>
        </section>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout showTabs={false}>
      <GameDetailView game={game} />
    </AppPageLayout>
  );
}
