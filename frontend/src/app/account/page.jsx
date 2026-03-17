import Link from "next/link";

export default function AccountPage() {
  return (
    <main className="page-shell">
      <section className="page-frame record-page">
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
            <Link className="ghost-button as-link full-width-button" href="/records">
              뒤로
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
