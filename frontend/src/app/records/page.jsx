import { Suspense } from "react";
import RecordsPageClient from "@/components/records/RecordsPageClient";

export default function RecordsPage() {
  return (
    <Suspense fallback={null}>
      <RecordsPageClient />
    </Suspense>
  );
}
