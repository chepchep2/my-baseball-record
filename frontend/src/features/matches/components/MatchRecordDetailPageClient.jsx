"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AppPageLayout from "@/components/layout/AppPageLayout";
import detailStyles from "@/components/games/GameDetailView.module.css";
import styles from "@/components/prototypes/GameMatchmakingPrototype.module.css";
import { ApiError } from "@/features/auth/api/auth-api";
import { useAuthSession } from "@/features/auth/session/useAuthSession";
import {
  deleteMatchRecord,
  getMatchRecordDetail,
} from "@/features/matches/api/matches-api";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const [year, month, day] = value.split("-");
  return `${Number(year)}년 ${Number(month)}월 ${Number(day)}일`;
}

function formatTime(hour, minute) {
  const safeHour = String(hour ?? 0).padStart(2, "0");
  const safeMinute = String(minute ?? 0).padStart(2, "0");
  return `${safeHour}:${safeMinute}`;
}

function formatMetric(value) {
  if (value === null || value === undefined) {
    return ".000";
  }

  const text = String(value);
  return text.startsWith("0") ? text.slice(1) : text;
}

function formatCount(value) {
  return value ?? 0;
}

function CountCard({ label, value }) {
  return (
    <article className="detail-pair">
      <span>{label}</span>
      <strong>{formatCount(value)}</strong>
    </article>
  );
}

export default function MatchRecordDetailPageClient({ gameId, batterRecordId }) {
  const { apiClient, user } = useAuthSession();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadRecord() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getMatchRecordDetail(apiClient, gameId, batterRecordId);
        if (active) {
          setRecord(response);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error instanceof ApiError ? error.message : "기록 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadRecord();
    return () => {
      active = false;
    };
  }, [apiClient, batterRecordId, gameId]);

  if (isLoading) {
    return (
      <AppPageLayout showTabs={false} frameClassName="milestone-entry-frame">
        <div className="entry-flow-shell">
          <section className={`${styles.flowPanel} ${styles.detailFlowPanel}`}>
            <div className={detailStyles.layout}>
              <header className={detailStyles.headerRow}>
                <h1 className="page-title">경기 기록</h1>
              </header>
              <p>기록 정보를 불러오는 중입니다.</p>
            </div>
          </section>
        </div>
      </AppPageLayout>
    );
  }

  if (!record) {
    return (
      <AppPageLayout showTabs={false} frameClassName="milestone-entry-frame">
        <div className="entry-flow-shell">
          <section className={`${styles.flowPanel} ${styles.detailFlowPanel}`}>
            <div className={detailStyles.layout}>
              <header className={detailStyles.headerRow}>
                <h1 className="page-title">경기 기록</h1>
              </header>
              <p>{errorMessage ?? "기록 정보를 찾을 수 없습니다."}</p>
            </div>
          </section>
        </div>
      </AppPageLayout>
    );
  }

  const countItems = [
    ["타석", record.plateAppearances],
    ["사사구", record.walksAndHitByPitch],
    ["희생번트", record.sacrificeBunts],
    ["희생플라이", record.sacrificeFlies],
    ["1루타", record.singles],
    ["2루타", record.doubles],
    ["3루타", record.triples],
    ["홈런", record.homeRuns],
  ];

  async function handleDelete() {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteMatchRecord(apiClient, gameId, batterRecordId);
      window.location.href = `/matches/${gameId}`;
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "기록을 삭제하지 못했습니다.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }

  return (
    <AppPageLayout showTabs={false} frameClassName="milestone-entry-frame">
      <div className="entry-flow-shell">
        <section className={`${styles.flowPanel} ${styles.detailFlowPanel}`}>
          <div className={detailStyles.layout}>
            <header className={detailStyles.headerRow}>
              <h1 className="page-title">경기 기록</h1>
              {user?.id === record.userId ? (
                <Link
                  href={`/matches/${gameId}/records/${batterRecordId}/edit`}
                  className={detailStyles.editLink}
                >
                  수정
                </Link>
              ) : null}
            </header>

            <section className={detailStyles.fieldSection} aria-label="날짜와 시간">
              <div className={detailStyles.infoCard}>
                <div className={detailStyles.infoRow}>
                  <span className={detailStyles.fieldLabel}>날짜</span>
                  <strong className={detailStyles.infoValue}>{formatDate(record.playedDate)}</strong>
                </div>
                <div className={detailStyles.infoRow}>
                  <span className={detailStyles.fieldLabel}>시간</span>
                  <strong className={detailStyles.infoValue}>
                    {formatTime(record.playedHour, record.playedMinute)}
                  </strong>
                </div>
              </div>
            </section>

            <section className={detailStyles.metricGrid} aria-label="자동 계산 기록">
              <p>타율 {formatMetric(record.battingAverage)}</p>
              <p>출루율 {formatMetric(record.onBasePercentage)}</p>
              <p>장타율 {formatMetric(record.sluggingPercentage)}</p>
              <p>OPS {formatMetric(record.ops)}</p>
            </section>

            <section className={detailStyles.recordsGrid} aria-label="경기 기록 값">
              {countItems.map(([label, value]) => (
                <CountCard key={label} label={label} value={value} />
              ))}
            </section>

            <div className={styles.detailActions}>
              <Link href={`/matches/${gameId}`} className={`${styles.ghostAction} ${styles.actionLink}`}>
                경기 정보로
              </Link>
              {user?.id === record.userId ? (
                <button
                  type="button"
                  className={detailStyles.deleteButton}
                  onClick={() => setShowDeleteModal(true)}
                >
                  삭제
                </button>
              ) : null}
            </div>

            {errorMessage ? <p className="entry-error-message">{errorMessage}</p> : null}
          </div>
        </section>
      </div>

      {showDeleteModal ? (
        <div className={detailStyles.modalOverlay} role="presentation">
          <div
            className={detailStyles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="match-record-delete-title"
            aria-describedby="match-record-delete-description"
          >
            <h2 className={detailStyles.modalTitle} id="match-record-delete-title">
              이 기록을 삭제할까요?
            </h2>
            <p className={detailStyles.modalText} id="match-record-delete-description">
              삭제 후에는 복구할 수 없습니다.
            </p>
            {errorMessage ? (
              <p className={detailStyles.modalText} role="alert">
                {errorMessage}
              </p>
            ) : null}
            <div className={detailStyles.modalActions}>
              <button
                type="button"
                className="ghost-button full-width-button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="primary-button full-width-button"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? "삭제 중..." : "삭제하기"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppPageLayout>
  );
}
