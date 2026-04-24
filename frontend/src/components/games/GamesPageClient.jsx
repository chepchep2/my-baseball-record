"use client";

import React from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppPageLayout from "@/components/layout/AppPageLayout";
import { useAuthSession } from "@/features/auth/session/useAuthSession";
import { getGames } from "@/features/games/api/games-api";

const MONTH_OPTIONS = [
  { value: "", label: "전체" },
  { value: "1", label: "1월" },
  { value: "2", label: "2월" },
  { value: "3", label: "3월" },
  { value: "4", label: "4월" },
  { value: "5", label: "5월" },
  { value: "6", label: "6월" },
  { value: "7", label: "7월" },
  { value: "8", label: "8월" },
  { value: "9", label: "9월" },
  { value: "10", label: "10월" },
  { value: "11", label: "11월" },
  { value: "12", label: "12월" },
];

function getCurrentYear() {
  return new Date().getFullYear();
}

function getGameYear(game) {
  return Number(String(game.playedDate ?? "").slice(0, 4));
}

function getGameMonth(game) {
  return Number(String(game.playedDate ?? "").slice(5, 7));
}

function buildYearOptions(games) {
  return [...new Set(games.map(getGameYear).filter(Boolean))].sort((left, right) => right - left);
}

export default function GamesPageClient({ initialYear = getCurrentYear(), initialMonth = null }) {
  const router = useRouter();
  const { apiClient, isAuthenticated, isBootstrapping } = useAuthSession();
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadGames() {
      if (isBootstrapping) {
        return;
      }

      if (!isAuthenticated) {
        router.replace(`/auth?next=${encodeURIComponent("/games")}`);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result = await getGames(apiClient, {});
        if (active) {
          setGames(result);

          const years = buildYearOptions(result);
          if (years.length > 0) {
            setSelectedYear((currentYear) => (years.includes(currentYear) ? currentYear : years[0]));
          }
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error?.message || "경기 목록을 불러오지 못했습니다.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadGames();

    return () => {
      active = false;
    };
  }, [apiClient, isAuthenticated, isBootstrapping, router]);

  const yearOptions = useMemo(() => buildYearOptions(games), [games]);
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      if (getGameYear(game) !== selectedYear) {
        return false;
      }

      if (selectedMonth && getGameMonth(game) !== selectedMonth) {
        return false;
      }

      return true;
    });
  }, [games, selectedMonth, selectedYear]);

  return (
    <AppPageLayout showTabs={false} frameClassName="milestone-home-frame">
      <section className="panel milestone-home-panel">
        <div className="milestone-home-content">
          <div className="games-list-header">
            <h1 className="page-title">전체 경기 기록</h1>
          </div>

          <div className="games-list-filters">
            <label className="games-list-filter">
              <span>연도</span>
              <select
                aria-label="연도"
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </select>
            </label>

            <label className="games-list-filter">
              <span>월</span>
              <select
                aria-label="월"
                value={selectedMonth ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedMonth(value ? Number(value) : null);
                }}
              >
                {MONTH_OPTIONS.map((month) => (
                  <option key={month.value || "all"} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isLoading ? (
            <p className="section-copy">경기 목록을 불러오는 중입니다...</p>
          ) : errorMessage ? (
            <p className="section-copy">{errorMessage}</p>
          ) : filteredGames.length === 0 ? (
            <p className="section-copy">선택한 기간의 경기 기록이 없습니다.</p>
          ) : (
            <div className="milestone-home-recent-list" aria-label="전체 경기 목록">
              {filteredGames.map((game) => (
                <Link key={game.id} href={`/games/${game.id}`} className="milestone-home-recent-card">
                  <p className="milestone-home-recent-date">{game.playedLabel}</p>
                  <p className="milestone-home-recent-summary">{game.summaryLabel}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppPageLayout>
  );
}
