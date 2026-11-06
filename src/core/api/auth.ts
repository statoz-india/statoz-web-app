import { z } from "zod";

import {
  currentUserResponseSchema,
  loginSignupResponseSchema,
  logoutResponseSchema,
  sendOtpResponseSchema,
  type ApiResult,
  type CurrentUserResponse,
  type LoginSignupResponse,
  type SendOtpResponse,
} from "@/core/models";

import {
  authenticatedFetch,
  getSignedIn,
  setSignedIn,
  unauthenticatedFetch,
  type RequestOptions,
} from "./client";
import { ENDPOINTS } from "./endpoints";

/**
 * Email OTP login: `sendOtp` mails a code, and `loginSignupUser` trades it for
 * the session cookies, which `authenticatedFetch` then sends on every call.
 * Both resolve to the API's response; check `success` before reading `data`.
 */

/** `fetcher` is `authenticatedFetch` for calls whose response sets the cookies. */
function postJson<T>(
  path: string,
  body: unknown,
  schema: z.ZodType<T>,
  options: RequestOptions = {},
  fetcher = unauthenticatedFetch,
): Promise<ApiResult<T>> {
  return fetcher(path, schema, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: options.signal,
  });
}

/** Mails a one-time code to `email`. */
export function sendOtp(
  email: string,
  purpose = "login",
  options?: RequestOptions,
): Promise<ApiResult<SendOtpResponse["data"]>> {
  return postJson(
    ENDPOINTS.sendOtp,
    { email, purpose },
    sendOtpResponseSchema.shape.data,
    options,
  );
}

export type LoginSignupBody = {
  email: string;
  /** The 6 digits as a string; a number is rejected. */
  otp: string;
  /** One per install, so logging in again reuses this device's session. */
  deviceId: string;
  deviceName?: string;
  platform: "web";
  appVersion?: string;
  deviceType?: string;
};

/**
 * Trades a code from `sendOtp(email, "otp")` for tokens, creating the account
 * when the email has none (`isNewUser`). On success both tokens are kept for
 * `authenticatedFetch`.
 */
export function loginSignupUser(
  body: LoginSignupBody,
  options?: RequestOptions,
): Promise<ApiResult<LoginSignupResponse["data"]>> {
  return signIn(ENDPOINTS.loginSignupUser, body, options);
}

export type GoogleSignInBody = Omit<LoginSignupBody, "email" | "otp"> & {
  /** The Firebase ID token, not the Google one. */
  idToken: string;
};

/**
 * Trades a Firebase ID token from Google sign-in for tokens, creating the
 * account when there is none (`isNewUser`). On success both tokens are kept.
 */
export function googleSignIn(
  body: GoogleSignInBody,
  options?: RequestOptions,
): Promise<ApiResult<LoginSignupResponse["data"]>> {
  return signIn(ENDPOINTS.googleSignIn, body, options);
}

async function signIn(
  path: string,
  body: unknown,
  options?: RequestOptions,
): Promise<ApiResult<LoginSignupResponse["data"]>> {
  const result = await postJson(
    path,
    body,
    loginSignupResponseSchema.shape.data,
    options,
    authenticatedFetch,
  );
  // The tokens in the body are for the mobile app; the API also set them as cookies.
  if (result.success) setSignedIn(true);
  return result;
}

/**
 * The signed-in user's own profile: coins, XP, avatar and preferences. Asked on
 * page load, it also says whether the cookies hold a session.
 */
export async function getCurrentUser(
  options: RequestOptions = {},
): Promise<ApiResult<CurrentUserResponse["data"]>> {
  const result = await authenticatedFetch(
    ENDPOINTS.currentUser,
    currentUserResponseSchema.shape.data,
    { signal: options.signal },
  );
  // Only the first answer decides; a logout while it ran keeps the user out.
  if (result.success && getSignedIn() === null) setSignedIn(true);
  return result;
}

/** Gives up waiting on the server, so signing out never hangs on the network. */
const LOGOUT_TIMEOUT_MS = 8_000;

/**
 * Signs this device out: the server ends its session and clears both cookies.
 * An expired access token is refreshed first, so the session really ends. The
 * page signs out even when the server can't be reached, but then the cookies
 * stay, and the next page load is signed in again.
 */
export async function logout(): Promise<void> {
  try {
    await authenticatedFetch(
      ENDPOINTS.logout,
      logoutResponseSchema.shape.data,
      {
        method: "POST",
        signal: AbortSignal.timeout(LOGOUT_TIMEOUT_MS),
      },
    );
  } catch {
    // Offline, timed out or an unreadable answer: sign out locally anyway.
  }
  setSignedIn(false);
}
