import React, { useState } from "react";
import { Link } from "react-router-dom";

const batterSummaryCards = [
  ["경기수", "0"],
  ["타석", "0"],
  ["안타", "0"],
  ["타율", "0.000"],
  ["출루율", "0.000"],
  ["장타율", "0.000"],
  ["OPS", "0.000"],
  ["홈런", "0"],
];

const pitcherSummaryCards = [
  ["경기수", "0"],
  ["이닝", "0.0"],
  ["실점", "0"],
  ["ERA", "0.00"],
  ["WHIP", "0.00"],
  ["K/9", "0.00"],
  ["피안타율", "0.000"],
  ["삼진", "0"],
];

function StatsPage() {
  const [recordType, setRecordType] = useState("batter");
  const [recordRange, setRecordRange] = useState("season");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [showYearOptions, setShowYearOptions] = useState(false);
  const [gameFilter, setGameFilter] = useState("all");
  const summaryCards =
    recordType === "batter" ? batterSummaryCards : pitcherSummaryCards;
  const rangeDescription =
    recordRange === "season"
      ? "이번 시즌 기록을 보는 중입니다."
      : recordRange === "career"
        ? "통산 기록을 보는 중입니다."
        : `${selectedYear} 시즌 기록을 보는 중입니다.`;

  return (
    <main className="page-shell">
      <section className="page-frame">
        <header className="topbar">
          <div>
            <p className="eyebrow">My Baseball Record</p>
            <h1>시즌 기록</h1>
            <p className="section-copy">
              여러 출처의 기록을 한 화면에서 통합해서 확인합니다.
            </p>
          </div>
          <div className="action-row">
            <Link className="secondary-button" to="/games/new">
              경기 추가
            </Link>
            <button type="button" className="ghost-button">
              로그아웃
            </button>
          </div>
        </header>

        <section className="panel filter-panel">
          <div className="filter-group">
            <span className="filter-label">기록 범위</span>
            <div className="pill-row">
              <button
                type="button"
                className={recordRange === "season" ? "pill active" : "pill"}
                onClick={() => {
                  setRecordRange("season");
                  setShowYearOptions(false);
                }}
              >
                이번 시즌
              </button>
              <button
                type="button"
                className={recordRange === "career" ? "pill active" : "pill"}
                onClick={() => {
                  setRecordRange("career");
                  setShowYearOptions(false);
                }}
              >
                통산
              </button>
              <button
                type="button"
                className={recordRange === "year" ? "pill active" : "pill"}
                onClick={() => setShowYearOptions((prev) => !prev)}
              >
                연도 선택
              </button>
            </div>
            {showYearOptions ? (
              <div className="pill-row sub-filter-row">
                {["2025", "2024", "2023"].map((year) => (
                  <button
                    key={year}
                    type="button"
                    className={
                      recordRange === "year" && selectedYear === year
                        ? "pill active"
                        : "pill"
                    }
                    onClick={() => {
                      setSelectedYear(year);
                      setRecordRange("year");
                      setShowYearOptions(false);
                    }}
                  >
                    {year} 시즌
                  </button>
                ))}
              </div>
            ) : null}
            <p className="section-copy current-filter-copy">{rangeDescription}</p>
          </div>
          <div className="filter-group">
            <span className="filter-label">기록 축</span>
            <div className="pill-row">
              <button
                type="button"
                className={recordType === "batter" ? "pill active" : "pill"}
                aria-selected={recordType === "batter"}
                onClick={() => setRecordType("batter")}
              >
                타자
              </button>
              <button
                type="button"
                className={recordType === "pitcher" ? "pill active" : "pill"}
                aria-selected={recordType === "pitcher"}
                onClick={() => setRecordType("pitcher")}
              >
                투수
              </button>
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">경기 필터</span>
            <div className="pill-row">
              <button
                type="button"
                className={gameFilter === "all" ? "pill active" : "pill"}
                aria-pressed={gameFilter === "all"}
                onClick={() => setGameFilter("all")}
              >
                전체
              </button>
              <button
                type="button"
                className={gameFilter === "league" ? "pill active" : "pill"}
                aria-pressed={gameFilter === "league"}
                onClick={() => setGameFilter("league")}
              >
                리그
              </button>
              <button
                type="button"
                className={gameFilter === "non_official" ? "pill active" : "pill"}
                aria-pressed={gameFilter === "non_official"}
                onClick={() => setGameFilter("non_official")}
              >
                비공식 경기
              </button>
            </div>
          </div>
        </section>

        <section className="summary-grid" aria-label="기록 요약 카드">
          {summaryCards.map(([label, value]) => (
            <article key={label} className="stat-card">
              <p className="stat-label">{label}</p>
              <strong className="stat-value">{value}</strong>
            </article>
          ))}
        </section>

        <section className="panel detail-panel">
          <div className="section-header">
            <h2>상세 지표</h2>
            <p className="section-copy">
              기록이 아직 없어도 카드 구조는 유지하고 값은 0으로 표시합니다.
            </p>
          </div>
          {recordType === "batter" ? (
            <div className="detail-grid">
              <div>1루타 0</div>
              <div>2루타 0</div>
              <div>3루타 0</div>
              <div>홈런 0</div>
              <div>볼넷 0</div>
              <div>삼진 0</div>
              <div>사구 0</div>
              <div>타점 0</div>
              <div>득점 0</div>
              <div>도루 0</div>
              <div>도루자 0</div>
              <div>희생타 0</div>
            </div>
          ) : (
            <div className="detail-grid">
              <div>자책 0</div>
              <div>실점 0</div>
              <div>피안타 0</div>
              <div>피홈런 0</div>
              <div>볼넷 0</div>
              <div>사구 0</div>
              <div>상대한 타자 수 0</div>
              <div>승 0</div>
              <div>패 0</div>
              <div>세이브 0</div>
              <div>홀드 0</div>
              <div>삼진 0</div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default StatsPage;
