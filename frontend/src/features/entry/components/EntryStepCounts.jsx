import React from "react";

function NumericField({ label, value, onChange }) {
  return (
    <label className="entry-number-field">
      <span>{label}</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ""))}
      />
    </label>
  );
}

export default function EntryStepCounts({
  step,
  fields,
  values,
  error,
  canProceed,
  actionLabel,
  onChange,
  onSubmit,
}) {
  return (
    <section className="entry-step-panel">
      <p className="entry-step-progress">{step} / 4</p>
      <h1 className="entry-step-title">경기 기록 입력</h1>

      <div className="entry-number-grid">
        {fields.map((field) => (
          <NumericField
            key={field.key}
            label={field.label}
            value={values[field.key]}
            onChange={(nextValue) => onChange(field.key, nextValue)}
          />
        ))}
      </div>

      {error ? <p className="entry-error-message">{error}</p> : null}

      <button type="button" className="entry-primary-button" onClick={onSubmit} disabled={!canProceed}>
        {actionLabel}
      </button>
    </section>
  );
}
