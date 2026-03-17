"use client";

import Link from "next/link";
import { useState } from "react";

const batterSummary = [
  ["경기수", "12"],
  ["타수", "37"],
  ["총안타", "14"],
  ["타율", "0.378"],
  ["OPS", "0.941"],
];

const pitcherSummary = [
  ["경기수", "7"],
  ["이닝", "18.2"],
  ["ERA", "2.41"],
  ["WHIP", "1.07"],
  ["삼진", "19"],
  ["승", "2"],
];

const batterDetails = [
  ["타석", "42"],
  ["홈런", "3"],
  ["타점", "11"],
  ["득점", "9"],
  ["1루타", "8"],
  ["2루타", "2"],
  ["3루타", "1"],
  ["루타", "27"],
  ["도루", "2"],
  ["도루자", "1"],
  ["볼넷", "4"],
  ["사구", "1"],
  ["삼진", "7"],
  ["희타", "0"],
  ["희비", "0"],
  ["고의 4구", "0"],
  ["멀티히트", "4"],
  ["병살", "1"],
];

const pitcherDetails = [
  ["패", "1"],
  ["홀드", "1"],
  ["세이브", "0"],
  ["타자", "75"],
  ["피안타", "15"],
  ["피홈런", "1"],
  ["볼넷", "4"],
  ["고의 4구", "0"],
  ["사구", "1"],
  ["실점", "6"],
  ["자책점", "5"],
  ["폭투", "0"],
  ["보크", "0"],
  ["피안타율", "0.214"],
  ["탈삼진율", "9.16"],
];

const batterZeroSummary = [
  ["경기수", "0"],
  ["타수", "0"],
  ["총안타", "0"],
  ["타율", "0.000"],
  ["OPS", "0.000"],
];

const pitcherZeroSummary = [
  ["경기수", "0"],
  ["이닝", "0.0"],
  ["ERA", "0.00"],
  ["WHIP", "0.00"],
  ["삼진", "0"],
  ["승", "0"],
];

const batterZeroDetails = [
  ["타석", "0"],
  ["홈런", "0"],
  ["타점", "0"],
  ["득점", "0"],
  ["1루타", "0"],
  ["2루타", "0"],
  ["3루타", "0"],
  ["루타", "0"],
  ["도루", "0"],
  ["도루자", "0"],
  ["볼넷", "0"],
  ["사구", "0"],
  ["삼진", "0"],
  ["희타", "0"],
  ["희비", "0"],
  ["고의 4구", "0"],
  ["멀티히트", "0"],
  ["병살", "0"],
];

const pitcherZeroDetails = [
  ["패", "0"],
  ["홀드", "0"],
  ["세이브", "0"],
  ["타자", "0"],
  ["피안타", "0"],
  ["피홈런", "0"],
  ["볼넷", "0"],
  ["고의 4구", "0"],
  ["사구", "0"],
  ["실점", "0"],
  ["자책점", "0"],
  ["폭투", "0"],
  ["보크", "0"],
  ["피안타율", "0.000"],
  ["탈삼진율", "0.00"],
];

function pairRows(metrics) {
  const rows = [];
  for (let index = 0; index < metrics.length; index += 2) {
    rows.push(metrics.slice(index, index + 2));
  }
  return rows;
}

export default function RecordDetailsPage() {
  const [recordType, setRecordType] = useState("batter");
  const [recordRange, setRecordRange] = useState("season");
  const [gameFilter, setGameFilter] = useState("all");
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const hasSeasonRecords = recordRange === "career" || selectedYear === currentYear;
  const summaryMetrics = recordType === "batter"
    ? hasSeasonRecords
      ? batterSummary
      : batterZeroSummary
    : hasSeasonRecords
      ? pitcherSummary
      : pitcherZeroSummary;
  const detailMetrics = recordType === "batter"
    ? hasSeasonRecords
      ? batterDetails
      : batterZeroDetails
    : hasSeasonRecords
      ? pitcherDetails
      : pitcherZeroDetails;
  return (
    <main className="page-shell">
      <section className="page-frame record-page">
        <section className="panel detail-screen-panel">
          <div className="page-title-block detail-title-block">
            <p className="eyebrow">My Baseball Record</p>
            <h1 className="page-title">상세 기록</h1>
          </div>

          <div className="detail-filter-stack">
            <div className="detail-top-row">
              <div className="pill-row detail-primary-row">
                <button
                  type="button"
                  className={recordRange === "season" ? "pill active" : "pill"}
                  onClick={() => setRecordRange("season")}
                >
                  시즌
                </button>
                <button
                  type="button"
                  className={recordRange === "career" ? "pill active" : "pill"}
                  onClick={() => setRecordRange("career")}
                >
                  통산
                </button>
              </div>

              <label className="season-select-wrap">
                <span className="sr-only">시즌 선택</span>
                <select
                  className="season-select"
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(Number(event.target.value))}
                  disabled={recordRange === "career"}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year} 시즌
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="detail-top-row">
              <div className="pill-row detail-type-row">
                <button
                  type="button"
                  className={recordType === "batter" ? "pill active" : "pill"}
                  onClick={() => setRecordType("batter")}
                >
                  타자
                </button>
                <button
                  type="button"
                  className={recordType === "pitcher" ? "pill active" : "pill"}
                  onClick={() => setRecordType("pitcher")}
                >
                  투수
                </button>
              </div>

              <label className="season-select-wrap">
                <span className="sr-only">경기 유형 선택</span>
                <select
                  className="season-select"
                  value={gameFilter}
                  onChange={(event) => setGameFilter(event.target.value)}
                >
                  <option value="all">전체 경기</option>
                  <option value="league">리그 경기</option>
                  <option value="nonOfficial">비공식 경기</option>
                </select>
              </label>
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

          <div className="footer-action-row">
            <Link className="ghost-button as-link full-width-button" href="/records">
              뒤로
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
