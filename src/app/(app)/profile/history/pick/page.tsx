import type { Metadata } from "next";

import { PickResultsScreen } from "@/features/profile/screens/pickResultsScreen";

export const metadata: Metadata = { title: "Pick Results | StatOz" };

export default function PickResultsPage() {
  return <PickResultsScreen />;
}
