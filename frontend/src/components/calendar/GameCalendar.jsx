"use client";

import styles from "./GameCalendar.module.css";
import {
  buildMonthGrid,
  formatMonthTitle,
  getGameCountBadge,
  parseDateValue,
  shiftMonthValue,
} from "@/lib/mock-games";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function GameCalendar({
  monthValue,
  selectedDate,
  todayValue,
  countsByDate,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}) {
  const monthCells = buildMonthGrid(monthValue);

  return (
    <section className={styles.calendar} aria-label="월간 경기 캘린더">
      <div className={styles.header}>
        <h2 className={styles.monthTitle}>{formatMonthTitle(monthValue)}</h2>
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navButton}
            onClick={onPreviousMonth}
            aria-label={`${formatMonthTitle(shiftMonthValue(monthValue, -1))} 보기`}
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.navButton}
            onClick={onNextMonth}
            aria-label={`${formatMonthTitle(shiftMonthValue(monthValue, 1))} 보기`}
          >
            ›
          </button>
        </div>
      </div>

      <div className={styles.weekdayRow} aria-hidden="true">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className={styles.weekdayCell}>
            {weekday}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {monthCells.map((dateValue, index) => {
          if (!dateValue) {
            return <div key={`empty-${index}`} className={styles.dayPlaceholder} />;
          }

          const count = countsByDate[dateValue] || 0;
          const isSelected = dateValue === selectedDate;
          const isToday = dateValue === todayValue;

          return (
            <button
              key={dateValue}
              type="button"
              className={[
                styles.dayCell,
                isSelected ? styles.selected : "",
                isToday ? styles.today : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelectDate(dateValue)}
              aria-pressed={isSelected}
              aria-label={`${dateValue}${count > 0 ? `, 경기 ${count}건` : ""}`}
            >
              <span className={styles.dayNumber}>{String(parseDateValue(dateValue).day)}</span>
              {count > 0 ? <span className={styles.countBadge}>{getGameCountBadge(count)}</span> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
