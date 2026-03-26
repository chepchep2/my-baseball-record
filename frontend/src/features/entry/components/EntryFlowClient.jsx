"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveMockGame } from "@/features/home/api/mock-home-store";
import EntryCalendarSheet from "@/features/entry/components/EntryCalendarSheet";
import EntryExitModal from "@/features/entry/components/EntryExitModal";
import EntryStepCounts from "@/features/entry/components/EntryStepCounts";
import EntryStepDateTime from "@/features/entry/components/EntryStepDateTime";
import { buildEntryDraft } from "@/features/entry/model/entry-form";
import { buildMockGameRecord } from "@/features/entry/model/entry-payload";
import { validateEntrySubmission, validateStep2, validateStep3, validateStep4 } from "@/features/entry/model/entry-validation";

const STEP_FIELDS = {
  2: [
    { key: "plateAppearances", label: "타석" },
    { key: "walksAndHitByPitch", label: "사사구" },
  ],
  3: [
    { key: "singles", label: "1루타" },
    { key: "doubles", label: "2루타" },
  ],
  4: [
    { key: "triples", label: "3루타" },
    { key: "homeRuns", label: "홈런" },
  ],
};

export default function EntryFlowClient() {
  const router = useRouter();
  const initialDraft = useMemo(() => buildEntryDraft(new Date()), []);
  const [draft, setDraft] = useState(initialDraft);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const stepError = useMemo(() => {
    if (currentStep === 2) {
      return validateStep2(draft).error;
    }

    if (currentStep === 3) {
      return validateStep3(draft).error;
    }

    if (currentStep === 4) {
      return validateStep4(draft).error;
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
    setDraft((current) => ({
      ...current,
      [key]: value === "" ? "0" : value,
    }));
  }

  function goNextStep() {
    setCurrentStep((step) => Math.min(4, step + 1));
  }

  function saveEntry() {
    const result = validateEntrySubmission(draft);
    if (!result.isValid) {
      return;
    }

    saveMockGame(buildMockGameRecord(draft));
    router.push("/home");
  }

  return (
    <div className="entry-flow-shell">
      {currentStep === 1 ? (
        <EntryStepDateTime
          draft={draft}
          openCalendar={() => setIsCalendarOpen(true)}
          onChangeDate={(date) => updateField("date", date)}
          onChangeTime={updateField}
          onNext={goNextStep}
        />
      ) : (
        <EntryStepCounts
          step={currentStep}
          fields={STEP_FIELDS[currentStep]}
          values={draft}
          error={stepError}
          canProceed={stepError === null}
          actionLabel={currentStep === 4 ? "저장" : "다음"}
          onChange={updateField}
          onSubmit={currentStep === 4 ? saveEntry : goNextStep}
        />
      )}

      <EntryCalendarSheet
        open={isCalendarOpen}
        selectedDate={draft.date}
        onClose={() => setIsCalendarOpen(false)}
        onSelectDate={(date) => updateField("date", date)}
      />

      <EntryExitModal
        open={showExitModal}
        onContinue={() => setShowExitModal(false)}
        onExit={() => router.push("/home")}
      />
    </div>
  );
}
