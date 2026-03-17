import Link from "next/link";

const batterSummary = [
  ["경기수", "12"],
  ["타수", "37"],
  ["총안타", "14"],
  ["타율", "0.378"],
  ["OPS", "0.941"],
];

const pitcherSummary = [
  ["경기수", "7"],
  ["이닝", "18.2"],
  ["ERA", "2.41"],
  ["WHIP", "1.07"],
  ["삼진", "19"],
  ["승", "2"],
];

export default async function RecordsPage({ searchParams }) {
  const params = await searchParams;
  const currentYear = new Date().getFullYear();
  const recordType = params?.type === "pitcher" ? "pitcher" : "batter";
  const showProfileMenu = params?.menu === "account";
  const summaryCards = recordType === "batter" ? batterSummary : pitcherSummary;

  return (
    <main className="page-shell">
      <section className="page-frame record-page">
        <section className="panel summary-panel">
          <div className="summary-header-row">
            <div className="page-title-block">
              <p className="eyebrow">My Baseball Record</p>
              <h1 className="page-title">
                시즌 기록 <span className="title-context">({currentYear} 시즌)</span>
              </h1>
              <span />
            </div>

            <div className="summary-meta-stack">
              <div className="profile-menu-wrap">
                <Link
                  className="profile-trigger"
                  href={showProfileMenu ? `/records?type=${recordType}` : `/records?type=${recordType}&menu=account`}
                >
                  내 계정
                </Link>

                {showProfileMenu ? (
                  <div className="profile-menu" role="menu" aria-label="프로필 메뉴">
                    <Link className="profile-menu-item" href="/account" role="menuitem">
                      내 정보
                    </Link>
                    <Link className="profile-menu-item" href="/auth" role="menuitem">
                      로그아웃
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="summary-control-row">
            <div className="summary-switch-row" role="tablist" aria-label="기록 축 전환">
              <Link
                className={recordType === "batter" ? "tab-button active" : "tab-button"}
                href="/records?type=batter"
              >
                타자
              </Link>
              <Link
                className={recordType === "pitcher" ? "tab-button active" : "tab-button"}
                href="/records?type=pitcher"
              >
                투수
              </Link>
            </div>

            <Link className="secondary-button compact-action-button" href="/games/new">
              경기 추가
            </Link>
          </div>

          <section className="summary-grid" aria-label="핵심 지표">
            {summaryCards.map(([label, value]) => (
              <article key={label} className="stat-card">
                <p className="stat-label">{label}</p>
                <strong className="stat-value">{value}</strong>
              </article>
            ))}
          </section>

          <div className="inline-button-row">
            <Link className="primary-button full-width-button" href="/records/details">
              상세 기록 보기
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
