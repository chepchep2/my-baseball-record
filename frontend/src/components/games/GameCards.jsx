"use client";

import Link from "next/link";
import styles from "./GameCards.module.css";
import {
  formatCardDate,
  formatGameTypeLabel,
  formatCalendarDate,
  formatParticipationLabel,
} from "@/lib/mock-games";

export default function GameCards({ selectedDate, games }) {
  if (games.length === 0) {
    return (
      <section className={`panel ${styles.empty}`}>
        <p className={styles.emptyText}>이 날짜에 기록된 경기가 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="panel detail-screen-panel" aria-label={`${formatCalendarDate(selectedDate)} 경기 목록`}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>{formatCalendarDate(selectedDate)}</h2>
        <span className={styles.count}>총 {games.length}경기</span>
      </div>

      <div className={styles.list}>
        {games.map((game) => (
          <Link key={game.id} className={styles.card} href={`/games/${game.id}`}>
            <strong className={styles.cardDate}>{formatCardDate(game.playedAt)}</strong>
            <span className={styles.cardMeta}>
              {formatGameTypeLabel(game.gameType)} · {formatParticipationLabel(game.participationType)} ·{" "}
              {game.opponentName}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
