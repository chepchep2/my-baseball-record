import AppPageLayout from "@/components/layout/AppPageLayout";
import MatchCreateFlowClient from "@/features/matches/components/MatchCreateFlowClient";

export default function MatchCreatePage() {
  return (
    <AppPageLayout showTabs={false} frameClassName="milestone-entry-frame">
      <MatchCreateFlowClient />
    </AppPageLayout>
  );
}
