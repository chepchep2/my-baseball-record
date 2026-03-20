"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./GameDetailView.module.css";
import BottomTabBar from "@/components/navigation/BottomTabBar";
import { useAuthSession } from "@/features/auth/session/useAuthSession";
import { deleteGame } from "@/features/games/api/games-api";
import {
  formatCalendarDate,
  formatGameTypeLabel,
  formatParticipationLabel,
  formatPitchingInnings,
} from "@/lib/mock-games";

function statItemsForBatter(batter) {
  return [
    ["타석", batter.plateAppearances],
    ["타수", batter.atBats],
    ["1루타", batter.singles],
    ["2루타", batter.doubles],
    ["3루타", batter.triples],
    ["홈런", batter.homeRuns],
    ["볼넷", batter.walks],
    ["삼진", batter.strikeOuts],
    ["사구", batter.hitByPitch],
    ["타점", batter.runsBattedIn],
    ["득점", batter.runs],
    ["도루", batter.stolenBases],
    ["도루자", batter.caughtStealing],
    ["희타", batter.sacrificeHits],
  ];
}

function statItemsForPitcher(pitcher) {
  return [
    ["이닝", formatPitchingInnings(pitcher.innings, pitcher.additionalOuts)],
    ["실점", pitcher.runsAllowed],
    ["자책", pitcher.earnedRuns],
    ["피안타", pitcher.hitsAllowed],
    ["볼넷", pitcher.walks],
    ["삼진", pitcher.strikeOuts],
    ["사구", pitcher.hitByPitch],
    ["피홈런", pitcher.homeRunsAllowed],
    ["상대한 타자 수", pitcher.battersFaced],
    ["승", pitcher.wins],
    ["패", pitcher.losses],
    ["세이브", pitcher.saves],
    ["홀드", pitcher.holds],
  ];
}

function DetailPairs({ items }) {
  return (
    <div className="detail-row">
      {items.map(([label, value]) => (
        <div key={label} className="detail-pair">
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function GameDetailView({ game }) {
  const router = useRouter();
  const { apiClient } = useAuthSession();
  const [selectedRecordType, setSelectedRecordType] = useState(
    game.participationType === "PITCHER" ? "pitcher" : "batter",
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const batterItems = game.batter ? statItemsForBatter(game.batter) : [];
  const pitcherItems = game.pitcher ? statItemsForPitcher(game.pitcher) : [];
  const visibleItems = selectedRecordType === "pitcher" ? pitcherItems : batterItems;

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
          <div className={styles.headerRow}>
            <div className="page-title-block">
              <p className="eyebrow">My Baseball Record</p>
              <h1 className="page-title">개별 경기 상세</h1>
            </div>

            <div className={styles.headerActions}>
              <div className={styles.menuWrap}>
                <button
                  type="button"
                  className={styles.menuButton}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label="더보기"
                  onClick={() => setMenuOpen((current) => !current)}
                >
                  ⋯
                </button>

                {menuOpen ? (
                  <div className="profile-menu" role="menu" aria-label="경기 메뉴">
                    <Link
                      className="profile-menu-item"
                      href={`/games/${game.id}/edit`}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      수정
                    </Link>
                    <button
                      type="button"
                      className="profile-menu-item"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        setShowDeleteModal(true);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <section className="inline-summary-grid" aria-label="경기 정보">
            <article className="detail-pair">
              <span>날짜</span>
              <strong>{formatCalendarDate(game.playedAt)}</strong>
            </article>
            <article className="detail-pair">
              <span>경기 유형</span>
              <strong>{formatGameTypeLabel(game.gameType)}</strong>
            </article>
            <article className="detail-pair">
              <span>참여 형태</span>
              <strong>{formatParticipationLabel(game.participationType)}</strong>
            </article>
            <article className="detail-pair">
              <span>시즌</span>
              <strong>{game.seasonYear}</strong>
            </article>
            <article className="detail-pair">
              <span>소속 팀</span>
              <strong>{game.teamName}</strong>
            </article>
            <article className="detail-pair">
              <span>상대 팀</span>
              <strong>{game.opponentName}</strong>
            </article>
            <article className="detail-pair full-width">
              <span>메모</span>
              <strong>{game.memo || "메모 없음"}</strong>
            </article>
          </section>

          <div className="tab-row" role="tablist" aria-label="기록 보기 전환">
            <button
              type="button"
              className={selectedRecordType === "batter" ? "tab-button active" : "tab-button"}
              onClick={() => setSelectedRecordType("batter")}
              aria-pressed={selectedRecordType === "batter"}
            >
              타자
            </button>
            <button
              type="button"
              className={selectedRecordType === "pitcher" ? "tab-button active" : "tab-button"}
              onClick={() => setSelectedRecordType("pitcher")}
              aria-pressed={selectedRecordType === "pitcher"}
            >
              투수
            </button>
          </div>

          <section className={styles.recordSection} aria-label="기록 상세">
            <p className="detail-section-label">
              {selectedRecordType === "pitcher" ? "투수 기록" : "타자 기록"}
            </p>

            {visibleItems.length > 0 ? (
              <DetailPairs items={visibleItems} />
            ) : (
              <div className={styles.emptyState}>이 기록 유형은 현재 경기에서 비어 있습니다.</div>
            )}
          </section>

          <BottomTabBar className="in-panel" />
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
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
