import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import EntryProgress from "@/features/entry/components/EntryProgress";
import { calculateAtBats, calculateHits } from "@/features/entry/model/entry-validation";
import useKeyboardInset from "@/features/entry/components/useKeyboardInset";

function normalizeNumericValue(value) {
  const digitsOnly = value.replace(/[^\d]/g, "");
  if (digitsOnly === "") {
    return "0";
  }

  const normalizedValue = digitsOnly.replace(/^0+(?=\d)/, "");
  return String(Math.min(10, Number.parseInt(normalizedValue, 10)));
}

function NumericField({
  label,
  value,
  onChange,
  isActive,
  isSelectable,
  inputRef,
  onActivate,
  enterKeyHint,
  onSubmitKey,
}) {
  const inputId = useId();
  function handleSubmitIntent(event) {
    event.preventDefault();
    onSubmitKey();
  }

  return (
    <div
      className={[
        "entry-number-field",
        isActive ? "is-active" : "",
        !isSelectable ? "is-locked" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => {
        if (isSelectable) {
          onActivate();
        }
      }}
      role="button"
      tabIndex={-1}
      aria-disabled={!isSelectable}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (isSelectable) {
            onActivate();
          }
        }
      }}
    >
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        className="num-field"
        inputMode="numeric"
        pattern="\\d*"
        enterKeyHint={enterKeyHint}
        autoComplete="off"
        spellCheck={false}
        maxLength={2}
        value={value}
        disabled={!isSelectable}
        onFocus={() => {
          if (isSelectable && !isActive) {
            onActivate();
          }
        }}
        onChange={(event) => onChange(normalizeNumericValue(event.target.value))}
        onBeforeInput={(event) => {
          if (event.nativeEvent?.inputType === "insertLineBreak") {
            handleSubmitIntent(event);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleSubmitIntent(event);
          }
        }}
      />
    </div>
  );
}

