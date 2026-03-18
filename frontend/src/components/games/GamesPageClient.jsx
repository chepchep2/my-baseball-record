"use client";

import { useState } from "react";
import GameCalendar from "@/components/calendar/GameCalendar";
import GameCards from "@/components/games/GameCards";
import AppPageLayout from "@/components/layout/AppPageLayout";
import {
  buildGameCountMap,
  clampDateValueToMonth,
  getGamesForDate,
  getTodayValue,
  parseDateValue,
  shiftMonthValue,
} from "@/lib/mock-games";

function getMonthValueFromDateValue(dateValue) {
  const { year, month } = parseDateValue(dateValue);
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

export default function GamesPageClient({ games, initialTodayValue }) {
  const todayValue = initialTodayValue || getTodayValue();
  const [selectedDate, setSelectedDate] = useState(todayValue);
  const [visibleMonthValue, setVisibleMonthValue] = useState(
    getMonthValueFromDateValue(todayValue),
  );

  const countsByDate = buildGameCountMap(games);
  const selectedGames = getGamesForDate(games, selectedDate);

  const moveMonth = (offset) => {
    setVisibleMonthValue((currentMonthValue) => {
      const nextMonthValue = shiftMonthValue(currentMonthValue, offset);
      setSelectedDate((currentSelectedDate) =>
        clampDateValueToMonth(currentSelectedDate, nextMonthValue),
      );
      return nextMonthValue;
    });
  };

  return (
    <AppPageLayout>
        <section className="panel games-panel">
          <div className="page-title-block">
            <p className="eyebrow">My Baseball Record</p>
            <h1 className="page-title">경기</h1>
          </div>

          <GameCalendar
            monthValue={visibleMonthValue}
            selectedDate={selectedDate}
            todayValue={todayValue}
            countsByDate={countsByDate}
            onPreviousMonth={() => moveMonth(-1)}
            onNextMonth={() => moveMonth(1)}
            onSelectDate={setSelectedDate}
          />
        </section>

        <GameCards selectedDate={selectedDate} games={selectedGames} />
    </AppPageLayout>
  );
}
