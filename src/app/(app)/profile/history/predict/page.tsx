import type { Metadata } from "next";

import { PredictResultsScreen } from "@/features/profile/screens/predictResultsScreen";

export const metadata: Metadata = { title: "Predict Results | StatOz" };

export default function PredictResultsPage() {
  return <PredictResultsScreen />;
}
