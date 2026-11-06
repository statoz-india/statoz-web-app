"use client";

import { usePathname, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";

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
  const cancel = useCallback(() => {
    useAuthGate.getState().request?.onCancel?.();
    close();
  }, [close]);

  return (
    <>
      {/* The path is only known at request time, so it waits on its own. */}
      <Suspense fallback={null}>
        <CloseOnNavigate close={close} />
      </Suspense>
      {request ? (
        <AuthGateDialog
          request={request}
          onCancel={cancel}
          onContinue={() => {
            const returnTo = request.returnTo ?? window.location.pathname;
            close();
            router.push(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
          }}
        />
      ) : null}
    </>
  );
}

/** The nav stays usable beside the gate; going somewhere else closes it. */
function CloseOnNavigate({ close }: { close: () => void }) {
  const pathname = usePathname();
  useEffect(() => close(), [pathname, close]);
  return null;
}
