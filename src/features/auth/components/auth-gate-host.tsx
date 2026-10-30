"use client";

import { useRouter } from "next/navigation";

import { AuthGateDialog } from "@/features/auth/components/authGateDialog";

import { useAuthGate } from "../index";

/**
 * Renders the login prompt whenever `useRequireAuth` opens it. Mounted once,
 * in the root layout, so every caller shares one dialog.
 */
export function AuthGateHost() {
  const router = useRouter();
  const request = useAuthGate((state) => state.request);
  // The store's actions never change, so the dialog's focus effect runs once.
  const close = useAuthGate((state) => state.close);

  if (!request) return null;

  return (
    <AuthGateDialog
      request={request}
      onCancel={close}
      onContinue={() => {
        const returnTo = request.returnTo ?? window.location.pathname;
        close();
        router.push(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
      }}
    />
  );
}
