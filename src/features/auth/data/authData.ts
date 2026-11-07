import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { create } from "zustand";

import {
  deleteUser,
  FIREBASE_CONFIG,
  getCurrentUser,
  getSignedIn,
  googleSignIn,
  loginSignupUser,
  logout,
  sendOtp,
  subscribeSession,
  type ApiResult,
  type AuthUser,
} from "@/core";
import { loadedKeys, peekResource, setResource } from "@/hooks/useResource";

const DEVICE_ID_KEY = "statoz.deviceId";

/** Used when storage is blocked, so this tab still sends one id. */
let fallbackDeviceId: string | null = null;

/**
 * One id per browser, kept across visits, so logging in again reuses this
 * device's session instead of adding one.
 */
function deviceId(): string {
  try {
    const stored = window.localStorage.getItem(DEVICE_ID_KEY);
    if (stored) return stored;
    const id = crypto.randomUUID();
    window.localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  } catch {
    fallbackDeviceId ??= crypto.randomUUID();
    return fallbackDeviceId;
  }
}

/** The signed-in user, filled by the login response or `getCurrentUser()`. */
const useUserStore = create<{ user: AuthUser | null }>(() => ({ user: null }));

// Cleared with the session: on logout, and when the API says it is over.
subscribeSession(() => {
  if (getSignedIn() === false) useUserStore.setState({ user: null });
});

let userRequest: Promise<void> | null = null;

/** Screens that ask at once share one request. */
function fetchCurrentUser() {
  userRequest ??= getCurrentUser()
    .then((result) => {
      // A logout while this was in flight keeps the user cleared.
      if (result.success && getSignedIn()) {
        useUserStore.setState({ user: result.data });
      }
    })
    .catch(() => {})
    .finally(() => {
      userRequest = null;
    });
  return userRequest;
}

/**
 * The signed-in user; `null` for a guest or until it loads. On page load this
 * asks the API, since only the API can read the session cookies.
 */
export function useCurrentUser(): AuthUser | null {
  const signedIn = useSyncExternalStore(
    subscribeSession,
    getSignedIn,
    () => null,
  );
  const user = useUserStore((state) => state.user);
  useEffect(() => {
    // Logins already carry the user, so only an unknown session asks. Read
    // live: a late-hydrating screen renders with the server's `null`.
    if (getSignedIn() === null) void fetchCurrentUser();
  }, [signedIn]);
  return user;
}

/**
 * Takes a placed bet's stake off the balance on screen, as the API already
 * has. Cached copies of `current-user` (the profile's) are updated too.
 */
export function spendCoins(amount: number) {
  const spend = (user: AuthUser) => ({ ...user, coins: user.coins - amount });
  const { user } = useUserStore.getState();
  if (user) useUserStore.setState({ user: spend(user) });
  for (const key of loadedKeys("user/current-user")) {
    const cached = peekResource<AuthUser>(key);
    if (cached) setResource(key, spend(cached));
  }
}

/**
 * Merges what the API saved into the signed-in user, and into cached copies
 * of `current-user` (the profile's).
 */
export function updateCurrentUser(patch: Partial<AuthUser>) {
  const { user } = useUserStore.getState();
  if (user) useUserStore.setState({ user: { ...user, ...patch } });
  for (const key of loadedKeys("user/current-user")) {
    const cached = peekResource<AuthUser>(key);
    if (cached) setResource(key, { ...cached, ...patch });
  }
}

/** The code is hashed with the exact email, so both calls must send the same string. */
const normalise = (email: string) => email.trim().toLowerCase();

const GENERIC_ERROR = "Something went wrong. Please try again.";

/** The backend's messages, in the words the player sees. */
const MESSAGES: Record<string, string> = {
  "Invalid OTP": "That code is incorrect.",
  // Bypass accounts answer a wrong code with this, as a 404.
  "OTP is incorect": "That code is incorrect.",
  "OTP expired or not found": "This code has expired. Send a new one.",
  "This email is not allowed": "This email can't be used.",
  "Email is required": "Enter a valid email address",
  "Email and otp are required field": "Enter your email and the 6-digit code.",
  "Invalid or expired Firebase token":
    "Google sign-in expired. Please try again.",
  "Google account email is not verified":
    "This Google account can't be used. Try signing in with your email instead.",
  "Email is missing in Firebase token":
    "This Google account can't be used. Try signing in with your email instead.",
};

function messageFor(result: Exclude<ApiResult<unknown>, { success: true }>) {
  // The 429 body is plain text, not one of the messages above.
  if (result.statusCode === 429) {
    return "Too many attempts. Please try again in a few minutes.";
  }
  return MESSAGES[result.message] ?? GENERIC_ERROR;
}

/** Only paths on this site, so `returnTo` cannot send the player elsewhere. */
function returnPath(): string {
  const returnTo = new URLSearchParams(window.location.search).get("returnTo");
  return returnTo?.startsWith("/") && !returnTo.startsWith("//")
    ? returnTo
    : "/";
}

/** A new account sets up its profile first, then goes where it was heading. */
const afterLogin = (isNewUser: boolean) =>
  isNewUser
    ? `/onboarding?returnTo=${encodeURIComponent(returnPath())}`
    : returnPath();

