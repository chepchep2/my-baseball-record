"use client";

import React from "react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./GameDetailView.module.css";
import { useAuthSession } from "@/features/auth/session/useAuthSession";
import { deleteGame } from "@/features/games/api/games-api";

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

  const fixed = Number(value).toFixed(3);
  return fixed.startsWith("0") ? fixed.slice(1) : fixed;
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

export default function GameDetailView({ game }) {
  const router = useRouter();
  const { apiClient } = useAuthSession();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const countItems = [
    ["타석", game.plateAppearances],
    ["사사구", game.walksAndHitByPitch],
    ["1루타", game.singles],
    ["2루타", game.doubles],
    ["3루타", game.triples],
    ["홈런", game.homeRuns],
  ];

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteGame(apiClient, game.id);
      router.push("/games");
    } catch (error) {
      setDeleteError(error?.message || "삭제에 실패했습니다.");
      setIsDeleting(false);
    }
  }

  return (
    <>
      <section className="panel detail-screen-panel">
        <div className={styles.layout}>
          <header className={styles.headerRow}>
            <h1 className="page-title">경기 기록</h1>
            <Link href={`/games/${game.id}/edit`} className={styles.editLink}>
              수정
            </Link>
          </header>

          <section className={styles.fieldSection} aria-label="날짜와 시간">
            <Link href={`/games/${game.id}/date-time`} className={styles.infoLink} aria-label="날짜와 시간 수정">
              <div className={styles.infoCard}>
                <div className={styles.infoRow}>
                  <span className={styles.fieldLabel}>날짜</span>
                  <strong className={styles.infoValue}>{formatDate(game.playedDate ?? game.playedAt)}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.fieldLabel}>시간</span>
                  <strong className={styles.infoValue}>{formatTime(game.playedHour, game.playedMinute)}</strong>
                </div>
              </div>
            </Link>
          </section>

          <section className={styles.metricGrid} aria-label="자동 계산 기록">
            <p>타율 {formatMetric(game.battingAverage)}</p>
            <p>출루율 {formatMetric(game.onBasePercentage)}</p>
            <p>장타율 {formatMetric(game.sluggingPercentage)}</p>
            <p>OPS {formatMetric(game.ops)}</p>
          </section>

          <section className={styles.recordsGrid} aria-label="경기 기록 값">
            {countItems.map(([label, value]) => (
              <CountCard key={label} label={label} value={value} />
            ))}
          </section>

          <button type="button" className={styles.deleteButton} onClick={() => setShowDeleteModal(true)}>
            삭제
          </button>
        </div>
      </section>

      {showDeleteModal ? (
        <div className={styles.modalOverlay} role="presentation">
          <div
            className={styles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-delete-title"
            aria-describedby="game-delete-description"
          >
            <h2 className={styles.modalTitle} id="game-delete-title">
              이 경기를 삭제할까요?
            </h2>
            <p className={styles.modalText} id="game-delete-description">
              삭제 후에는 복구할 수 없습니다.
            </p>
            {deleteError ? (
              <p className={styles.modalText} role="alert">
                {deleteError}
              </p>
            ) : null}
            <div className={styles.modalActions}>
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
    </>
  );
}
