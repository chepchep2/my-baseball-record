"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppPageLayout from "@/components/layout/AppPageLayout";
import BottomTabBar from "@/components/navigation/BottomTabBar";
import PageHeader from "@/components/layout/PageHeader";
import { useAuthSession } from "@/features/auth/session/useAuthSession";
import { createGame, getGameDetail, updateGame } from "@/features/games/api/games-api";
import { toCreateGamePayload, toUpdateGamePayload } from "@/features/games/model/game-form-payload";
import {
  batterGroups,
  buildDraftKey,
  buildEmptyGameForm,
  buildFormFromGame,
  DRAFT_USER_ID,
  pitcherGroups,
} from "@/lib/game-form-data";
import { clearDraft, readDraft, shouldAutoRestoreDraft, writeDraft } from "@/lib/game-draft";
import { getTodayValue } from "@/lib/mock-games";

function getFieldValue(record, key) {
  return record[key] ?? "";
}

function sanitizeNumericInput(value) {
  return value.replace(/[^\d]/g, "");
}

function toCount(value) {
  if (value === "") {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function hasAnyRecordInput(record) {
  return Object.values(record).some((value) => value !== "" && value !== null && value !== undefined);
}

function validateGameForm(form) {
  const errors = [];

  if (!hasAnyRecordInput(form.batter) && !hasAnyRecordInput(form.pitcher)) {
    errors.push("타자 기록 또는 투수 기록 중 하나는 입력해야 합니다.");
  }

  const plateAppearances = toCount(form.batter.plateAppearances);
  const atBats = toCount(form.batter.atBats);
  const singles = toCount(form.batter.singles) ?? 0;
  const doubles = toCount(form.batter.doubles) ?? 0;
  const triples = toCount(form.batter.triples) ?? 0;
  const homeRuns = toCount(form.batter.homeRuns) ?? 0;
  const totalHits = singles + doubles + triples + homeRuns;
  const batterWalks = toCount(form.batter.walks);
  const batterStrikeOuts = toCount(form.batter.strikeOuts);
  const batterHitByPitch = toCount(form.batter.hitByPitch);
  const batterSacrificeHits = toCount(form.batter.sacrificeHits);

  if (plateAppearances !== null && atBats !== null && atBats > plateAppearances) {
    errors.push("타수는 타석보다 클 수 없습니다.");
  }

  if (atBats !== null && totalHits > atBats) {
    errors.push("1루타, 2루타, 3루타, 홈런 합은 타수보다 클 수 없습니다.");
  }

  if (plateAppearances !== null) {
    if (batterWalks !== null && batterWalks > plateAppearances) {
      errors.push("볼넷은 타석보다 클 수 없습니다.");
    }

    if (batterStrikeOuts !== null && batterStrikeOuts > plateAppearances) {
      errors.push("삼진은 타석보다 클 수 없습니다.");
    }

    if (batterHitByPitch !== null && batterHitByPitch > plateAppearances) {
      errors.push("사구는 타석보다 클 수 없습니다.");
    }

    if (batterSacrificeHits !== null && batterSacrificeHits > plateAppearances) {
      errors.push("희타는 타석보다 클 수 없습니다.");
    }
  }

  const runsAllowed = toCount(form.pitcher.runsAllowed);
  const earnedRuns = toCount(form.pitcher.earnedRuns);
  const innings = toCount(form.pitcher.innings) ?? 0;
  const additionalOuts =
    form.pitcher.additionalOuts === "" ? null : Number.parseInt(String(form.pitcher.additionalOuts), 10);
  const pitcherStrikeOuts = toCount(form.pitcher.strikeOuts);
  const maxPitcherStrikeOuts =
    additionalOuts === null || Number.isNaN(additionalOuts) ? null : innings * 3 + additionalOuts;

  if (runsAllowed !== null && earnedRuns !== null && earnedRuns > runsAllowed) {
    errors.push("자책은 실점보다 클 수 없습니다.");
  }

  if (
    form.pitcher.additionalOuts !== "" &&
    !["0", "1", "2"].includes(String(form.pitcher.additionalOuts))
  ) {
    errors.push("추가 아웃 수는 0, 1, 2만 입력할 수 있습니다.");
  }

  if (
    pitcherStrikeOuts !== null &&
    maxPitcherStrikeOuts !== null &&
    pitcherStrikeOuts > maxPitcherStrikeOuts
  ) {
    errors.push("삼진 수는 이닝과 추가 아웃 수로 기록한 아웃 개수보다 클 수 없습니다.");
  }

  return errors;
}

export default function GameForm({ mode = "create", gameId = null }) {
  const router = useRouter();
  const { apiClient } = useAuthSession();
  const isEditMode = mode === "edit";
  const todayValue = getTodayValue();
  const draftKey = useMemo(() => buildDraftKey(mode, DRAFT_USER_ID, gameId), [gameId, mode]);
  const [form, setForm] = useState(() => buildEmptyGameForm());
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [ready, setReady] = useState(mode !== "edit");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadEditGame() {
      if (!isEditMode || !gameId) {
        return;
      }

      try {
        const game = await getGameDetail(apiClient, gameId);
        if (!active) {
          return;
        }

        setForm(buildFormFromGame(game));
      } catch (error) {
        if (!active) {
          return;
        }

        setValidationErrors([error?.message || "경기 정보를 불러오지 못했습니다."]);
      } finally {
        if (active) {
          setReady(true);
        }
      }
    }

    loadEditGame();

    return () => {
      active = false;
    };
  }, [apiClient, gameId, isEditMode]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const nextDraft = readDraft(draftKey);
    if (!nextDraft) {
      return;
    }

    if (shouldAutoRestoreDraft(draftKey)) {
      setForm(nextDraft);
      return;
    }

    setShowRecoveryModal(true);
  }, [draftKey, ready]);

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
    if (isEditMode && gameId) {
      getGameDetail(apiClient, gameId)
        .then((game) => {
          setForm(buildFormFromGame(game));
        })
        .catch(() => {
          setForm(buildEmptyGameForm());
        });
    } else {
      setForm(buildEmptyGameForm());
    }
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
    setValidationErrors([]);
  };

  const updateRecordField = (recordKey, fieldKey, value) => {
    setForm((current) => ({
      ...current,
      [recordKey]: {
        ...current[recordKey],
        [fieldKey]: value,
      },
    }));
    setValidationErrors([]);
  };

  const currentBatterGroup = batterGroups[form.batterGroupIndex];
  const currentPitcherGroup = pitcherGroups[form.pitcherGroupIndex];

  const handleSave = async () => {
    const nextErrors = validateGameForm(form);
    if (nextErrors.length > 0) {
      setValidationErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const savedGame = isEditMode && gameId
        ? await updateGame(apiClient, gameId, toUpdateGamePayload(form))
        : await createGame(apiClient, toCreateGamePayload(form));

      clearDraft(draftKey);
      router.push(`/games/${savedGame.id}`);
    } catch (error) {
      const fieldErrors = error?.fieldErrors?.map((fieldError) => fieldError.message).filter(Boolean) || [];
      setValidationErrors(fieldErrors.length > 0 ? fieldErrors : [error?.message || "저장에 실패했습니다."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ready) {
    return null;
  }

  return (
    <AppPageLayout showTabs={false} frameClassName="form-center-frame">
        <section className="panel form-panel">
          <PageHeader title={isEditMode ? "경기 수정" : "경기 생성 및 기록 입력"} />

          {form.step === "info" ? (
            <>
              <div className="form-grid">
                <label className="field">
                  <span>날짜</span>
                  <input
                    type="date"
                    value={form.gameDate}
                    max={todayValue}
                    disabled={isEditMode}
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

              <div className="footer-action-row form-edit-actions">
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
                            onChange={(event) =>
                              updateRecordField(
                                "batter",
                                fieldKey,
                                sanitizeNumericInput(event.target.value),
                              )
                            }
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
                              onChange={(event) =>
                                updateRecordField(
                                  "pitcher",
                                  fieldKey,
                                  sanitizeNumericInput(event.target.value),
                                )
                              }
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

              {validationErrors.length > 0 ? (
                <div className="form-error-banner" role="alert" aria-live="polite">
                  <strong>입력값을 확인해주세요.</strong>
                  <ul className="form-error-list">
                    {validationErrors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="footer-action-row form-edit-actions">
                <button
                  type="button"
                  className="ghost-button full-width-button"
                  onClick={() => updateTopField("step", "info")}
                >
                  뒤로
                </button>
                <button
                  type="button"
                  className="primary-button full-width-button"
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "저장 중..." : "저장"}
                </button>
              </div>
            </>
          )}

          {!isEditMode ? <BottomTabBar className="in-panel" /> : null}
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
