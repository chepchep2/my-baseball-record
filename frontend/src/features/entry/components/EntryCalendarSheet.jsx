import React, { useMemo, useState } from "react";

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export default function EntryCalendarSheet({ open, selectedDate, onClose, onSelectDate }) {
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const selected = useMemo(() => new Date(`${selectedDate}T00:00:00`), [selectedDate]);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  const dayItems = useMemo(
    () => Array.from({ length: daysInMonth(viewYear, viewMonth) }, (_, index) => index + 1),
    [viewMonth, viewYear],
  );

  if (!open) {
    return null;
  }

  return (
    <div className="entry-calendar-sheet-backdrop" role="presentation">
      <div className="entry-calendar-sheet" role="dialog" aria-modal="true" aria-label="날짜 선택">
        <div className="entry-calendar-sheet-header">
          <strong>날짜 선택</strong>
          <button type="button" onClick={onClose}>완료</button>
        </div>

        <button type="button" className="entry-calendar-month-trigger" onClick={() => setShowMonthPicker((value) => !value)}>
          {viewYear}년 {viewMonth + 1}월 ▼
        </button>

        {showMonthPicker ? (
          <div className="entry-calendar-month-picker">
            <select aria-label="연도 선택" value={viewYear} onChange={(event) => setViewYear(Number(event.target.value))}>
              {Array.from({ length: 5 }, (_, index) => 2024 + index).map((year) => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
            <select aria-label="월 선택" value={viewMonth} onChange={(event) => setViewMonth(Number(event.target.value))}>
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index} value={index}>{index + 1}월</option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="entry-calendar-grid">
          {dayItems.map((day) => {
            const candidate = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isSelected = candidate === selectedDate;

            return (
              <button
                key={candidate}
                type="button"
                className={isSelected ? "calendar-day is-selected" : "calendar-day"}
                onClick={() => {
                  onSelectDate(candidate);
                  setShowMonthPicker(false);
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
