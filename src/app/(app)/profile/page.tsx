import { LogoutButton } from "@/features/auth/components/logout-button";
import ComingSoonScreen from "@/lib/screens/coming-soon";

export default function ProfileScreen() {
  return (
    <>
      <ComingSoonScreen />
      <LogoutButton className="mx-auto mb-8" />
    </>
  );
}
