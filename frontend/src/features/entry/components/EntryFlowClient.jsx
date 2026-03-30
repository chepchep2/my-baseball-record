"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/features/auth/api/auth-api";
import { useAuthSession } from "@/features/auth/session/useAuthSession";
import EntryExitModal from "@/features/entry/components/EntryExitModal";
import EntryStepCounts from "@/features/entry/components/EntryStepCounts";
import EntryStepDateTime from "@/features/entry/components/EntryStepDateTime";
import { createGame } from "@/features/games/api/games-api";
import { buildEntryDraft } from "@/features/entry/model/entry-form";
import { buildGameCreatePayload } from "@/features/entry/model/entry-payload";
import { validateEntrySubmission } from "@/features/entry/model/entry-validation";

const ENTRY_FIELDS = [
  { key: "plateAppearances", label: "타석" },
  { key: "walksAndHitByPitch", label: "사사구" },
  { key: "singles", label: "1루타" },
  { key: "doubles", label: "2루타" },
  { key: "triples", label: "3루타" },
  { key: "homeRuns", label: "홈런" },
];

export default function EntryFlowClient() {
  const router = useRouter();
  const { apiClient } = useAuthSession();
  const initialDraft = useMemo(() => buildEntryDraft(new Date()), []);
  const [draft, setDraft] = useState(initialDraft);
  const [currentStep, setCurrentStep] = useState(1);
  const [showExitModal, setShowExitModal] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const stepError = useMemo(() => {
    if (currentStep === 2) {
      return validateEntrySubmission(draft).error;
    }

    return null;
  }, [currentStep, draft]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(initialDraft);

  useEffect(() => {
    const handlePopState = () => {
      if (currentStep > 1) {
        setCurrentStep((step) => Math.max(1, step - 1));
        return;
      }

      if (isDirty) {
        setShowExitModal(true);
        window.history.pushState({ milestoneEntry: true }, "");
      } else {
        router.push("/home");
      }
    };

    window.history.pushState({ milestoneEntry: true, step: currentStep }, "");
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [currentStep, isDirty, router]);

  function updateField(key, value) {
    setSubmitError(null);
    setDraft((current) => ({
      ...current,
      [key]: value === "" ? "0" : value,
    }));
  }

  function goNextStep() {
    setCurrentStep((step) => Math.min(2, step + 1));
  }

  async function saveEntry() {
    const result = validateEntrySubmission(draft);
    if (!result.isValid) {
      return;
    }

    const payload = buildGameCreatePayload(draft);

    try {
      await createGame(apiClient, payload);
      router.push("/home");
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message || "경기 기록을 저장하지 못했습니다.");
        return;
      }

      setSubmitError("경기 기록을 저장하지 못했습니다.");
    }
  }

  return (
    <div className="entry-flow-shell">
      {currentStep === 1 ? (
        <EntryStepDateTime
          draft={draft}
          onChangeDate={(date) => updateField("date", date)}
          onChangeTime={updateField}
          onNext={goNextStep}
        />
      ) : (
        <EntryStepCounts
          fields={ENTRY_FIELDS}
          values={draft}
          error={submitError ?? stepError}
          canProceed={stepError === null}
          onChange={updateField}
          onSubmit={saveEntry}
        />
      )}

      <EntryExitModal
        open={showExitModal}
        onContinue={() => setShowExitModal(false)}
        onExit={() => router.push("/home")}
      />
    </div>
  );
}
