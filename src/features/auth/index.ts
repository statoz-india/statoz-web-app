import { useSyncExternalStore } from "react";
import { create } from "zustand";

import { getSignedIn, subscribeSession } from "@/core";
import type { AuthGateRequest } from "@/features/auth/components/authGateDialog";

import {
  spendCoins,
  updateCurrentUser,
  useCurrentUser,
} from "./data/authData";

export type { AuthGateRequest };
export { spendCoins, updateCurrentUser, useCurrentUser };

/**
 * Auth adapter. The primary nav reads these hooks, and anything that needs an
 * account asks through `useRequireAuth`. A player is signed in while the API
 * accepts the session cookies from `loginSignupUser()`.
 */
export type AuthStatus = "hydrating" | "guest" | "authenticated";

const statusSnapshot = (): AuthStatus => {
  const signedIn = getSignedIn();
  if (signedIn === null) return "hydrating";
  return signedIn ? "authenticated" : "guest";
};
// The server can't see the API's cookies, so it cannot tell a guest from a player.
const serverStatus = (): AuthStatus => "hydrating";

/** The current session. `hydrating` means the API has not answered yet. */
export function useAuthSession(): { status: AuthStatus } {
  // Asks the API on page load; until it answers, the status stays `hydrating`.
  useCurrentUser();
  const status = useSyncExternalStore(
    subscribeSession,
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
