import React from "react";

export default function EntryStepDateTime({ draft, openCalendar, onChangeDate, onChangeTime, onNext }) {
  return (
    <section className="entry-step-panel">
      <p className="entry-step-progress">1 / 4</p>
      <h1 className="entry-step-title">경기 기록 입력</h1>

      <label className="entry-field-block">
        <span>날짜</span>
        <button type="button" className="entry-date-trigger" onClick={openCalendar}>
          <span>{draft.date}</span>
          <span>바텀시트 달력 선택</span>
        </button>
      </label>

      <div className="entry-field-block">
        <span>시간</span>
        <div className="entry-time-grid">
          <label className="entry-select-field">
            <span className="sr-only">시 선택</span>
            <select value={draft.hour} onChange={(event) => onChangeTime("hour", event.target.value)}>
              {Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0")).map((hour) => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
          </label>
          <label className="entry-select-field">
            <span className="sr-only">분 선택</span>
            <select value={draft.minute} onChange={(event) => onChangeTime("minute", event.target.value)}>
              {["00", "10", "20", "30", "40", "50"].map((minute) => (
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
