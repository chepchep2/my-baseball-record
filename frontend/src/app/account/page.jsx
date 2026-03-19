"use client";

import { useState } from "react";
import AppPageLayout from "@/components/layout/AppPageLayout";
import BottomTabBar from "@/components/navigation/BottomTabBar";
import PageHeader from "@/components/layout/PageHeader";
import { useAuthSession } from "@/features/auth/session/useAuthSession";

export default function AccountPage() {
  const { logout, user } = useAuthSession();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    setPending(true);

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("auth.redirectAfterLogin", "/home");
    }

    try {
      await logout();
    } finally {
      if (typeof window !== "undefined") {
        window.location.assign("/auth?from=logout");
      }
    }
  };

  return (
    <AppPageLayout showTabs={false} frameClassName="account-center-frame" requireAuth={!pending}>
      <section className="panel detail-screen-panel">
        <PageHeader title="내 정보" />

        <section className="account-info-grid" aria-label="계정 정보">
          <article className="inline-summary-item">
            <span>로그인 방식</span>
            <strong>Google</strong>
          </article>
          {user?.displayName ? (
            <article className="inline-summary-item">
              <span>이름</span>
              <strong>{user.displayName}</strong>
            </article>
          ) : null}
          {user?.email ? (
            <article className="inline-summary-item">
              <span>이메일</span>
              <strong>{user.email}</strong>
            </article>
          ) : null}
        </section>

        <div className="footer-action-row">
          <button type="button" className="ghost-button as-link full-width-button" onClick={handleLogout} disabled={pending}>
            {pending ? "로그아웃 중..." : "로그아웃"}
          </button>
        </div>

        <BottomTabBar className="in-panel" />
      </section>
    </AppPageLayout>
  );
}