/**
 * Email OTP sign-in for the auth screen. `sendCode` mails a code and
 * `verifyCode` signs in with it, creating the account for a new email. Both
 * reject on failure, after setting `error`.
 */
export function useEmailOtpLogin() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [emailPending, setEmailPending] = useState(false);
  const [otpPending, setOtpPending] = useState(false);
  // A code works once, so a second submit while one is in flight is dropped.
  const verifying = useRef(false);

  async function sendCode(email: string) {
    setEmailPending(true);
    setError(undefined);
    try {
      // "otp" is required: the default purpose makes a code this flow rejects.
      const result = await sendOtp(normalise(email), "otp");
      if (!result.success) {
        setError(messageFor(result));
        throw new Error(result.message);
      }
    } catch (cause) {
      setError((current) => current ?? GENERIC_ERROR);
      throw cause;
    } finally {
      setEmailPending(false);
    }
  }

  async function verifyCode(email: string, otp: string) {
    if (verifying.current) return;
    verifying.current = true;
    setOtpPending(true);
    setError(undefined);
    try {
      const result = await loginSignupUser({
        email: normalise(email),
        otp,
        deviceId: deviceId(),
        platform: "web",
      });
      if (!result.success) {
        setError(messageFor(result));
        throw new Error(result.message);
      }
      useUserStore.setState({ user: result.data.user });
      router.replace(afterLogin(result.data.isNewUser));
    } catch (cause) {
      setError((current) => current ?? GENERIC_ERROR);
      throw cause;
    } finally {
      verifying.current = false;
      setOtpPending(false);
    }
  }

  return {
    error,
    emailPending,
    otpPending,
    sendCode,
    verifyCode,
    clearError: () => setError(undefined),
  };
}

/** Firebase loads on the first Google sign-in, not with the page. */
async function firebaseAuth() {
  const [{ getApps, initializeApp }, { getAuth }] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
  ]);
  return getAuth(getApps()[0] ?? initializeApp(FIREBASE_CONFIG));
}

/** Leaves no half-signed-in Firebase state behind. */
async function signOutOfFirebase() {
  const { getApps } = await import("firebase/app");
  if (getApps().length === 0) return;
  const { getAuth, signOut } = await import("firebase/auth");
  await signOut(getAuth());
}

/** Closing the account picker is not an error. */
const isCancelled = (cause: unknown) =>
  typeof cause === "object" &&
  cause !== null &&
  "code" in cause &&
  (cause.code === "auth/popup-closed-by-user" ||
    cause.code === "auth/cancelled-popup-request");

/**
 * Google sign-in through a Firebase popup. The Firebase ID token is traded
 * for the backend's tokens, creating the account when there is none.
 */
export function useGoogleLogin() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function signIn() {
    if (pending) return;
    setPending(true);
    setError(undefined);
    try {
      const auth = await firebaseAuth();
      const { GoogleAuthProvider, signInWithPopup } =
        await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const { user } = await signInWithPopup(auth, provider);
      // Fetched right before each call: Firebase tokens last an hour.
      const send = async (forceRefresh: boolean) =>
        googleSignIn({
          idToken: await user.getIdToken(forceRefresh),
          deviceId: deviceId(),
          platform: "web",
        });
      let result = await send(false);
      // One retry with a fresh token covers one that expired in between.
      if (
        !result.success &&
        result.message === "Invalid or expired Firebase token"
      ) {
        result = await send(true);
      }
      if (result.success) {
        useUserStore.setState({ user: result.data.user });
        router.replace(afterLogin(result.data.isNewUser));
        return;
      }
      setError(messageFor(result));
      await signOutOfFirebase();
    } catch (cause) {
      if (isCancelled(cause)) return;
      setError(GENERIC_ERROR);
      await signOutOfFirebase().catch(() => {});
    } finally {
      setPending(false);
    }
  }

  return { error, pending, signIn, clearError: () => setError(undefined) };
}

/**
 * Signs this device out, then opens the login screen. Replacing the entry
 * keeps Back from returning to a signed-in screen.
 */
export function useLogout() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logOut() {
    if (pending) return;
    setPending(true);
    await logout();
    await signOutOfFirebase().catch(() => {});
    router.replace("/auth");
  }

  return { pending, logOut };
}

const DELETE_ERROR = "Couldn't delete your account. Try again.";

/**
 * Deletes the player's account, then signs this device out and opens the
 * login screen. `pending` stays true once it succeeds, until the page leaves.
 */
export function useDeleteAccount() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function deleteAccount() {
    if (pending) return;
    setPending(true);
    setError(undefined);
    try {
      const result = await deleteUser();
      if (!result.success) {
        setError(result.message || DELETE_ERROR);
        setPending(false);
        return;
      }
    } catch {
      setError(DELETE_ERROR);
      setPending(false);
      return;
    }
    // The API has ended every session but left the cookies; logout asks it to
    // clear them, and signs this device out whatever it answers.
    await logout();
    await signOutOfFirebase().catch(() => {});
    router.replace("/auth");
  }

  return { pending, error, deleteAccount };
}
