"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AppPageLayout from "@/components/layout/AppPageLayout";
import BottomTabBar from "@/components/navigation/BottomTabBar";
import PageHeader from "@/components/layout/PageHeader";

const batterSummary = [
  ["경기수", "24"],
  ["타수", "88"],
  ["총안타", "31"],
  ["타율", ".352"],
  ["OPS", ".898"],
];

const pitcherSummary = [
  ["경기수", "9"],
  ["이닝", "24.1"],
  ["ERA", "2.18"],
  ["WHIP", "1.03"],
  ["삼진", "22"],
  ["승", "3"],
];

const batterDetails = [
  ["타석", "96"],
  ["타수", "88"],
  ["총안타", "31"],
  ["홈런", "3"],
  ["타점", "18"],
  ["득점", "14"],
  ["1루타", "12"],
  ["2루타", "5"],
  ["3루타", "1"],
  ["도루", "4"],
  ["도루자", "1"],
  ["희생타", "2"],
  ["볼넷", "9"],
  ["사구", "2"],
  ["삼진", "7"],
];

const pitcherDetails = [
  ["경기수", "9"],
  ["이닝", "24.1"],
  ["ERA", "2.18"],
  ["WHIP", "1.03"],
  ["삼진", "22"],
  ["승", "3"],
  ["패", "1"],
  ["세이브", "0"],
  ["홀드", "1"],
  ["실점", "7"],
  ["자책", "6"],
  ["피안타", "18"],
  ["볼넷", "5"],
  ["사구", "1"],
  ["피안타율", ".214"],
];

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
  const currentYear = new Date().getFullYear();
  const recordType = searchParams.get("type") === "pitcher" ? "pitcher" : "batter";
  const scope = searchParams.get("scope") ?? `${currentYear}`;
  const gameFilter = searchParams.get("gameType") ?? "all";

  const yearOptions = useMemo(
    () => ["career", `${currentYear}`, `${currentYear - 1}`, `${currentYear - 2}`],
    [currentYear],
  );

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set(key, value);
    router.replace(`${pathname}?${next.toString()}`);
  };

  const summaryMetrics = recordType === "batter" ? batterSummary : pitcherSummary;
  const detailMetrics = recordType === "batter" ? batterDetails : pitcherDetails;

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
          <section className="inline-summary-grid" aria-label="대표 지표">
            {summaryMetrics.map(([label, value]) => (
              <article key={label} className="inline-summary-item">
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </section>

          <p className="detail-section-label">상세 지표</p>
          <section className="detail-metric-list" aria-label="상세 지표">
            {pairRows(detailMetrics).map((row, index) => (
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

          <BottomTabBar className="in-panel" />
        </section>
    </AppPageLayout>
  );
}
