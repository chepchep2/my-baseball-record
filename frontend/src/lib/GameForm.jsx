"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppPageLayout from "@/components/layout/AppPageLayout";
import {
  batterGroups,
  buildDraftKey,
  buildEmptyGameForm,
  buildFormFromGame,
  DRAFT_USER_ID,
  getInitialFormValues,
  pitcherGroups,
} from "@/lib/game-form-data";
import { clearDraft, readDraft, shouldAutoRestoreDraft, writeDraft } from "@/lib/game-draft";
import { getGameById, getTodayValue, mockGames } from "@/lib/mock-games";

function getFieldValue(record, key) {
  return record[key] ?? "";
}

function getReadonlyGame(mode, gameId) {
  if (mode !== "edit") {
    return null;
  }

  return getGameById(mockGames, gameId);
}

export default function GameForm({ mode = "create", gameId = null }) {
  const todayValue = getTodayValue();
  const draftKey = useMemo(() => buildDraftKey(mode, DRAFT_USER_ID, gameId), [gameId, mode]);
  const readonlyGame = useMemo(() => getReadonlyGame(mode, gameId), [gameId, mode]);
  const [form, setForm] = useState(() => getInitialFormValues(mode, gameId));
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const nextDraft = readDraft(draftKey);
    if (!nextDraft) {
      setReady(true);
      return;
    }

    if (shouldAutoRestoreDraft(draftKey)) {
      setForm(nextDraft);
      setReady(true);
      return;
    }

    setShowRecoveryModal(true);
    setReady(true);
  }, [draftKey]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    writeDraft(draftKey, form);
  }, [draftKey, form, ready]);

  const handleRestore = () => {
    const nextDraft = readDraft(draftKey);
    if (nextDraft) {
      setForm(nextDraft);
    }
    setShowRecoveryModal(false);
  };

  const handleDiscard = () => {
    clearDraft(draftKey);
    setForm(mode === "edit" && readonlyGame ? buildFormFromGame(readonlyGame) : buildEmptyGameForm());
    setShowRecoveryModal(false);
  };

  const updateTopField = (key, value) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "gameDate" && value) {
        next.seasonYear = value.slice(0, 4);
      }
      return next;
    });
  };

  const updateRecordField = (recordKey, fieldKey, value) => {
    setForm((current) => ({
      ...current,
      [recordKey]: {
        ...current[recordKey],
        [fieldKey]: value,
      },
    }));
  };

  const isEditMode = mode === "edit";
  const currentBatterGroup = batterGroups[form.batterGroupIndex];
  const currentPitcherGroup = pitcherGroups[form.pitcherGroupIndex];

  const handleSave = () => {
    clearDraft(draftKey);
    const targetGameId = gameId || "103";
    window.location.href = `/games/${targetGameId}`;
  };

  if (!ready) {
    return null;
  }

  return (
    <AppPageLayout showTabs={!isEditMode}>
        <section className="panel form-panel">
          <div className="page-title-block form-title-block">
            <p className="eyebrow">My Baseball Record</p>
            <h1 className="page-title">{isEditMode ? "경기 수정" : "경기 생성 및 기록 입력"}</h1>
          </div>

          {form.step === "info" ? (
            <>
              <div className="form-grid">
                <label className="field">
                  <span>날짜</span>
                  <input
                    type="date"
                    value={form.gameDate}
                    max={todayValue}
                    readOnly={isEditMode}
                    onChange={(event) => updateTopField("gameDate", event.target.value > todayValue ? todayValue : event.target.value)}
                  />
                </label>

                <label className="field">
                  <span>경기 유형</span>
                  <select
                    value={form.gameType}
                    disabled={isEditMode}
                    onChange={(event) => updateTopField("gameType", event.target.value)}
                  >
                    <option value="LEAGUE">리그 경기</option>
                    <option value="NON_OFFICIAL">비공식 경기</option>
                  </select>
                </label>
              </div>

              <button
                type="button"
                className="inline-link left-align"
                onClick={() => updateTopField("showOptionalInfo", !form.showOptionalInfo)}
              >
                {form.showOptionalInfo ? "선택 정보 닫기" : "선택 정보 더 입력하기"}
              </button>

              {form.showOptionalInfo ? (
                <div className="form-grid advanced-grid">
                  <label className="field">
                    <span>시즌</span>
                    <input type="text" value={form.seasonYear} readOnly />
                  </label>
                  <label className="field">
                    <span>소속 팀</span>
                    <input
                      type="text"
                      placeholder="선택 입력"
                      value={form.teamName}
                      onChange={(event) => updateTopField("teamName", event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>상대 팀</span>
                    <input
                      type="text"
                      placeholder="선택 입력"
                      value={form.opponentName}
                      onChange={(event) => updateTopField("opponentName", event.target.value)}
                    />
                  </label>
                  <label className="field full-width">
                    <span>메모</span>
                    <textarea
                      rows="3"
                      placeholder="선택 입력"
                      value={form.memo}
                      onChange={(event) => updateTopField("memo", event.target.value)}
                    />
                  </label>
                </div>
              ) : null}

              <div className="draft-notice">작성 중인 내용이 임시 저장되었습니다.</div>

              <div className="footer-action-row">
                <Link className="ghost-button as-link full-width-button" href={isEditMode ? `/games/${gameId}` : "/home"}>
                  취소
                </Link>
                <button
                  type="button"
                  className="primary-button full-width-button"
                  onClick={() => updateTopField("step", "record")}
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
                  className={form.recordTab === "batter" ? "tab-button active" : "tab-button"}
                  onClick={() => updateTopField("recordTab", "batter")}
                >
                  타자 기록
                </button>
                <button
                  type="button"
                  className={form.recordTab === "pitcher" ? "tab-button active" : "tab-button"}
                  onClick={() => updateTopField("recordTab", "pitcher")}
                >
                  투수 기록
                </button>
              </div>

              {form.recordTab === "batter" ? (
                <section className="record-block">
                  <section className="record-section">
                    <p className="detail-section-label">{currentBatterGroup.label}</p>
                    <div className="record-grid">
                      {currentBatterGroup.fields.map(([fieldKey, label]) => (
                        <label key={fieldKey} className="field">
                          <span>{label}</span>
                          <input
                            type="number"
                            min="0"
                            value={getFieldValue(form.batter, fieldKey)}
                            placeholder="입력"
                            onChange={(event) => updateRecordField("batter", fieldKey, event.target.value)}
                          />
                        </label>
                      ))}
                    </div>
                  </section>

                  <div className="footer-action-row">
                    {form.batterGroupIndex > 0 ? (
                      <button
                        type="button"
                        className="ghost-button full-width-button"
                        onClick={() => updateTopField("batterGroupIndex", form.batterGroupIndex - 1)}
                      >
                        이전 구성
                      </button>
                    ) : null}
                    {form.batterGroupIndex < batterGroups.length - 1 ? (
                      <button
                        type="button"
                        className="secondary-button full-width-button"
                        onClick={() => updateTopField("batterGroupIndex", form.batterGroupIndex + 1)}
                      >
                        다음 구성
                      </button>
                    ) : null}
                  </div>
                </section>
              ) : (
                <section className="record-block">
                  <section className="record-section">
                    <p className="detail-section-label">{currentPitcherGroup.label}</p>
                    <div className="record-grid">
                      {currentPitcherGroup.fields.map(([fieldKey, label, fieldType]) => (
                        <label key={fieldKey} className="field">
                          <span>{label}</span>
                          {fieldType === "select" ? (
                            <select
                              value={getFieldValue(form.pitcher, fieldKey)}
                              onChange={(event) => updateRecordField("pitcher", fieldKey, event.target.value)}
                            >
                              <option value="">선택</option>
                              <option value="0">0</option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                            </select>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              value={getFieldValue(form.pitcher, fieldKey)}
                              placeholder="입력"
                              onChange={(event) => updateRecordField("pitcher", fieldKey, event.target.value)}
                            />
                          )}
                        </label>
                      ))}
                    </div>
                  </section>

                  <div className="footer-action-row">
                    {form.pitcherGroupIndex > 0 ? (
                      <button
                        type="button"
                        className="ghost-button full-width-button"
                        onClick={() => updateTopField("pitcherGroupIndex", form.pitcherGroupIndex - 1)}
                      >
                        이전 구성
                      </button>
                    ) : null}
                    {form.pitcherGroupIndex < pitcherGroups.length - 1 ? (
                      <button
                        type="button"
                        className="secondary-button full-width-button"
                        onClick={() => updateTopField("pitcherGroupIndex", form.pitcherGroupIndex + 1)}
                      >
                        다음 구성
                      </button>
                    ) : null}
                  </div>
                </section>
              )}

              <div className="draft-notice">작성 중인 내용이 임시 저장되었습니다.</div>

              <div className="footer-action-row">
                <button
                  type="button"
                  className="ghost-button full-width-button"
                  onClick={() => updateTopField("step", "info")}
                >
                  뒤로
                </button>
                <button type="button" className="primary-button full-width-button" onClick={handleSave}>
                  저장
                </button>
              </div>
            </>
          )}
        </section>
      {showRecoveryModal ? (
        <div className="confirmation-overlay" role="presentation">
          <div className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="recovery-title">
            <h2 id="recovery-title" className="confirmation-title">
              이전에 작성 중이던 경기 기록이 있습니다.
            </h2>
            <p className="confirmation-copy">이어쓰겠습니까?</p>
            <div className="footer-action-row">
              <button type="button" className="ghost-button full-width-button" onClick={handleDiscard}>
                아니오
              </button>
              <button type="button" className="primary-button full-width-button" onClick={handleRestore}>
                예
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppPageLayout>
  );
}
