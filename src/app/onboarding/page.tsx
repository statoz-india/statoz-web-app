import { Suspense } from "react";

import { OnboardingScreen } from "@/features/profile/screens/OnboardingScreen";

/** A new account's profile setup, outside the app's navigation. */
export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingScreen />
    </Suspense>
  );
}
