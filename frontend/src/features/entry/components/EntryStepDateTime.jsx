import React from "react";
import EntryCalendarSheet from "@/features/entry/components/EntryCalendarSheet";
import EntryProgress from "@/features/entry/components/EntryProgress";
import { formatEntryDate, roundUpToNextTenMinutes } from "@/features/entry/model/entry-form";

export default function EntryStepDateTime({ draft, onChangeDate, onChangeTime, onNext }) {
  const now = new Date();
  const isToday = draft.date === formatEntryDate(now);
  const roundedNow = roundUpToNextTenMinutes(now);
  const latestHour = String(now.getHours()).padStart(2, "0");
  const availableHours = Array.from(
    { length: isToday ? Number(latestHour) + 1 : 24 },
    (_, hour) => String(hour).padStart(2, "0"),
  );
  const latestMinute = String(roundedNow.getMinutes()).padStart(2, "0");
  const availableMinutes = isToday && draft.hour === latestHour
    ? ["00", "10", "20", "30", "40", "50"].filter((minute) => minute <= latestMinute)
    : ["00", "10", "20", "30", "40", "50"];

  return (
    <section className="entry-step-panel">
      <EntryProgress step={1} total={2} />
      <h1 className="entry-step-title">경기 기록 입력</h1>

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
              {availableHours.map((hour) => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
          </label>
          <label className="entry-select-field">
            <span className="sr-only">분 선택</span>
            <select value={draft.minute} onChange={(event) => onChangeTime("minute", event.target.value)}>
              {availableMinutes.map((minute) => (
                <option key={minute} value={minute}>{minute}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <button type="button" className="entry-primary-button" onClick={onNext}>
        다음
      </button>
    </section>
  );
}
