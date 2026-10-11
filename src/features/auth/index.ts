/**
 * Auth adapter. The game tiles and the primary nav read these two hooks, and
 * they are the seam to wire to the real session once login exists. Until then
 * everyone is treated as signed in, so every tile is a plain link to its game
 * and PROFILE is a plain link to the profile page.
 */
export type AuthStatus = "hydrating" | "guest" | "authenticated";

export type AuthGateRequest = {
  /** What the player was trying to do, for example "play". */
  intent: string;
  message?: string;
  /** Where to send the player once they have logged in. */
  returnTo?: string;
};

/** The current session. `hydrating` means it is not known yet. */
export function useAuthSession(): { status: AuthStatus } {
  return { status: "authenticated" };
}

/**
 * Returns the function a tile calls when a signed-out player taps it. It
 * should open the login prompt and return false, or return true when the
 * player is already signed in.
 */
export function useRequireAuth(): (request: AuthGateRequest) => boolean {
  return () => true;
}
