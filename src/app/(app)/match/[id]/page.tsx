import { Suspense } from "react";

import MatchScreen from "@/features/match/screens/MatchScreen";

export default function MatchPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <MatchScreen />
    </Suspense>
  );
}
