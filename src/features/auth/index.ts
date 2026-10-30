import { useSyncExternalStore } from "react";
import { create } from "zustand";

import { getAccessToken, subscribeAccessToken } from "@/core";
import type { AuthGateRequest } from "@/features/auth/components/authGateDialog";

export type { AuthGateRequest };

/**
 * Auth adapter. The primary nav reads these hooks, and anything that needs an
 * account asks through `useRequireAuth`. A player is signed in while there is
 * an access token from `login()`.
 */
export type AuthStatus = "hydrating" | "guest" | "authenticated";

const statusSnapshot = (): AuthStatus =>
  getAccessToken() ? "authenticated" : "guest";
// The server never has a token, so it cannot tell a guest from a player.
const serverStatus = (): AuthStatus => "hydrating";

/** The current session. `hydrating` means it is not known yet. */
export function useAuthSession(): { status: AuthStatus } {
  const status = useSyncExternalStore(
    subscribeAccessToken,
    statusSnapshot,
    serverStatus,
  );
  return { status };
}

type AuthGateState = {
  /** The request on screen, or `null` when the gate is closed. */
  request: AuthGateRequest | null;
  open: (request: AuthGateRequest) => void;
  close: () => void;
};

/** One gate for the whole app, rendered by `AuthGateHost`. */
export const useAuthGate = create<AuthGateState>((set) => ({
  request: null,
  open: (request) => set({ request }),
  close: () => set({ request: null }),
}));

/**
 * Returns the function a tile calls when a player taps something that needs
 * an account. It returns true for a signed-in player. Otherwise it opens the
 * login prompt and returns false; while the session is still hydrating it
 * returns false without one, so a tap in the first frames does nothing.
 */
export function useRequireAuth(): (request: AuthGateRequest) => boolean {
  const { status } = useAuthSession();
  return (request) => {
    if (status === "authenticated") return true;
    if (status === "hydrating") return false;
    const gate = useAuthGate.getState();
    // A second request while one is open keeps the first on screen.
    if (!gate.request) gate.open(request);
    return false;
  };
}
