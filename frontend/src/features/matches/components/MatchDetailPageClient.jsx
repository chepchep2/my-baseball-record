"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppPageLayout from "@/components/layout/AppPageLayout";
import styles from "@/components/prototypes/GameMatchmakingPrototype.module.css";
import { ApiError } from "@/features/auth/api/auth-api";
import { useAuthSession } from "@/features/auth/session/useAuthSession";
import { getMatchDetail, verifyMatchRecord } from "@/features/matches/api/matches-api";

function FlowHeader({ title }) {
  return <h1 className="entry-step-title">{title}</h1>;
}

export default function MatchDetailPageClient({ gameId }) {
  const router = useRouter();
  const { apiClient, user } = useAuthSession();
  const [match, setMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isVerifyingId, setIsVerifyingId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getMatchDetail(apiClient, gameId);
        if (!active) {
          return;
        }
        setMatch(response);
      } catch (error) {
        if (!active) {
          return;
        }
        setErrorMessage(error instanceof ApiError ? error.message : "경기 정보를 불러오지 못했습니다.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadDetail();
    return () => {
      active = false;
    };
  }, [apiClient, gameId]);

  async function handleVerify(batterRecordId) {
    setIsVerifyingId(batterRecordId);
    setErrorMessage(null);

    try {
      await verifyMatchRecord(apiClient, gameId, batterRecordId);
      const refreshed = await getMatchDetail(apiClient, gameId);
      setMatch(refreshed);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "기록을 인증하지 못했습니다.");
    } finally {
      setIsVerifyingId(null);
    }
  }

  if (isLoading) {
    return (
      <AppPageLayout showTabs={false} frameClassName="milestone-entry-frame">
        <div className="entry-flow-shell">
          <div className={styles.panel}>
            <FlowHeader title="경기 화면" />
            <p className={styles.helper}>경기 정보를 불러오는 중입니다.</p>
          </div>
        </div>
      </AppPageLayout>
    );
  }

  if (!match) {
    return (
      <AppPageLayout showTabs={false} frameClassName="milestone-entry-frame">
        <div className="entry-flow-shell">
          <div className={styles.panel}>
            <FlowHeader title="경기 화면" />
            <p className={styles.helper}>{errorMessage ?? "경기 정보를 찾을 수 없습니다."}</p>
          </div>
        </div>
      </AppPageLayout>
    );
  }

  const canVerify = Boolean(match.createdByCurrentUser || match.myRecordExists);

  return (
    <AppPageLayout showTabs={false} frameClassName="milestone-entry-frame">
      <div className="entry-flow-shell">
        <div className={styles.panel}>
          <FlowHeader title="경기 화면" />

          <section className={styles.section}>
            <div className={styles.fieldGrid}>
              <article className={styles.fieldCard}>
                <span className={styles.fieldLabel}>날짜</span>
                <strong className={styles.fieldValue}>{match.playedDate}</strong>
              </article>
              <article className={styles.fieldCard}>
                <span className={styles.fieldLabel}>시간</span>
                <strong className={styles.fieldValue}>{match.playedAtLabel}</strong>
              </article>
              <article className={styles.fieldCard}>
                <span className={styles.fieldLabel}>지역</span>
                <strong className={styles.fieldValue}>{`${match.cityName} ${match.districtName}`}</strong>
              </article>
              <article className={styles.fieldCard}>
                <span className={styles.fieldLabel}>구장명</span>
                <strong className={styles.fieldValue}>{match.stadiumName}</strong>
              </article>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>기록을 남긴 사람</h2>
            <div className={styles.recordList}>
              {match.records.map((record) => {
                const isMine = user?.id === record.userId;
                return (
                  <article key={record.batterRecordId} className={styles.recordCard}>
                    <div className={styles.recordRow}>
                      <p className={styles.recordName}>{record.displayName}</p>
                      <span className={record.verified ? styles.verifiedBadge : styles.pendingBadge}>
                        {record.verified ? "인증 기록" : "인증 전"}
                      </span>
                    </div>
                    <div className={styles.recordStats}>
                      타석 {record.plateAppearances} · 안타 {record.hits} · 타율 {record.battingAverage}
                    </div>
                    {canVerify && !record.verified && !isMine ? (
                      <button
                        type="button"
                        className={styles.ghostAction}
                        onClick={() => handleVerify(record.batterRecordId)}
                        disabled={isVerifyingId === record.batterRecordId}
                      >
                        인증
                      </button>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>

          <div className={styles.detailActions}>
            <button type="button" className={styles.ghostAction} disabled>
              더 보기
            </button>
            {match.myRecordExists ? (
              <button type="button" className={styles.ghostAction} disabled>
                내 기록 있음
              </button>
            ) : (
              <button
                type="button"
                className={styles.primaryAction}
                onClick={() => router.push(`/matches/${gameId}/record`)}
              >
                내 기록 입력하기
              </button>
            )}
          </div>

          {errorMessage ? <p className="entry-error-message">{errorMessage}</p> : null}
        </div>
      </div>
    </AppPageLayout>
  );
}