export default function EntryStepCounts({
  fields,
  values,
  error,
  canProceed,
  onChange,
  onSubmit,
}) {
  const inputRefs = useRef({});
  const keyboardInset = useKeyboardInset();
  const [activeFieldKey, setActiveFieldKey] = useState(fields[0]?.key ?? null);
  const [iosFloatingTop, setIosFloatingTop] = useState(null);
  const hitFields = useMemo(() => fields.slice(2), [fields]);
  const editableFieldKeys = useMemo(
    () => getEditableFieldKeys(fields, hitFields, values),
    [fields, hitFields, values],
  );
  const editableFields = useMemo(
    () => fields.filter((field) => editableFieldKeys.includes(field.key)),
    [editableFieldKeys, fields],
  );
  const activeIndex = useMemo(
    () => Math.max(0, editableFields.findIndex((field) => field.key === activeFieldKey)),
    [activeFieldKey, editableFields],
  );
  const isLastField = activeIndex === editableFields.length - 1;
  const isIOS =
    typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);

  function submitCurrentStep(event) {
    event.preventDefault();
    goNextFieldOrSubmit();
  }

  function handleFormKeyDown(event) {
    const isSubmitKey =
      event.key === "Enter" ||
      event.key === "Next" ||
      event.key === "Go" ||
      event.keyCode === 13;

    if (!isSubmitKey) {
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.classList.contains("num-field")) {
      return;
    }

    event.preventDefault();
    goNextFieldOrSubmit();
  }

  useEffect(() => {
    const activeInput = inputRefs.current[activeFieldKey];
    if (activeInput) {
      activeInput.focus();
      activeInput.select?.();
    }
  }, [activeFieldKey]);

  useEffect(() => {
    if (!editableFieldKeys.includes(activeFieldKey)) {
      setActiveFieldKey(editableFieldKeys[editableFieldKeys.length - 1] ?? fields[0]?.key ?? null);
    }
  }, [activeFieldKey, editableFieldKeys, fields]);

  useEffect(() => {
    if (!isIOS || typeof window === "undefined" || !window.visualViewport) {
      setIosFloatingTop(null);
      return undefined;
    }

    const handleViewportChange = () => {
      const viewport = window.visualViewport;
      const nextInset = Math.max(0, window.innerHeight - viewport.height);

      if (nextInset <= 120) {
        setIosFloatingTop(null);
        return;
      }

      setIosFloatingTop(Math.max(12, viewport.offsetTop + viewport.height - 66));
    };

    handleViewportChange();
    window.visualViewport.addEventListener("resize", handleViewportChange);
    window.visualViewport.addEventListener("scroll", handleViewportChange);

    return () => {
      window.visualViewport.removeEventListener("resize", handleViewportChange);
      window.visualViewport.removeEventListener("scroll", handleViewportChange);
    };
  }, [isIOS]);

  function goNextFieldOrSubmit() {
    if (!canProceed) {
      return;
    }

    if (isLastField) {
      onSubmit();
      return;
    }

    setActiveFieldKey(editableFields[activeIndex + 1].key);
  }

  const fieldsMarkup = (
    <div className="entry-number-grid">
      {fields.map((field) => (
        <NumericField
          key={field.key}
          label={field.label}
          value={values[field.key]}
          isActive={field.key === activeFieldKey}
          isSelectable={editableFieldKeys.includes(field.key)}
          enterKeyHint={field.key === activeFieldKey && isLastField ? "done" : "next"}
          inputRef={(node) => {
            inputRefs.current[field.key] = node;
          }}
          onActivate={() => setActiveFieldKey(field.key)}
          onChange={(nextValue) => onChange(field.key, nextValue)}
          onSubmitKey={goNextFieldOrSubmit}
        />
      ))}
    </div>
  );

  return (
    <section className="entry-step-panel">
      <EntryProgress step={2} total={2} />
      <h1 className="entry-step-title">경기 기록 입력</h1>
      {isIOS ? (
        <>
          {fieldsMarkup}

          <p className="entry-field-hint">수정할 항목은 칸을 눌러 다시 입력하고, 다음 버튼으로 이동합니다.</p>

          {error ? <p className="entry-error-message">{error}</p> : null}

          {keyboardInset > 0 ? (
            <button
              type="button"
              className="entry-primary-button is-keyboard-floating"
              style={{
                top: `${iosFloatingTop ?? 12}px`,
                bottom: "auto",
              }}
              onClick={goNextFieldOrSubmit}
              disabled={!canProceed}
            >
              {isLastField ? "저장" : "다음"}
            </button>
          ) : (
            <button
              type="button"
              className="entry-primary-button"
              onClick={goNextFieldOrSubmit}
              disabled={!canProceed}
            >
              {isLastField ? "저장" : "다음"}
            </button>
          )}
        </>
      ) : (
        <form className="entry-counts-form" onSubmit={submitCurrentStep} onKeyDown={handleFormKeyDown}>
          {fieldsMarkup}

          <p className="entry-field-hint">수정할 항목은 칸을 눌러 다시 입력하고, 다음 버튼으로 이동합니다.</p>

          {error ? <p className="entry-error-message">{error}</p> : null}

          {keyboardInset === 0 ? (
            <button
              type="button"
              className="entry-primary-button"
              onClick={goNextFieldOrSubmit}
              disabled={!canProceed}
            >
              {isLastField ? "저장" : "다음"}
            </button>
          ) : null}
          <button type="submit" className="entry-hidden-submit" aria-hidden="true" tabIndex={-1}>
            {isLastField ? "저장" : "다음"}
          </button>
        </form>
      )}
    </section>
  );
}

function getEditableFieldKeys(fields, hitFields, values) {
  const atBats = calculateAtBats(values);
  const totalHits = calculateHits(values);
  const baseFields = fields.slice(0, 2).map((field) => field.key);

  if (atBats === 0) {
    return baseFields;
  }

  if (totalHits < atBats) {
    return fields.map((field) => field.key);
  }

  let lastFilledHitIndex = hitFields.findLastIndex((field) => Number.parseInt(values[field.key] ?? "0", 10) > 0);
  if (lastFilledHitIndex < 0) {
    lastFilledHitIndex = 0;
  }

  return [...baseFields, ...hitFields.slice(0, lastFilledHitIndex + 1).map((field) => field.key)];
}
