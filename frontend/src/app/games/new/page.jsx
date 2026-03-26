import AppPageLayout from "@/components/layout/AppPageLayout";
import EntryFlowClient from "@/features/entry/components/EntryFlowClient";

export default function GamesNewPage() {
  return (
    <AppPageLayout showTabs={false} frameClassName="milestone-entry-frame">
      <EntryFlowClient />
    </AppPageLayout>
  );
}
