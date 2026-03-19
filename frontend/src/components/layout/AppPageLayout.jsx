"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import BottomTabBar from "@/components/navigation/BottomTabBar";
import { useAuthSession } from "@/features/auth/session/useAuthSession";

export default function AppPageLayout({
  children,
  showTabs = true,
  frameClassName = "",
  requireAuth = true,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isBootstrapping } = useAuthSession();

  useEffect(() => {
    if (!requireAuth || isBootstrapping || isAuthenticated) {
      return;
    }

    const nextPath = pathname && pathname.startsWith("/") ? pathname : "/home";
    router.replace(`/auth?next=${encodeURIComponent(nextPath)}`);
  }, [isAuthenticated, isBootstrapping, pathname, requireAuth, router]);

  const isGuarding = requireAuth && (isBootstrapping || !isAuthenticated);

  return (
    <main className="page-shell app-page-shell">
      <section className={`page-frame mobile-app-frame record-page app-screen ${frameClassName}`.trim()}>
        {isGuarding ? (
          <section className="panel detail-screen-panel auth-guard-panel">
            <p className="section-copy">세션 확인 중입니다...</p>
          </section>
        ) : (
          <>
            {children}
            {showTabs ? <BottomTabBar /> : null}
          </>
        )}
      </section>
    </main>
  );
}
