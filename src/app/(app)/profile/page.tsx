"use client";

import { useLogout } from "@/features/auth/data/authData";
import { ProfileScreen } from "@/features/profile/screens/ProfileScreen";

export default function ProfilePage() {
  const { pending, logOut } = useLogout();
  return <ProfileScreen onLogout={() => void logOut()} logoutPending={pending} />;
}
