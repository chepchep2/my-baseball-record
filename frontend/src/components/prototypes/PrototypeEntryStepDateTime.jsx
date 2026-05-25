"use client";

import React from "react";
import EntryCalendarSheet from "@/features/entry/components/EntryCalendarSheet";

export default function PrototypeEntryStepDateTime({
  draft,
  onChangeDate,
  onChangeTime,
  onNext,
  title = null,
  children = null,
}) {
  const hourOptions = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));
  const minuteOptions = ["00", "10", "20", "30", "40", "50"];

  return (
    <section className="entry-step-panel">
      {title ? <h1 className="entry-step-title">{title}</h1> : null}

      <div className="entry-field-block">
        <span>날짜</span>
        <EntryCalendarSheet
          variant="inline"
          selectedDate={draft.date}
          onSelectDate={onChangeDate}
        />
      </div>

      <div className="entry-field-block entry-field-block-compact">
        <span>시간</span>
        <div className="entry-time-grid">
          <label className="entry-select-field">
            <span className="sr-only">시 선택</span>
            <select value={draft.hour} onChange={(event) => onChangeTime("hour", event.target.value)}>
              {hourOptions.map((hour) => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
          </label>
          <label className="entry-select-field">
            <span className="sr-only">분 선택</span>
            <select value={draft.minute} onChange={(event) => onChangeTime("minute", event.target.value)}>
              {minuteOptions.map((minute) => (
                <option key={minute} value={minute}>{minute}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {children}

      <button type="button" className="entry-primary-button entry-step-next-button" onClick={onNext}>
        다음
      </button>
    </section>
  );
}
