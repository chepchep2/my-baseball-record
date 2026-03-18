import Link from "next/link";
import AppPageLayout from "@/components/layout/AppPageLayout";

const batterSummary = [
  ["경기수", "24"],
  ["타수", "88"],
  ["총안타", "31"],
  ["타율", ".352"],
  ["OPS", ".898"],
];

const pitcherSummary = [
  ["경기수", "9"],
  ["이닝", "24.1"],
  ["ERA", "2.18"],
  ["WHIP", "1.03"],
  ["삼진", "22"],
  ["승", "3"],
];

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

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const recordType = params?.type === "pitcher" ? "pitcher" : "batter";
  const currentYear = new Date().getFullYear();
  const summaryCards = recordType === "batter" ? batterSummary : pitcherSummary;

  return (
    <AppPageLayout>
        <section className="panel summary-panel">
          <div className="page-title-block">
            <p className="eyebrow">My Baseball Record</p>
            <h1 className="page-title">
              시즌 기록 <span className="title-context">({currentYear} 시즌)</span>
            </h1>
          </div>

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

          <SummaryGrid items={summaryCards} />
        </section>
    </AppPageLayout>
  );
}
