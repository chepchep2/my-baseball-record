"use client";

import Link from "next/link";
import { useState } from "react";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function GamesNewPage() {
  const today = new Date();
  const todayValue = formatDate(today);
  const [gameDate, setGameDate] = useState(todayValue);
  const [season, setSeason] = useState(String(today.getFullYear()));
  const [step, setStep] = useState("info");
  const [showOptionalInfo, setShowOptionalInfo] = useState(false);
  const [recordTab, setRecordTab] = useState("batter");
  const [batterGroupIndex, setBatterGroupIndex] = useState(0);
  const [pitcherGroupIndex, setPitcherGroupIndex] = useState(0);

  const handleDateChange = (event) => {
    const nextDate = event.target.value;
    const normalizedDate = nextDate > todayValue ? todayValue : nextDate;
    setGameDate(normalizedDate);

    if (normalizedDate) {
      setSeason(normalizedDate.slice(0, 4));
    }
  };

  const batterGroups = [
    {
      label: "기본 구성",
      fields: [
        { label: "타석" },
        { label: "타수" },
        { label: "1루타" },
        { label: "2루타" },
        { label: "3루타" },
        { label: "홈런" },
      ],
    },
    {
      label: "추가 구성",
      fields: [
        { label: "볼넷" },
        { label: "삼진" },
        { label: "사구" },
        { label: "타점" },
        { label: "득점" },
        { label: "도루" },
        { label: "도루자" },
        { label: "희타" },
      ],
    },
  ];

  const pitcherGroups = [
    {
      label: "이닝",
      fields: [
        { label: "이닝", type: "input" },
        { label: "추가 아웃 수", value: "", type: "select" },
      ],
    },
    {
      label: "기본 기록",
      fields: [
        { label: "실점" },
        { label: "자책" },
        { label: "피안타" },
        { label: "볼넷" },
        { label: "삼진" },
      ],
    },
    {
      label: "추가 기록",
      fields: [
        { label: "사구" },
        { label: "피홈런" },
        { label: "상대한 타자 수" },
        { label: "승" },
        { label: "패" },
        { label: "세이브" },
        { label: "홀드" },
      ],
    },
  ];

  const batterGroup = batterGroups[batterGroupIndex];
  const pitcherGroup = pitcherGroups[pitcherGroupIndex];

  return (
    <main className="page-shell">
      <section className="page-frame record-page">
        <section className="panel form-panel">
          <div className="page-title-block form-title-block">
            <p className="eyebrow">My Baseball Record</p>
            <h1 className="page-title">경기 생성 및 기록 입력</h1>
          </div>

          {step === "info" ? (
            <>
              <div className="form-grid">
                <label className="field">
                  <span>날짜</span>
                  <input type="date" value={gameDate} max={todayValue} onChange={handleDateChange} />
                </label>
                <label className="field">
                  <span>경기 유형</span>
                  <select defaultValue="LEAGUE">
                    <option value="LEAGUE">리그</option>
                    <option value="NON_OFFICIAL">비공식 경기</option>
                  </select>
                </label>
              </div>

              <button
                type="button"
                className="inline-link left-align"
                onClick={() => setShowOptionalInfo((prev) => !prev)}
              >
                {showOptionalInfo ? "선택 정보 닫기" : "선택 정보 더 입력하기"}
              </button>

              {showOptionalInfo ? (
                <div className="form-grid advanced-grid">
                  <label className="field">
                    <span>시즌</span>
                    <input type="text" value={season} readOnly />
                  </label>
                  <label className="field">
                    <span>소속 팀</span>
                    <input type="text" placeholder="선택 입력" />
                  </label>
                  <label className="field">
                    <span>상대 팀</span>
                    <input type="text" placeholder="선택 입력" />
                  </label>
                  <label className="field full-width">
                    <span>메모</span>
                    <textarea rows="3" placeholder="선택 입력" />
                  </label>
                </div>
              ) : null}

              <div className="footer-action-row">
                <Link className="ghost-button as-link full-width-button" href="/records">
                  취소
                </Link>
                <button
                  type="button"
                  className="primary-button full-width-button"
                  onClick={() => setStep("record")}
                >
                  다음
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="tab-row" role="tablist" aria-label="기록 탭 전환">
                <button
                  type="button"
                  className={recordTab === "batter" ? "tab-button active" : "tab-button"}
                  onClick={() => setRecordTab("batter")}
                >
                  타자
                </button>
                <button
                  type="button"
                  className={recordTab === "pitcher" ? "tab-button active" : "tab-button"}
                  onClick={() => setRecordTab("pitcher")}
                >
                  투수
                </button>
              </div>

              {recordTab === "batter" ? (
                <section className="record-block">
                  <section className="record-section">
                    <p className="detail-section-label">{batterGroup.label}</p>
                    <div className="record-grid">
                      {batterGroup.fields.map((field) => (
                        <label key={field.label} className="field">
                          <span>{field.label}</span>
                          <input type="text" placeholder="입력" />
                        </label>
                      ))}
                    </div>
                  </section>

                  <div className="footer-action-row">
                    {batterGroupIndex > 0 ? (
                      <button
                        type="button"
                        className="ghost-button full-width-button"
                        onClick={() => setBatterGroupIndex((index) => Math.max(0, index - 1))}
                      >
                        이전 구성
                      </button>
                    ) : null}
                    {batterGroupIndex < batterGroups.length - 1 ? (
                      <button
                        type="button"
                        className="secondary-button full-width-button"
                        onClick={() =>
                          setBatterGroupIndex((index) => Math.min(batterGroups.length - 1, index + 1))
                        }
                      >
                        다음 구성
                      </button>
                    ) : null}
                  </div>
                </section>
              ) : (
                <section className="record-block">
                  <section className="record-section">
                    <p className="detail-section-label">{pitcherGroup.label}</p>
                    <div className="record-grid">
                      {pitcherGroup.fields.map((field) => (
                        <label key={field.label} className="field">
                          <span>{field.label}</span>
                          {field.type === "select" ? (
                            <select defaultValue={field.value}>
                              <option value="">선택</option>
                              <option value="0">0</option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                            </select>
                          ) : (
                            <input type="text" placeholder="입력" />
                          )}
                        </label>
                      ))}
                    </div>
                  </section>

                  <div className="footer-action-row">
                    {pitcherGroupIndex > 0 ? (
                      <button
                        type="button"
                        className="ghost-button full-width-button"
                        onClick={() => setPitcherGroupIndex((index) => Math.max(0, index - 1))}
                      >
                        이전 구성
                      </button>
                    ) : null}
                    {pitcherGroupIndex < pitcherGroups.length - 1 ? (
                      <button
                        type="button"
                        className="secondary-button full-width-button"
                        onClick={() =>
                          setPitcherGroupIndex((index) => Math.min(pitcherGroups.length - 1, index + 1))
                        }
                      >
                        다음 구성
                      </button>
                    ) : null}
                  </div>
                </section>
              )}

              <div className="footer-action-row">
                <button
                  type="button"
                  className="ghost-button full-width-button"
                  onClick={() => setStep("info")}
                >
                  뒤로
                </button>
                <button type="button" className="primary-button full-width-button">
                  저장
                </button>
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
