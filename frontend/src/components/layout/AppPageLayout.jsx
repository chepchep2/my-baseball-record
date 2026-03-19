import BottomTabBar from "@/components/navigation/BottomTabBar";

export default function AppPageLayout({ children, showTabs = true, frameClassName = "" }) {
  return (
    <main className="page-shell app-page-shell">
      <section className={`page-frame mobile-app-frame record-page app-screen ${frameClassName}`.trim()}>
        {children}
        {showTabs ? <BottomTabBar /> : null}
      </section>
    </main>
  );
}
