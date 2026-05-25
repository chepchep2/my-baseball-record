"use client";

import React, { useMemo, useState } from "react";
import AppPageLayout from "@/components/layout/AppPageLayout";
import PrototypeEntryStepCounts from "@/components/prototypes/PrototypeEntryStepCounts";
import PrototypeEntryStepDateTime from "@/components/prototypes/PrototypeEntryStepDateTime";
import { buildEntryDraft } from "@/features/entry/model/entry-form";
import styles from "./GameMatchmakingPrototype.module.css";

const candidateGames = [
  {
    id: 1,
    date: "2026년 5월 20일",
    time: "10:30",
    region: "부산시 강서구",
    stadium: "드림볼 메인",
    creator: "조상우",
  },
  {
    id: 2,
    date: "2026년 5월 20일",
    time: "10:50",
    region: "부산시 강서구",
    stadium: "드림볼 보조1",
    creator: "김영훈",
  },
];

const stadiumSuggestions = ["드림볼 메인", "드림볼 보조1", "드림볼 보조2"];

const initialRecords = [
  {
    user: "조상우",
    summary: "타석 4 · 안타 2 · OPS 1.250",
    verified: true,
  },
  {
    user: "김영훈",
    summary: "타석 4 · 안타 1 · OPS .833",
    verified: false,
  },
  {
    user: "서세홍",
    summary: "타석 3 · 안타 2 · OPS 1.167",
    verified: false,
  },
];

const ENTRY_FIELDS = [
  { key: "plateAppearances", label: "타석" },
  { key: "walksAndHitByPitch", label: "사사구" },
  { key: "singles", label: "1루타" },
  { key: "doubles", label: "2루타" },
  { key: "triples", label: "3루타" },
  { key: "homeRuns", label: "홈런" },
];

const REGION_TREE = {
  부산시: {
    districts: ["강서구", "사상구"],
  },
  김해시: {
    districts: ["김해시"],
  },
  창원시: {
    districts: ["진해구", "마산회원구"],
  },
};

function FlowHeader({ step, title, copy, onBack, showBack = true }) {
  return (
    <header className={styles.hero}>
      <div className={styles.topRow}>
        {showBack ? (
          <button type="button" className={styles.backButton} onClick={onBack}>
            이전
          </button>
        ) : (
          <span className={styles.stepPill}>Step {step}</span>
        )}
        {showBack ? <span className={styles.stepPill}>Step {step}</span> : null}
      </div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.copy}>{copy}</p>
    </header>
  );
}

