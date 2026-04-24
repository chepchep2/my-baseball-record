"use client";

import React from "react";
import AppPageLayout from "@/components/layout/AppPageLayout";
import EntryStepCounts from "@/features/entry/components/EntryStepCounts";
import { validateEntrySubmission } from "@/features/entry/model/entry-validation";
import { getGameDetail, updateGame } from "@/features/games/api/games-api";
import { useAuthSession } from "@/features/auth/session/useAuthSession";
import { buildGameRecordUpdatePayload } from "@/features/games/model/update-game-payload";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ENTRY_FIELDS = [
  { key: "plateAppearances", label: "타석" },
  { key: "walksAndHitByPitch", label: "사사구" },
  { key: "singles", label: "1루타" },
  { key: "doubles", label: "2루타" },
  { key: "triples", label: "3루타" },
  { key: "homeRuns", label: "홈런" },
];

function buildDraftFromGame(game) {
  return {
    plateAppearances: String(game.plateAppearances ?? game.batter?.plateAppearances ?? 0),
    walksAndHitByPitch: String(game.walksAndHitByPitch ?? ((game.batter?.walks ?? 0) + (game.batter?.hitByPitch ?? 0))),
    singles: String(game.singles ?? game.batter?.singles ?? 0),
    doubles: String(game.doubles ?? game.batter?.doubles ?? 0),
    triples: String(game.triples ?? game.batter?.triples ?? 0),
    homeRuns: String(game.homeRuns ?? game.batter?.homeRuns ?? 0),
  };
}

export default function GameRecordEditPageClient({ gameId }) {
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
      [key]: value === "" ? "0" : value,
    }));
  }

  async function saveGameRecord() {
    const validation = validateEntrySubmission(draft);
    if (!validation.isValid) {
      setErrorMessage(validation.error);
      return;
    }

    try {
      await updateGame(apiClient, gameId, buildGameRecordUpdatePayload(game, draft));
      router.push("/home");
    } catch (error) {
      setErrorMessage(error?.message || "경기 기록을 저장하지 못했습니다.");
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
      <EntryStepCounts
        fields={ENTRY_FIELDS}
        values={draft}
        error={errorMessage}
        canProceed={validateEntrySubmission(draft).error === null}
        onChange={updateField}
        onSubmit={saveGameRecord}
        title="경기 기록 수정"
        showProgress={false}
      />
    </AppPageLayout>
  );
}
