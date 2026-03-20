"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppPageLayout from "@/components/layout/AppPageLayout";
import BottomTabBar from "@/components/navigation/BottomTabBar";
import PageHeader from "@/components/layout/PageHeader";
import { useAuthSession } from "@/features/auth/session/useAuthSession";
import { getStats } from "@/features/stats/api/stats-api";

function SummaryGrid({ items }) {
  return (
    <section className="summary-grid-panel">
      <section className="summary-grid" aria-label="핵심 지표">
        {items.map(([label, value]) => (
          <article key={label} className="stat-card">
            <p className="stat-label">{label}</p>
            <strong className="stat-value">{value}</strong>
          </article>
        ))}
      </section>
    </section>
  );
}

export default function HomePageClient({ recordType, currentYear }) {
  const { apiClient } = useAuthSession();
  const [summaryItems, setSummaryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadHomeStats() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result = await getStats(apiClient, {
          scope: "current_season",
          recordType,
          gameFilter: "all",
        });

        if (!active) {
          return;
        }

        setSummaryItems(result.summaryItems);
        setIsEmpty(result.isEmpty);
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

    loadHomeStats();

    return () => {
      active = false;
    };
  }, [apiClient, recordType]);

  return (
    <AppPageLayout showTabs={false} frameClassName="home-center-frame">
      <section className="panel summary-panel">
        <div className="home-summary-content">
          <PageHeader title="시즌 기록" context={`(${currentYear} 시즌)`} />

          <div className="summary-switch-row" role="tablist" aria-label="기록 축 전환">
            <Link
              className={recordType === "batter" ? "tab-button active" : "tab-button"}
              href="/home?type=batter"
            >
              타자
            </Link>
            <Link
              className={recordType === "pitcher" ? "tab-button active" : "tab-button"}
              href="/home?type=pitcher"
            >
              투수
            </Link>
          </div>

          {isLoading ? (
            <p className="section-copy">기록을 불러오는 중입니다...</p>
          ) : errorMessage ? (
            <p className="section-copy">{errorMessage}</p>
          ) : isEmpty ? (
            <p className="section-copy">아직 기록이 없습니다. 첫 경기를 저장해 보세요.</p>
          ) : (
            <SummaryGrid items={summaryItems} />
          )}
        </div>
        <BottomTabBar className="in-panel" />
      </section>
    </AppPageLayout>
  );
}
