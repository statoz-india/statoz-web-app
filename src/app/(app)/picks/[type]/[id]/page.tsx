import { Suspense } from "react";

import { PickDetailScreen } from "@/features/picks/screens/pickDetailScreen";

export default function PickPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <PickDetailScreen />
    </Suspense>
  );
}
