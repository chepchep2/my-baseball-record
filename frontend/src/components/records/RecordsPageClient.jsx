"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AppPageLayout from "@/components/layout/AppPageLayout";
import BottomTabBar from "@/components/navigation/BottomTabBar";
import PageHeader from "@/components/layout/PageHeader";
import { useAuthSession } from "@/features/auth/session/useAuthSession";
import { getStats } from "@/features/stats/api/stats-api";

function pairRows(metrics) {
  const rows = [];
  for (let index = 0; index < metrics.length; index += 2) {
    rows.push(metrics.slice(index, index + 2));
  }
  return rows;
}

export default function RecordsPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { apiClient } = useAuthSession();
  const currentYear = new Date().getFullYear();
  const recordType = searchParams.get("type") === "pitcher" ? "pitcher" : "batter";
  const scope = searchParams.get("scope") ?? `${currentYear}`;
  const gameFilter = searchParams.get("gameType") ?? "all";
  const [statsView, setStatsView] = useState({
    summaryItems: [],
    detailItems: [],
    isEmpty: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const yearOptions = useMemo(
    () => ["career", `${currentYear}`, `${currentYear - 1}`, `${currentYear - 2}`],
    [currentYear],
  );

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set(key, value);
    router.replace(`${pathname}?${next.toString()}`);
  };

  useEffect(() => {
    let active = true;

    async function loadStats() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextScope = scope === "career" ? "career" : "season";
        const seasonYear = nextScope === "season" ? Number.parseInt(scope, 10) || currentYear : undefined;
        const nextGameFilter = gameFilter === "nonOfficial" ? "non_official" : gameFilter;

        const result = await getStats(apiClient, {
          scope: nextScope,
          seasonYear,
          recordType,
          gameFilter: nextGameFilter,
        });

        if (!active) {
          return;
        }

        setStatsView(result);
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorMessage(error?.message || "기록을 불러오지 못했습니다.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      active = false;
    };
  }, [apiClient, currentYear, gameFilter, recordType, scope]);

  return (
    <AppPageLayout showTabs={false}>
        <section className="panel detail-screen-panel">
          <PageHeader title="누적 기록" />

          <div className="detail-filter-stack">
            <div className="detail-top-row">
              <label className="season-select-wrap grow-select">
                <span className="sr-only">범위 선택</span>
                <select
                  className="season-select"
                  value={scope}
                  onChange={(event) => updateParam("scope", event.target.value)}
                >
                  {yearOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "career" ? "통산" : `${option} 시즌`}
                    </option>
                  ))}
                </select>
              </label>

              <label className="season-select-wrap grow-select">
                <span className="sr-only">경기 유형 선택</span>
                <select
                  className="season-select"
                  value={gameFilter}
                  onChange={(event) => updateParam("gameType", event.target.value)}
                >
                  <option value="all">전체 경기</option>
                  <option value="league">리그 경기</option>
                  <option value="nonOfficial">비공식 경기</option>
                </select>
              </label>
            </div>

            <div className="pill-row detail-type-row">
              <button
                type="button"
                className={recordType === "batter" ? "pill active" : "pill"}
                onClick={() => updateParam("type", "batter")}
              >
                타자
              </button>
              <button
                type="button"
                className={recordType === "pitcher" ? "pill active" : "pill"}
                onClick={() => updateParam("type", "pitcher")}
              >
                투수
              </button>
            </div>
          </div>

          <p className="detail-section-label">대표 지표</p>
          {isLoading ? (
            <p className="section-copy">기록을 불러오는 중입니다...</p>
          ) : errorMessage ? (
            <p className="section-copy">{errorMessage}</p>
          ) : statsView.isEmpty ? (
            <p className="section-copy">아직 기록이 없습니다. 첫 경기를 저장해 보세요.</p>
          ) : (
            <>
              <section className="inline-summary-grid" aria-label="대표 지표">
                {statsView.summaryItems.map(([label, value]) => (
                  <article key={label} className="inline-summary-item">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </article>
                ))}
              </section>

              <p className="detail-section-label">상세 지표</p>
              <section className="detail-metric-list" aria-label="상세 지표">
                {pairRows(statsView.detailItems).map((row, index) => (
                  <div key={`${row[0][0]}-${index}`} className="detail-row">
                    {row.map(([label, value]) => (
                      <div key={label} className="detail-pair">
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                    {row.length === 1 ? <div className="ghost-pair" aria-hidden="true" /> : null}
                  </div>
                ))}
              </section>
            </>
          )}

          <BottomTabBar className="in-panel" />
        </section>
    </AppPageLayout>
  );
}
