import React, { useMemo, useState } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildCalendarCells(year, month, todayKey) {
  const firstWeekday = new Date(year, month, 1).getDay();

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, 1 - firstWeekday + index);
    const dateKey = formatDateKey(date);

    return {
      dateKey,
      day: date.getDate(),
      year: date.getFullYear(),
      month: date.getMonth(),
      isCurrentMonth: date.getFullYear() === year && date.getMonth() === month,
      isFutureDate: dateKey > todayKey,
      isToday: dateKey === todayKey,
    };
  });
}

export default function EntryCalendarSheet({
  open = true,
  selectedDate,
  onClose,
  onSelectDate,
  variant = "sheet",
}) {
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const selected = useMemo(() => new Date(`${selectedDate}T00:00:00`), [selectedDate]);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());
  const isInline = variant === "inline";
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const todayKey = formatDateKey(today);
  const availableYears = Array.from({ length: 5 }, (_, index) => today.getFullYear() - (4 - index));
  const availableMonths = viewYear === today.getFullYear()
    ? Array.from({ length: today.getMonth() + 1 }, (_, index) => index)
    : Array.from({ length: 12 }, (_, index) => index);

  const calendarCells = useMemo(
    () => buildCalendarCells(viewYear, viewMonth, todayKey),
    [todayKey, viewMonth, viewYear],
  );

  if (!open) {
    return null;
  }

  const calendarContent = (
    <div
      className={isInline ? "entry-calendar-inline" : "entry-calendar-sheet"}
      role={isInline ? undefined : "dialog"}
      aria-modal={isInline ? undefined : "true"}
      aria-label="날짜 선택"
    >
      {isInline ? null : (
        <div className="entry-calendar-sheet-header">
          <strong>날짜 선택</strong>
          <button type="button" onClick={onClose}>완료</button>
        </div>
      )}

      <button type="button" className="entry-calendar-month-trigger" onClick={() => setShowMonthPicker((value) => !value)}>
        {viewYear}년 {viewMonth + 1}월 ▼
      </button>

      {showMonthPicker ? (
        <div className="entry-calendar-month-picker">
          <select aria-label="연도 선택" value={viewYear} onChange={(event) => setViewYear(Number(event.target.value))}>
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}년</option>
            ))}
          </select>
          <select aria-label="월 선택" value={viewMonth} onChange={(event) => setViewMonth(Number(event.target.value))}>
            {availableMonths.map((month) => (
              <option key={month} value={month}>{month + 1}월</option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="entry-calendar-weekdays" aria-hidden="true">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="entry-calendar-weekday">
            {weekday}
          </div>
        ))}
      </div>

      <div className="entry-calendar-grid">
        {calendarCells.map((cell) => {
          const isSelected = cell.dateKey === selectedDate;
          const className = [
            "calendar-day",
            isSelected ? "is-selected" : "",
            cell.isToday ? "is-today" : "",
            !cell.isCurrentMonth ? "is-adjacent-month" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={cell.dateKey}
              type="button"
              className={className}
              aria-label={cell.dateKey}
              disabled={cell.isFutureDate}
              onClick={() => {
                if (cell.isFutureDate) {
                  return;
                }

                setViewYear(cell.year);
                setViewMonth(cell.month);
                onSelectDate(cell.dateKey);
                setShowMonthPicker(false);
              }}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (isInline) {
    return calendarContent;
  }

  return (
    <div className="entry-calendar-sheet-backdrop" role="presentation">
      {calendarContent}
    </div>
  );
}
