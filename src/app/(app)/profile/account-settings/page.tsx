import type { Metadata } from "next";

import { AccountSettingsScreen } from "@/features/profile/screens/AccountSettingsScreen";

export const metadata: Metadata = { title: "Account Settings | StatOz" };

export default function AccountSettingsPage() {
  return <AccountSettingsScreen />;
}
