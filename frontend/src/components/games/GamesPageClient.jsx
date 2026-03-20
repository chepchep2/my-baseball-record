"use client";

import { useEffect, useMemo, useState } from "react";
import GameCalendar from "@/components/calendar/GameCalendar";
import GameCards from "@/components/games/GameCards";
import AppPageLayout from "@/components/layout/AppPageLayout";
import BottomTabBar from "@/components/navigation/BottomTabBar";
import PageHeader from "@/components/layout/PageHeader";
import { filterDeletedGames } from "@/lib/game-deletions";
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
  const [visibleGames, setVisibleGames] = useState(games);

  useEffect(() => {
    setVisibleGames(filterDeletedGames(games));
  }, [games]);

  const countsByDate = useMemo(() => buildGameCountMap(visibleGames), [visibleGames]);
  const selectedGames = useMemo(
    () => getGamesForDate(visibleGames, selectedDate),
    [visibleGames, selectedDate],
  );

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
    <AppPageLayout showTabs={false} frameClassName="games-center-frame">
        <section className="panel games-panel">
          <PageHeader title="경기" />

          <GameCalendar
            monthValue={visibleMonthValue}
            selectedDate={selectedDate}
            todayValue={todayValue}
            countsByDate={countsByDate}
            onPreviousMonth={() => moveMonth(-1)}
            onNextMonth={() => moveMonth(1)}
            onSelectDate={setSelectedDate}
          />

          <GameCards selectedDate={selectedDate} games={selectedGames} />

          <BottomTabBar className="in-panel" />
        </section>
    </AppPageLayout>
  );
}
