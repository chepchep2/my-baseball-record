"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppPageLayout from "@/components/layout/AppPageLayout";
import PrototypeEntryStepCounts from "@/components/prototypes/PrototypeEntryStepCounts";
import { ApiError } from "@/features/auth/api/auth-api";
import { createMatchRecord } from "@/features/matches/api/matches-api";
import { useAuthSession } from "@/features/auth/session/useAuthSession";
import { buildEntryDraft } from "@/features/entry/model/entry-form";
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

export default function MatchRecordCreatePageClient({ gameId }) {
  const router = useRouter();
  const { apiClient } = useAuthSession();
  const initialDraft = useMemo(() => buildEntryDraft(new Date()), []);
  const [draft, setDraft] = useState(initialDraft);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepError = useMemo(() => validateEntrySubmission(draft).error, [draft]);

  function updateField(key, value) {
    setSubmitError(null);
    setDraft((current) => ({
      ...current,
      [key]: value === "" ? "0" : value,
    }));
  }

  async function saveRecord() {
    const result = validateEntrySubmission(draft);
    if (!result.isValid) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createMatchRecord(apiClient, gameId, {
        plateAppearances: Number(draft.plateAppearances),
        walksAndHitByPitch: Number(draft.walksAndHitByPitch),
        sacrificeBunts: Number(draft.sacrificeBunts),
        sacrificeFlies: Number(draft.sacrificeFlies),
        singles: Number(draft.singles),
        doubles: Number(draft.doubles),
        triples: Number(draft.triples),
        homeRuns: Number(draft.homeRuns),
      });
      router.push(`/matches/${gameId}`);
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : "기록을 저장하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppPageLayout showTabs={false} frameClassName="milestone-entry-frame">
      <div className="entry-flow-shell">
        <PrototypeEntryStepCounts
          fields={ENTRY_FIELDS}
          hitFieldStartIndex={4}
          values={draft}
          error={submitError ?? stepError}
          canProceed={stepError === null && !isSubmitting}
          onChange={updateField}
          onSubmit={saveRecord}
          title="내 기록 입력"
          onSecondaryAction={() => router.push(`/matches/${gameId}`)}
          secondaryActionLabel="경기 화면"
        />
      </div>
    </AppPageLayout>
  );
}
