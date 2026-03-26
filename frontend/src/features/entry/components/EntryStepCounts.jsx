import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import EntryProgress from "@/features/entry/components/EntryProgress";
import { calculateAtBats, calculateHits } from "@/features/entry/model/entry-validation";

function normalizeNumericValue(value) {
  const digitsOnly = value.replace(/[^\d]/g, "");
  if (digitsOnly === "") {
    return "0";
  }

  return digitsOnly.replace(/^0+(?=\d)/, "");
}

function NumericField({ label, value, onChange, isActive, isSelectable, inputRef, onActivate }) {
  const inputId = useId();

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
      tabIndex={0}
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
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        disabled={!isActive || !isSelectable}
        onChange={(event) => onChange(normalizeNumericValue(event.target.value))}
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
  const [activeFieldKey, setActiveFieldKey] = useState(fields[0]?.key ?? null);
  const atBats = useMemo(() => calculateAtBats(values), [values]);
  const totalHits = useMemo(() => calculateHits(values), [values]);
  const hitFields = useMemo(() => fields.slice(2), [fields]);
  const editableFieldKeys = useMemo(
    () => {
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
    },
    [atBats, fields, hitFields, totalHits, values],
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

  function goNextFieldOrSubmit() {
    if (isLastField) {
      onSubmit();
      return;
    }

    setActiveFieldKey(editableFields[activeIndex + 1].key);
  }

  return (
    <section className="entry-step-panel">
      <EntryProgress step={2} total={2} />
      <h1 className="entry-step-title">경기 기록 입력</h1>

      <div className="entry-number-grid">
        {fields.map((field) => (
          <NumericField
            key={field.key}
            label={field.label}
            value={values[field.key]}
            isActive={field.key === activeFieldKey}
            isSelectable={editableFieldKeys.includes(field.key)}
            inputRef={(node) => {
              inputRefs.current[field.key] = node;
            }}
            onActivate={() => setActiveFieldKey(field.key)}
            onChange={(nextValue) => onChange(field.key, nextValue)}
          />
        ))}
      </div>

      <p className="entry-field-hint">수정할 항목을 누르면 그 입력칸으로 다시 이동합니다.</p>

      {error ? <p className="entry-error-message">{error}</p> : null}

      <button type="button" className="entry-primary-button" onClick={goNextFieldOrSubmit} disabled={!canProceed}>
        {isLastField ? "저장" : "다음 항목"}
      </button>
    </section>
  );
}
