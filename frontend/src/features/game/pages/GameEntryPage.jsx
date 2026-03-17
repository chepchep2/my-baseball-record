import React, { useState } from "react";
import { Link } from "react-router-dom";

function GameEntryPage() {
  const [recordTab, setRecordTab] = useState("batter");
  const [showAdvancedBatter, setShowAdvancedBatter] = useState(false);
  const [showAdvancedPitcher, setShowAdvancedPitcher] = useState(false);

  return (
    <main className="page-shell">
      <section className="page-frame">
        <header className="topbar">
          <div>
            <p className="eyebrow">My Baseball Record</p>
            <h1>경기 기록 입력</h1>
            <p className="section-copy">
              경기 정보 입력 후, 타자 기록과 투수 기록을 필요한 만큼 입력합니다.
            </p>
          </div>
          <div className="action-row">
            <button type="button" className="secondary-button">
              저장
            </button>
            <Link className="ghost-button as-link" to="/records">
              취소
            </Link>
          </div>
        </header>

        <section className="panel form-panel">
          <div className="section-header">
            <h2>1. 경기 정보</h2>
          </div>
          <div className="form-grid">
            <label className="field">
              <span>날짜</span>
              <input type="date" defaultValue="2026-03-17" />
            </label>
            <label className="field">
              <span>경기 유형</span>
              <select defaultValue="LEAGUE">
                <option value="LEAGUE">리그</option>
                <option value="NON_OFFICIAL">비공식 경기</option>
              </select>
            </label>
            <label className="field">
              <span>시즌/연도</span>
              <input type="text" defaultValue="2026" />
            </label>
            <label className="field">
              <span>소속 팀</span>
              <input type="text" defaultValue="레전드" />
            </label>
            <label className="field">
              <span>상대 팀</span>
              <input type="text" defaultValue="블루스톰" />
            </label>
            <label className="field full-width">
              <span>메모</span>
              <textarea rows="3" defaultValue="오늘 경기 메모" />
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="primary-button">
              다음
            </button>
          </div>
        </section>

        <section className="panel form-panel">
          <div className="section-header">
            <h2>2. 기록 입력</h2>
          </div>
          <div className="tab-row" role="tablist" aria-label="기록 입력 탭">
            <button
              type="button"
              className={recordTab === "batter" ? "tab-button active" : "tab-button"}
              role="tab"
              aria-selected={recordTab === "batter"}
              onClick={() => setRecordTab("batter")}
            >
              타자 기록
            </button>
            <button
              type="button"
              className={recordTab === "pitcher" ? "tab-button active" : "tab-button"}
              role="tab"
              aria-selected={recordTab === "pitcher"}
              onClick={() => setRecordTab("pitcher")}
            >
              투수 기록
            </button>
          </div>

          <p className="section-copy current-tab-copy">
            현재는 {recordTab === "batter" ? "타자 기록" : "투수 기록"} 탭이 선택된 상태입니다.
          </p>

          {recordTab === "batter" ? (
            <section className="record-panel single-panel">
              <h3>타자 기록</h3>
              <div className="compact-grid">
                <label className="field"><span>타석</span><input type="text" defaultValue="4" /></label>
                <label className="field"><span>타수</span><input type="text" defaultValue="3" /></label>
                <label className="field"><span>1루타</span><input type="text" defaultValue="1" /></label>
                <label className="field"><span>2루타</span><input type="text" defaultValue="0" /></label>
                <label className="field"><span>3루타</span><input type="text" defaultValue="0" /></label>
                <label className="field"><span>홈런</span><input type="text" defaultValue="1" /></label>
                <label className="field"><span>볼넷</span><input type="text" defaultValue="1" /></label>
                <label className="field"><span>삼진</span><input type="text" defaultValue="1" /></label>
                <label className="field"><span>사구</span><input type="text" defaultValue="0" /></label>
              </div>
              <button
                type="button"
                className="inline-link left-align"
                onClick={() => setShowAdvancedBatter((prev) => !prev)}
              >
                추가 기록 입력
              </button>
              {showAdvancedBatter ? (
                <div className="compact-grid advanced-grid">
                  <label className="field"><span>타점</span><input type="text" defaultValue="2" /></label>
                  <label className="field"><span>득점</span><input type="text" defaultValue="1" /></label>
                  <label className="field"><span>도루</span><input type="text" defaultValue="0" /></label>
                  <label className="field"><span>도루자</span><input type="text" defaultValue="0" /></label>
                  <label className="field"><span>희생타</span><input type="text" defaultValue="0" /></label>
                </div>
              ) : null}
            </section>
          ) : (
            <section className="record-panel single-panel">
              <h3>투수 기록</h3>
              <div className="compact-grid">
                <label className="field"><span>정수 이닝</span><input type="text" defaultValue="3" /></label>
                <label className="field">
                  <span>추가 아웃 수</span>
                  <select defaultValue="2">
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </label>
                <label className="field"><span>실점</span><input type="text" defaultValue="1" /></label>
                <label className="field"><span>자책</span><input type="text" defaultValue="1" /></label>
                <label className="field"><span>피안타</span><input type="text" defaultValue="4" /></label>
                <label className="field"><span>볼넷</span><input type="text" defaultValue="2" /></label>
                <label className="field"><span>삼진</span><input type="text" defaultValue="5" /></label>
              </div>
              <button
                type="button"
                className="inline-link left-align"
                onClick={() => setShowAdvancedPitcher((prev) => !prev)}
              >
                추가 기록 입력
              </button>
              {showAdvancedPitcher ? (
                <div className="compact-grid advanced-grid">
                  <label className="field"><span>사구</span><input type="text" defaultValue="0" /></label>
                  <label className="field"><span>피홈런</span><input type="text" defaultValue="0" /></label>
                  <label className="field"><span>상대한 타자 수</span><input type="text" defaultValue="18" /></label>
                  <label className="field"><span>승</span><input type="text" defaultValue="0" /></label>
                  <label className="field"><span>패</span><input type="text" defaultValue="0" /></label>
                  <label className="field"><span>세이브</span><input type="text" defaultValue="0" /></label>
                  <label className="field"><span>홀드</span><input type="text" defaultValue="1" /></label>
                </div>
              ) : null}
            </section>
          )}

          <div className="banner-placeholder">탭 상단 에러 요약 메시지 영역</div>

          <div className="form-actions">
            <button type="button" className="primary-button">
              저장
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

export default GameEntryPage;
