"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/prototypes/GameMatchmakingPrototype.module.css";
import PrototypeEntryStepDateTime from "@/components/prototypes/PrototypeEntryStepDateTime";
import { ApiError } from "@/features/auth/api/auth-api";
import { useAuthSession } from "@/features/auth/session/useAuthSession";
import { buildEntryDraft } from "@/features/entry/model/entry-form";
import {
  createMatch,
  getMatchCandidates,
  getMatchStadiumSuggestions,
} from "@/features/matches/api/matches-api";

const REGION_TREE = {
  부산시: ["강서구", "사상구"],
  김해시: ["김해시"],
  창원시: ["진해구", "마산회원구"],
};

function FlowHeader({ title }) {
  return <h1 className="entry-step-title">{title}</h1>;
}

function formatCandidateDate(playedDate) {
  if (!playedDate) {
    return "";
  }

  const [year, month, day] = playedDate.split("-");
  if (!year || !month || !day) {
    return playedDate;
  }

  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

function normalizeStadiumName(value) {
  return value.toLowerCase().replace(/\s+/g, "");
}

export default function MatchCreateFlowClient() {
  const router = useRouter();
  const { apiClient } = useAuthSession();
  const initialDraft = useMemo(() => buildEntryDraft(new Date()), []);
  const [draft, setDraft] = useState(initialDraft);
  const [region, setRegion] = useState({ city: "부산시", district: "강서구" });
  const [step, setStep] = useState("search");
  const [candidates, setCandidates] = useState([]);
  const [expandedScope, setExpandedScope] = useState(false);
  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const [stadiumSuggestions, setStadiumSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [customStadiumName, setCustomStadiumName] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const draftDate = typeof draft.date === "string" ? draft.date : "";
  const candidateRegionLabel = `${region.city} ${region.district}`;
  const visibleCandidates = showAllCandidates ? candidates : candidates.slice(0, 4);
  const hiddenCandidateCount = Math.max(0, candidates.length - visibleCandidates.length);
  const normalizedCustomName = normalizeStadiumName(customStadiumName.trim());
  const similarSuggestion = stadiumSuggestions.find(
    (item) => normalizeStadiumName(item.stadiumName) === normalizedCustomName,
  );
  const duplicateCandidate = candidates.find(
    (item) => normalizeStadiumName(item.stadiumName) === normalizedCustomName,
  );

  function updateField(key, value) {
    setErrorMessage(null);
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateRegion(key, value) {
    setErrorMessage(null);
    if (key === "city") {
      setRegion({
        city: value,
        district: REGION_TREE[value][0],
      });
      return;
    }

    setRegion((current) => ({
      ...current,
      district: value,
    }));
  }

  async function loadCandidates(nextExpandedScope = false) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getMatchCandidates(apiClient, {
        playedDate: draftDate,
        playedHour: draft.hour,
        playedMinute: draft.minute,
        cityName: region.city,
        districtName: region.district,
        expandScope: nextExpandedScope,
      });
      setCandidates(response.items ?? []);
      setExpandedScope(Boolean(response.expandedScope));
      setShowAllCandidates(false);
      setStep("candidates");
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "경기 후보를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadStadiumSuggestions() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getMatchStadiumSuggestions(apiClient, {
        cityName: region.city,
        districtName: region.district,
      });
      setStadiumSuggestions(response.items ?? []);
      setSelectedSuggestion(null);
      setCustomStadiumName("");
      setStep("create");
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "구장 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleToggleCandidates() {
    if (candidates.length > 4) {
      setShowAllCandidates((current) => !current);
      return;
    }

    loadCandidates(!expandedScope);
  }

  async function handleCreateMatch() {
    const stadiumName = selectedSuggestion?.stadiumName ?? customStadiumName.trim();
    if (!stadiumName) {
      setErrorMessage("구장명을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await createMatch(apiClient, {
        playedDate: draftDate,
        playedHour: Number(draft.hour),
        playedMinute: Number(draft.minute),
        cityName: region.city,
        districtName: region.district,
        stadiumId: selectedSuggestion?.stadiumId ?? null,
        stadiumName,
      });
      router.push(`/matches/${response.gameId}`);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "경기를 생성하지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  const districtOptions = REGION_TREE[region.city] ?? [];

  return (
    <div className="entry-flow-shell">
      {step === "search" ? (
        <PrototypeEntryStepDateTime
          draft={draft}
          onChangeDate={(date) => updateField("date", date)}
          onChangeTime={updateField}
          onNext={() => loadCandidates(false)}
          title="경기 생성"
        >
          <div className={styles.regionGrid}>
            <label className="entry-select-field">
              <span className={styles.fieldLabel}>시/도</span>
              <select value={region.city} onChange={(event) => updateRegion("city", event.target.value)}>
                {Object.keys(REGION_TREE).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label className="entry-select-field">
              <span className={styles.fieldLabel}>구/군</span>
              <select value={region.district} onChange={(event) => updateRegion("district", event.target.value)}>
                {districtOptions.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </PrototypeEntryStepDateTime>
      ) : (
        <div className={styles.flowPanel}>
          {step === "candidates" ? (
            <>
              <FlowHeader title="같은 시간대 경기" />
              <div className={styles.candidateStage}>
                <section className={`${styles.section} ${styles.candidateSection}`}>
                  <div
                    className={
                      candidates.length > 0
                        ? `${styles.candidateListBox} ${styles.candidateList}`
                        : `${styles.candidateListBox} ${styles.candidateList} ${styles.emptyCandidateList}`
                    }
                  >
                    {candidates.length > 0 ? (
                      <>
                        {visibleCandidates.map((game) => (
                          <button
                            key={game.gameId}
                            type="button"
                            className={styles.candidateCardButton}
                            onClick={() => router.push(`/matches/${game.gameId}`)}
                          >
                            <div className={styles.candidateMeta}>
                              <span>{formatCandidateDate(game.playedDate)}</span>
                              <span>{`${String(game.playedHour).padStart(2, "0")}:${String(game.playedMinute).padStart(2, "0")}`}</span>
                            </div>
                            <p className={styles.candidateName}>{game.stadiumName}</p>
                            <div className={styles.candidateMeta}>
                              <span>{`${game.cityName} ${game.districtName}`}</span>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <article className={styles.emptyStateCard}>
                        <p className={styles.emptyStateTitle}>같은 시간대에 등록된 경기가 없습니다.</p>
                        <p className={styles.emptyStateCopy}>더 보기로 범위를 넓히거나 새 경기를 만들 수 있습니다.</p>
                      </article>
                    )}
                  </div>
                </section>
                {hiddenCandidateCount > 0 && !showAllCandidates ? (
                  <p className={styles.hiddenCandidatesNotice}>{hiddenCandidateCount}개의 경기가 더 있습니다.</p>
                ) : null}
                <div className={styles.candidateActions}>
                  <button
                    type="button"
                    className={styles.compactAction}
                    onClick={handleToggleCandidates}
                    disabled={isLoading}
                  >
                    {showAllCandidates || expandedScope ? "기본 보기" : "더 보기"}
                  </button>
                  <button
                    type="button"
                    className={styles.compactPrimaryAction}
                    onClick={loadStadiumSuggestions}
                    disabled={isLoading}
                  >
                    새 경기
                  </button>
                </div>
              </div>
            </>
          ) : null}

          {step === "create" ? (
            <>
              <FlowHeader title="새 경기 만들기" />
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{candidateRegionLabel} 추천 구장</h2>
                {stadiumSuggestions.length > 0 ? (
                  <div className={styles.pillRow}>
                    {stadiumSuggestions.map((stadium) => (
                      <button
                        key={stadium.stadiumId}
                        type="button"
                        className={styles.suggestionPill}
                        onClick={() => {
                          setSelectedSuggestion(stadium);
                          setCustomStadiumName(stadium.stadiumName);
                          setErrorMessage(null);
                        }}
                      >
                        {stadium.stadiumName}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className={styles.helper}>아직 등록된 구장이 없습니다.</p>
                )}
              </section>

              <section className={styles.section}>
                <article className={styles.inputCard}>
                  <label className={styles.inputLabel} htmlFor="custom-stadium">
                    직접 구장명 입력
                  </label>
                  <input
                    id="custom-stadium"
                    className={styles.textInput}
                    value={customStadiumName}
                    onChange={(event) => {
                      setCustomStadiumName(event.target.value);
                      setSelectedSuggestion(null);
                      setErrorMessage(null);
                    }}
                    placeholder="예: 드림볼 메인"
                  />
                </article>
              </section>

              {similarSuggestion && !selectedSuggestion ? (
                <article className={styles.hintCard}>
                  <p className={styles.hintTitle}>비슷한 구장이 있습니다</p>
                  <div className={styles.candidateActions}>
                    <button
                      type="button"
                      className={styles.ghostAction}
                      onClick={() => {
                        setSelectedSuggestion(similarSuggestion);
                        setCustomStadiumName(similarSuggestion.stadiumName);
                      }}
                    >
                      기존 구장 선택
                    </button>
                    <button type="button" className={styles.primaryAction} onClick={handleCreateMatch}>
                      새 구장 추가
                    </button>
                  </div>
                </article>
              ) : null}

              {duplicateCandidate && !selectedSuggestion ? (
                <article className={styles.hintCard}>
                  <p className={styles.hintTitle}>같은 시간대와 구장명으로 등록된 경기가 있습니다</p>
                  <div className={styles.duplicateCandidateCard}>
                    <div className={styles.candidateMeta}>
                      <span>{formatCandidateDate(duplicateCandidate.playedDate)}</span>
                      <span>{`${String(duplicateCandidate.playedHour).padStart(2, "0")}:${String(duplicateCandidate.playedMinute).padStart(2, "0")}`}</span>
                    </div>
                    <p className={styles.candidateName}>{duplicateCandidate.stadiumName}</p>
                    <div className={styles.candidateMeta}>
                      <span>{`${duplicateCandidate.cityName} ${duplicateCandidate.districtName}`}</span>
                    </div>
                  </div>
                  <div className={styles.candidateActions}>
                    <button
                      type="button"
                      className={styles.ghostAction}
                      onClick={() => router.push(`/matches/${duplicateCandidate.gameId}`)}
                    >
                      기존 경기 보기
                    </button>
                    <button type="button" className={styles.primaryAction} onClick={handleCreateMatch}>
                      그래도 새 경기
                    </button>
                  </div>
                </article>
              ) : null}

              <button type="button" className={styles.primaryAction} onClick={handleCreateMatch} disabled={isLoading}>
                이 이름으로 경기 만들기
              </button>
            </>
          ) : null}

          {errorMessage ? <p className="entry-error-message">{errorMessage}</p> : null}
          {isLoading ? <p className={styles.helper}>불러오는 중입니다.</p> : null}
        </div>
      )}
    </div>
  );
}
