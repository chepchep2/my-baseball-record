"use client";

import React from "react";
import AppPageLayout from "@/components/layout/AppPageLayout";
import EntryStepDateTime from "@/features/entry/components/EntryStepDateTime";
import { getGameDetail, updateGame } from "@/features/games/api/games-api";
import { useAuthSession } from "@/features/auth/session/useAuthSession";
import { buildGameDateTimeUpdatePayload } from "@/features/games/model/update-game-payload";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function buildDraftFromGame(game) {
  return {
    date: game.playedDate ?? game.playedAt,
    hour: String(game.playedHour ?? 0).padStart(2, "0"),
    minute: String(game.playedMinute ?? 0).padStart(2, "0"),
  };
}

export default function GameDateTimeEditPageClient({ gameId }) {
  const router = useRouter();
  const { apiClient } = useAuthSession();
  const [game, setGame] = useState(null);
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadGame() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result = await getGameDetail(apiClient, gameId);
        if (!active) {
          return;
        }

        setGame(result);
        setDraft(buildDraftFromGame(result));
      } catch (error) {
        if (active) {
          setErrorMessage(error?.message || "경기 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadGame();

    return () => {
      active = false;
    };
  }, [apiClient, gameId]);

  function updateField(key, value) {
    setErrorMessage(null);
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveGameDateTime() {
    try {
      await updateGame(apiClient, gameId, buildGameDateTimeUpdatePayload(game, draft));
      router.push(`/games/${gameId}`);
    } catch (error) {
      setErrorMessage(error?.message || "경기 일시를 저장하지 못했습니다.");
    }
  }

  if (isLoading || !draft) {
    return (
      <AppPageLayout showTabs={false} frameClassName="form-center-frame">
        <section className="panel form-panel">
          <p className="section-copy">경기 정보를 불러오는 중입니다...</p>
        </section>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout showTabs={false} frameClassName="form-center-frame">
      <EntryStepDateTime
        draft={draft}
        onChangeDate={(date) => updateField("date", date)}
        onChangeTime={updateField}
        onNext={saveGameDateTime}
        title="경기 기록"
        primaryActionLabel="저장"
        showProgress={false}
      />
      {errorMessage ? (
        <section className="panel form-panel">
          <p className="entry-error-message">{errorMessage}</p>
        </section>
      ) : null}
    </AppPageLayout>
  );
}
