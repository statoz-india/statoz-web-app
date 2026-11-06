/**
 * The only place that calls `fetch` against the API. Endpoint paths are
 * absolute (`/api/v1/...`) and called on this site's own origin; the server
 * forwards them to the backend (the rewrite in `next.config.ts`).
 *
 * - `unauthenticatedFetch` sends the request exactly as the caller built it.
 * - `authenticatedFetch` adds the `Authorization: Bearer ...` header the
 *   backend reads to know who is calling.
 *
 * Both resolve to the body the API sent: `ApiSuccess`, `ApiError` or
 * `ApiErrorResponse`. Check `success` before reading `data`.
 */

import { z } from "zod";

import {
  apiErrorResponseSchema,
  apiErrorSchema,
  apiSuccessSchema,
  refreshTokenResponseSchema,
  type ApiResult,
} from "@/core/models";

import { ENDPOINTS } from "./endpoints";

const RATE_LIMIT_WINDOW_SECONDS = 60;

const DEFAULT_ERROR_MESSAGE = "Something went wrong";

export type RequestOptions = {
  signal?: AbortSignal;
};

/**
 * The shared request budget is spent. Keep showing what is already on screen
 * and try once more after `retryAfterSeconds`; do not retry in a loop.
 */
export class RateLimitedError extends Error {
  readonly retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds = RATE_LIMIT_WINDOW_SECONDS) {
    super(message);
    this.name = "RateLimitedError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * The call worked, but its data is not the shape the app expects. The backend
 * has changed, or the model is wrong; `issues` says which field.
 */
export class InvalidResponseError extends Error {
  readonly issues: z.ZodError["issues"];

  constructor(path: string, status: number, error: z.ZodError) {
    super(
      `API ${path} answered ${status} with data the app cannot read:\n${z.prettifyError(error)}`,
    );
    this.name = "InvalidResponseError";
    this.issues = error.issues;
  }
}

/*
 * The tokens live in the API's httpOnly cookies, which JavaScript can't read,
 * so this only follows what the API says: `null` until it has answered.
 * `auth.ts` and the calls below set it; nothing else should.
 */
let signedIn: boolean | null = null;
const sessionListeners = new Set<() => void>();

export function setSignedIn(value: boolean) {
  signedIn = value;
  for (const listener of sessionListeners) listener();
}

export function getSignedIn(): boolean | null {
  return signedIn;
}

/** Calls `listener` whenever the session starts or ends. Returns the unsubscribe. */
export function subscribeSession(listener: () => void): () => void {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}

async function send<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  const res = await fetch(path, init);
  const text = await res.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    // A 429 is plain text worth showing; an unknown route is an HTML page.
    const isHtml = res.headers.get("Content-Type")?.includes("text/html");
    return {
      statusCode: res.status,
      success: false,
      message: !isHtml && text ? text : DEFAULT_ERROR_MESSAGE,
    };
  }

  const parsed = res.ok
    ? apiSuccessSchema(schema).safeParse(body)
    : typeof body === "object" && body !== null && "data" in body
      ? apiErrorResponseSchema.safeParse(body)
      : apiErrorSchema.safeParse(body);
  if (!parsed.success) {
    throw new InvalidResponseError(path, res.status, parsed.error);
  }
  return parsed.data as ApiResult<T>;
}

/**
 * Calls the endpoint without the session cookies, so it also works with an API
 * that answers `*` for CORS.
 */
export function unauthenticatedFetch<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  return send(path, schema, { ...init, credentials: "omit" });
}

/** Only a 401 means the login is over; anything else keeps the tokens. */
type RefreshOutcome = "refreshed" | "signedOut" | "temporaryFailure";

const REFRESH_TIMEOUT_MS = 10_000;

let refreshing: Promise<RefreshOutcome> | null = null;

/** One refresh at a time; calls that need one while it runs share its outcome. */
function refreshTokens(): Promise<RefreshOutcome> {
  refreshing ??= runRefresh().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function runRefresh(): Promise<RefreshOutcome> {
  try {
    // No body: the API reads the refresh token from its cookie and sets both again.
    const result = await authenticatedFetch(
      ENDPOINTS.refreshToken,
      refreshTokenResponseSchema.shape.data,
      { method: "POST", signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS) },
    );
    if (result.success) return "refreshed";
    // A 401 has already ended the session; there is nothing to log out of.
    return result.statusCode === 401 ? "signedOut" : "temporaryFailure";
  } catch {
    // Offline or timed out: the player stays signed in.
    return "temporaryFailure";
  }
}

/** The status the backend reserves for an expired access token. */
const TOKEN_EXPIRED = 498;

/**
 * Calls the endpoint with the session cookies, which say who is calling, and
 * lets the response set them (login, refresh). An expired token is refreshed
 * and the call retried once.
 */
export async function authenticatedFetch<T>(
  path: string,
  schema: z.ZodType<T>,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  const withCookies: RequestInit = { ...init, credentials: "include" };
  let result = await send(path, schema, withCookies);
  if (
    result.statusCode === TOKEN_EXPIRED &&
    // The refresh call itself never refreshes, so it can't wait on itself.
    path !== ENDPOINTS.refreshToken &&
    (await refreshTokens()) === "refreshed"
  ) {
    result = await send(path, schema, withCookies);
  }
  // No cookie, or one the API no longer accepts.
  if (result.statusCode === 401) setSignedIn(false);
  return result;
}

/**
 * A result's `data`, or a thrown error, for the resource store: it shows a
 * screen's error state when its load rejects.
 *
 * `emptyOn404` is returned instead when the backend answers 404, which the day
 * endpoints do for an empty day and the stats endpoints do while there are no
 * stats yet.
 */
export function dataOrThrow<T>(result: ApiResult<T>, emptyOn404?: T): T {
  if (result.success) return result.data;

  if (result.statusCode === 429) {
    throw new RateLimitedError(result.message);
  }
  // The backend's own 404s carry `data` or `errors`. An unknown route is an
  // HTML page with neither, and is a missing endpoint, not an empty day.
  const fromBackend = "data" in result || "errors" in result;
  if (result.statusCode === 404 && fromBackend && emptyOn404 !== undefined) {
    return emptyOn404;
  }
  throw new Error(result.message);
}
