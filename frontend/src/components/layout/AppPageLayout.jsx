import BottomTabBar from "@/components/navigation/BottomTabBar";

export default function AppPageLayout({ children, showTabs = true }) {
  return (
    <main className="page-shell app-page-shell">
      <section className="page-frame mobile-app-frame record-page app-screen">
        {children}
        {showTabs ? <BottomTabBar /> : null}
      </section>
    </main>
  );
}
