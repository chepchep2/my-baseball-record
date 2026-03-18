import Link from "next/link";
import AppPageLayout from "@/components/layout/AppPageLayout";

export default function AccountPage() {
  return (
    <AppPageLayout>
        <section className="panel detail-screen-panel">
          <div className="page-title-block">
            <p className="eyebrow">My Baseball Record</p>
            <h1 className="page-title">내 정보</h1>
          </div>

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
        </section>
    </AppPageLayout>
  );
}
