import Link from "next/link";
import AppPageLayout from "@/components/layout/AppPageLayout";
import BottomTabBar from "@/components/navigation/BottomTabBar";
import PageHeader from "@/components/layout/PageHeader";

export default function AccountPage() {
  return (
    <AppPageLayout showTabs={false} frameClassName="account-center-frame">
        <section className="panel detail-screen-panel">
          <PageHeader title="내 정보" />

          <section className="account-info-grid" aria-label="계정 정보">
            <article className="inline-summary-item">
              <span>로그인 방식</span>
              <strong>Google</strong>
            </article>
          </section>

          <div className="footer-action-row">
            <Link className="ghost-button as-link full-width-button" href="/auth">
              로그아웃
            </Link>
          </div>

          <BottomTabBar className="in-panel" />
        </section>
    </AppPageLayout>
  );
}