function SearchStep({
  draft,
  region,
  onChangeDate,
  onChangeTime,
  onChangeRegion,
  onNext,
}) {
  const cities = Object.keys(REGION_TREE);
  const districtOptions = REGION_TREE[region.city].districts;

  return (
    <>
      <FlowHeader
        step="1"
        title="경기 생성"
        copy=""
        showBack={false}
      />

      <PrototypeEntryStepDateTime
        draft={draft}
        onChangeDate={onChangeDate}
        onChangeTime={onChangeTime}
        onNext={onNext}
      >
        <div className={styles.regionGrid}>
          <label className="entry-select-field">
            <span className={styles.regionLabel}>시/도</span>
            <select
              value={region.city}
              onChange={(event) => onChangeRegion("city", event.target.value)}
            >
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </label>
          <label className="entry-select-field">
            <span className={styles.regionLabel}>구/군</span>
            <select
              value={region.district}
              onChange={(event) => onChangeRegion("district", event.target.value)}
            >
              {districtOptions.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </label>
        </div>
      </PrototypeEntryStepDateTime>
    </>
  );
}

function CandidateStep({ onBack, onSelectGame, onCreateNew, widened, onToggleWiden }) {
  return (
    <>
      <FlowHeader
        step="2"
        title="기존 경기 후보"
        copy=""
        onBack={onBack}
      />

      <section className={styles.section}>
        <div className={styles.candidateList}>
          {candidateGames.map((game) => (
            <article key={game.id} className={styles.candidateCard}>
              <div className={styles.candidateMeta}>
                <span>{game.date}</span>
                <span>{game.time}</span>
              </div>
              <p className={styles.candidateName}>{game.stadium}</p>
              <div className={styles.candidateMeta}>
                <span>{game.region}</span>
                <span>생성자 {game.creator}</span>
              </div>
              <button type="button" className={styles.primaryAction} onClick={() => onSelectGame(game)}>
                이 경기 보기
              </button>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.candidateActions}>
        <button type="button" className={styles.ghostAction} onClick={onToggleWiden}>
          {widened ? "기본 보기" : "더 보기"}
        </button>
        <button type="button" className={styles.primaryAction} onClick={onCreateNew}>
          새 경기
        </button>
      </div>
    </>
  );
}

function CreateStep({
  onBack,
  customName,
  onChangeCustomName,
  onUseExistingSuggestion,
  onConfirmNewGame,
  needsDisambiguation,
}) {
  return (
    <>
      <FlowHeader
        step="3"
        title="새 경기 만들기"
        copy=""
        onBack={onBack}
      />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>부산시 강서구 추천 구장</h2>
        <div className={styles.pillRow}>
          {stadiumSuggestions.map((stadium) => (
            <button
              key={stadium}
              type="button"
              className={styles.suggestionPill}
              onClick={() => onUseExistingSuggestion(stadium)}
            >
              {stadium}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <article className={styles.inputCard}>
          <label className={styles.inputLabel} htmlFor="custom-stadium">
            직접 구장명 입력
          </label>
          <input
            id="custom-stadium"
            className={styles.textInput}
            value={customName}
            onChange={(event) => onChangeCustomName(event.target.value)}
            placeholder="예: 드림볼 메인"
          />
        </article>
      </section>

      {needsDisambiguation ? (
        <article className={styles.hintCard}>
          <p className={styles.hintTitle}>비슷한 구장이 있습니다</p>
          <div className={styles.candidateActions}>
            <button type="button" className={styles.ghostAction} onClick={() => onUseExistingSuggestion("드림볼 메인")}>
              기존 구장 선택
            </button>
            <button type="button" className={styles.primaryAction} onClick={onConfirmNewGame}>
              새 구장 추가
            </button>
          </div>
        </article>
      ) : null}

      <button
        type="button"
        className={styles.primaryAction}
        onClick={onConfirmNewGame}
        disabled={!customName.trim()}
      >
        이 이름으로 경기 만들기
      </button>
    </>
  );
}

function DetailStep({ game, onBack, onGoToEntry }) {
  return (
    <>
      <FlowHeader
        step="4"
        title="경기 화면"
        copy=""
        onBack={onBack}
      />

      <section className={styles.section}>
        <div className={styles.fieldGrid}>
          <article className={styles.fieldCard}>
            <span className={styles.fieldLabel}>날짜</span>
            <strong className={styles.fieldValue}>{game.date}</strong>
          </article>
          <article className={styles.fieldCard}>
            <span className={styles.fieldLabel}>시간</span>
            <strong className={styles.fieldValue}>{game.time}</strong>
          </article>
          <article className={styles.fieldCard}>
            <span className={styles.fieldLabel}>지역</span>
            <strong className={styles.fieldValue}>{game.region}</strong>
          </article>
          <article className={styles.fieldCard}>
            <span className={styles.fieldLabel}>구장명</span>
            <strong className={styles.fieldValue}>{game.stadium}</strong>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>기록을 남긴 사람</h2>
        <div className={styles.recordList}>
          {initialRecords.map((record) => (
            <article key={record.user} className={styles.recordCard}>
              <div className={styles.recordRow}>
                <p className={styles.recordName}>{record.user}</p>
                <span className={record.verified ? styles.verifiedBadge : styles.pendingBadge}>
                  {record.verified ? "인증 기록" : "인증 전"}
                </span>
              </div>
              <div className={styles.recordStats}>{record.summary}</div>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.detailActions}>
        <button type="button" className={styles.ghostAction}>
          더 보기
        </button>
        <button type="button" className={styles.primaryAction} onClick={onGoToEntry}>
          내 기록 입력하기
        </button>
      </div>
    </>
  );
}

function EntryLandingStep({ onBack }) {
  const [values, setValues] = useState(() => buildEntryDraft(new Date("2026-05-20T10:40:00")));

  return (
    <>
      <FlowHeader
        step="5"
        title="내 기록 입력"
        copy=""
        onBack={onBack}
      />

      <PrototypeEntryStepCounts
        fields={ENTRY_FIELDS}
        values={values}
        error={null}
        canProceed
        onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
        onSubmit={() => {}}
        title="경기 기록 입력"
      />
    </>
  );
}

export default function GameMatchmakingPrototype() {
  const [step, setStep] = useState("search");
  const [widened, setWidened] = useState(false);
  const [customName, setCustomName] = useState("드림볼 보조3");
  const [selectedGame, setSelectedGame] = useState(candidateGames[0]);
  const [region, setRegion] = useState({
    city: "부산시",
    district: "강서구",
  });
  const [entryDraft, setEntryDraft] = useState(() => {
    const draft = buildEntryDraft(new Date("2026-05-20T10:40:00"));
    return {
      ...draft,
      date: "2026-05-20",
      hour: "10",
      minute: "40",
    };
  });

  const needsDisambiguation = useMemo(() => {
    const normalized = customName.toLowerCase().replace(/\s+/g, "");
    return normalized.includes("드림볼") && normalized.length > 0;
  }, [customName]);

  function updateRegion(level, value) {
    if (level === "city") {
      const nextDistrict = REGION_TREE[value].districts[0];
      setRegion({
        city: value,
        district: nextDistrict,
      });
      return;
    }

    if (level === "district") {
      setRegion((current) => ({
        ...current,
        district: value,
      }));
      return;
    }
  }

  function openExistingGame(game) {
    setSelectedGame(game);
    setStep("detail");
  }

  function createNewGame(stadiumName) {
    setSelectedGame({
      id: 999,
      date: "2026년 5월 20일",
      time: "10:40",
      region: "부산시 강서구",
      stadium: stadiumName,
      creator: "현재 사용자",
    });
    setStep("detail");
  }

  return (
    <AppPageLayout showTabs={false} frameClassName={styles.frame}>
      <section className={`panel ${styles.panel}`}>
        {step === "search" ? (
          <SearchStep
            draft={entryDraft}
            region={region}
            onChangeDate={(date) => setEntryDraft((current) => ({ ...current, date }))}
            onChangeTime={(key, value) => setEntryDraft((current) => ({ ...current, [key]: value }))}
            onChangeRegion={updateRegion}
            onNext={() => setStep("candidates")}
          />
        ) : null}

        {step === "candidates" ? (
          <CandidateStep
            onBack={() => setStep("search")}
            onSelectGame={openExistingGame}
            onCreateNew={() => setStep("create")}
            widened={widened}
            onToggleWiden={() => setWidened((current) => !current)}
          />
        ) : null}

        {step === "create" ? (
          <CreateStep
            onBack={() => setStep("candidates")}
            customName={customName}
            onChangeCustomName={setCustomName}
            onUseExistingSuggestion={(stadium) => createNewGame(stadium)}
            onConfirmNewGame={() => createNewGame(customName.trim())}
            needsDisambiguation={needsDisambiguation}
          />
        ) : null}

        {step === "detail" ? (
          <DetailStep
            game={selectedGame}
            onBack={() => setStep("candidates")}
            onGoToEntry={() => setStep("entry")}
          />
        ) : null}

        {step === "entry" ? (
          <EntryLandingStep onBack={() => setStep("detail")} />
        ) : null}
      </section>
    </AppPageLayout>
  );
}
