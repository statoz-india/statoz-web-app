import { z } from "zod";

import {
  loginResponseSchema,
  sendOtpResponseSchema,
  type ApiResult,
  type LoginResponse,
  type SendOtpResponse,
} from "@/core/models";

import {
  setAccessToken,
  unauthenticatedFetch,
  type RequestOptions,
} from "./client";
import { ENDPOINTS } from "./endpoints";

/**
 * Email OTP login: `sendOtp` mails a code, and `login` trades it for an access
 * token, which `authenticatedFetch` then sends on every call. Both resolve to
 * the API's response; check `success` before reading `data`.
 */

function postJson<T>(
  path: string,
  body: unknown,
  schema: z.ZodType<T>,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  return unauthenticatedFetch(path, schema, {
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

/**
 * Logs in with the code from `sendOtp`. On success the access token is kept
 * for `authenticatedFetch`.
 */
export async function login(
  email: string,
  otp: string,
  options?: RequestOptions,
): Promise<ApiResult<LoginResponse["data"]>> {
  const result = await postJson(
    ENDPOINTS.login,
    { email, otp },
    loginResponseSchema.shape.data,
    options,
  );
  if (result.success) setAccessToken(result.data.accessToken);
  return result;
}

/** Forgets the access token, so authenticated calls stop working. */
export function logout() {
  setAccessToken(null);
}
