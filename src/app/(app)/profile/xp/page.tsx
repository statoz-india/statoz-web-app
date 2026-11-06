import type { Metadata } from "next";

import { XPScreen } from "@/features/profile/screens/XPScreen";

export const metadata: Metadata = { title: "XP Progress | StatOz" };

export default function XpPage() {
  return <XPScreen />;
}
