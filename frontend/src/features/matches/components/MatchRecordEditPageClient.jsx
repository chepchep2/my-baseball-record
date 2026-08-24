"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppPageLayout from "@/components/layout/AppPageLayout";
import PrototypeEntryStepCounts from "@/components/prototypes/PrototypeEntryStepCounts";
import { ApiError } from "@/features/auth/api/auth-api";
import { useAuthSession } from "@/features/auth/session/useAuthSession";
import {
  getMatchRecordDetail,
  updateMatchRecord,
} from "@/features/matches/api/matches-api";
import { validateEntrySubmission } from "@/features/entry/model/entry-validation";

const ENTRY_FIELDS = [
  { key: "plateAppearances", label: "타석" },
  { key: "walksAndHitByPitch", label: "사사구" },
  { key: "sacrificeBunts", label: "희생번트" },
  { key: "sacrificeFlies", label: "희생플라이" },
  { key: "singles", label: "1루타" },
  { key: "doubles", label: "2루타" },
  { key: "triples", label: "3루타" },
  { key: "homeRuns", label: "홈런" },
];

function buildDraftFromRecord(record) {
  return {
    plateAppearances: String(record.plateAppearances ?? 0),
    walksAndHitByPitch: String(record.walksAndHitByPitch ?? 0),
    sacrificeBunts: String(record.sacrificeBunts ?? 0),
    sacrificeFlies: String(record.sacrificeFlies ?? 0),
    singles: String(record.singles ?? 0),
    doubles: String(record.doubles ?? 0),
    triples: String(record.triples ?? 0),
    homeRuns: String(record.homeRuns ?? 0),
  };
}

export default function MatchRecordEditPageClient({ gameId, batterRecordId }) {
  const router = useRouter();
  const { apiClient, user } = useAuthSession();
  const [record, setRecord] = useState(null);
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadRecord() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result = await getMatchRecordDetail(apiClient, gameId, batterRecordId);
        if (!active) {
          return;
        }

        if (user?.id != null && result.userId !== user.id) {
          setErrorMessage("본인 기록만 수정할 수 있습니다.");
          setRecord(null);
          setDraft(null);
          return;
        }

        setRecord(result);
        setDraft(buildDraftFromRecord(result));
      } catch (error) {
        if (active) {
          setErrorMessage(error instanceof ApiError ? error.message : "기록 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadRecord();
    return () => {
      active = false;
    };
  }, [apiClient, batterRecordId, gameId, user?.id]);

  const stepError = useMemo(() => {
    if (!draft) {
      return null;
    }
    return validateEntrySubmission(draft).error;
  }, [draft]);

  function updateField(key, value) {
    setErrorMessage(null);
    setDraft((current) => ({
      ...current,
      [key]: value === "" ? "0" : value,
    }));
  }

  async function saveRecord() {
    const validation = validateEntrySubmission(draft);
    if (!validation.isValid) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await updateMatchRecord(apiClient, gameId, batterRecordId, {
        plateAppearances: Number(draft.plateAppearances),
        walksAndHitByPitch: Number(draft.walksAndHitByPitch),
        sacrificeBunts: Number(draft.sacrificeBunts),
        sacrificeFlies: Number(draft.sacrificeFlies),
        singles: Number(draft.singles),
        doubles: Number(draft.doubles),
        triples: Number(draft.triples),
        homeRuns: Number(draft.homeRuns),
      });
      router.push(`/matches/${gameId}/records/${batterRecordId}`);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "기록을 수정하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !draft || !record) {
    return (
      <AppPageLayout showTabs={false} frameClassName="milestone-entry-frame">
        <div className="entry-flow-shell">
          <div className="entry-step-panel">
            <p className="section-copy">{errorMessage ?? "기록 정보를 불러오는 중입니다."}</p>
          </div>
        </div>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout showTabs={false} frameClassName="milestone-entry-frame">
      <div className="entry-flow-shell">
        <PrototypeEntryStepCounts
          fields={ENTRY_FIELDS}
          hitFieldStartIndex={4}
          values={draft}
          error={errorMessage ?? stepError}
          canProceed={stepError === null && !isSubmitting}
          onChange={updateField}
          onSubmit={saveRecord}
          title="내 기록 수정"
        />
      </div>
    </AppPageLayout>
  );
}
