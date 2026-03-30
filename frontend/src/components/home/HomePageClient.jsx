"use client";

import React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/features/auth/session/useAuthSession";
import AppPageLayout from "@/components/layout/AppPageLayout";
import { getHomeDashboard } from "@/features/home/api/home-api";

function SummaryList({ items }) {
  return items.map(([label, value]) => (
    <div key={label} className="milestone-home-stat-row">
      <span className="milestone-home-stat-label">{label}</span>
      <strong className="milestone-home-stat-value">{value}</strong>
    </div>
  ));
}

export default function HomePageClient({ selectedScope = "season" }) {
  const router = useRouter();
  const { apiClient, isAuthenticated, isBootstrapping } = useAuthSession();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadHomeDashboard() {
      if (isBootstrapping) {
        return;
      }

      if (!isAuthenticated) {
        router.replace(`/auth?next=${encodeURIComponent(`/home?scope=${selectedScope}`)}`);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result = await getHomeDashboard(apiClient, { selectedScope });

        if (!active) {
          return;
        }

        if (result.isEmpty) {
          router.replace("/games/new");
          return;
        }

        setDashboard(result);
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorMessage(error?.message || "기록을 불러오지 못했습니다.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadHomeDashboard();

    return () => {
      active = false;
    };
  }, [apiClient, isAuthenticated, isBootstrapping, router, selectedScope]);

  const activeSummaryItems = selectedScope === "career"
    ? dashboard?.careerSummaryItems ?? []
    : dashboard?.seasonSummaryItems ?? [];

  return (
    <AppPageLayout showTabs={false} frameClassName="milestone-home-frame">
      <Link href="/games/new" className="milestone-home-fab" aria-label="새 경기 기록 추가">
        +
      </Link>
      <section className="panel milestone-home-panel">
        <div className="milestone-home-content">
          <div className="milestone-home-scope-tabs" role="tablist" aria-label="기록 범위 전환">
            <Link
              className={selectedScope === "season" ? "tab-button active" : "tab-button"}
              href="/home?scope=season"
            >
              올해 시즌
            </Link>
            <Link
              className={selectedScope === "career" ? "tab-button active" : "tab-button"}
              href="/home?scope=career"
            >
              통산
            </Link>
          </div>

          {isLoading ? (
            <p className="section-copy">기록을 불러오는 중입니다...</p>
          ) : errorMessage ? (
            <p className="section-copy">{errorMessage}</p>
          ) : (
            <>
              <section className="milestone-home-summary-card" aria-label="핵심 지표">
                <SummaryList items={activeSummaryItems} />
              </section>

              <section className="milestone-home-recent-panel" aria-label="최근 경기 기록 리스트">
                <h2 className="milestone-home-section-title">최근 경기 기록 리스트</h2>
                <div className="milestone-home-recent-list">
                  {dashboard?.recentGames.map((game) => (
                    <article key={game.id} className="milestone-home-recent-card">
                      <p className="milestone-home-recent-date">{game.playedLabel}</p>
                      <p className="milestone-home-recent-summary">{game.summaryLabel}</p>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </section>
    </AppPageLayout>
  );
}
