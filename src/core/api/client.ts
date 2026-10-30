/**
 * The only place that calls `fetch` against the API. Endpoint paths are
 * absolute (`/api/v1/...`), so only the origin of `API_BASE_URL` is used.
 *
 * - `unauthenticatedFetch` sends the request exactly as the caller built it.
 * - `authenticatedFetch` adds the `Cookie: accessToken=...` header the
 *   backend reads to know who is calling.
 *
 * Both resolve to the body the API sent: `ApiSuccess`, `ApiError` or
 * `ApiErrorResponse`. Check `success` before reading `data`.
 */

import { z } from "zod";

import { API_BASE_URL } from "@/core/env";
import {
  apiErrorResponseSchema,
  apiErrorSchema,
  apiSuccessSchema,
  type ApiResult,
} from "@/core/models";

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
 * The access token from the last login. It lives in memory only, so a reload
 * logs the visitor out. `auth.ts` sets it; nothing else should.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

function urlFor(path: string): URL {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }
  return new URL(path, API_BASE_URL);
}

async function send<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  const res = await fetch(urlFor(path), init);
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

/** Calls the endpoint with exactly the request the caller built. */
export function unauthenticatedFetch<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  return send(path, schema, init);
}

/**
 * Calls the endpoint as the logged-in user, by sending the access token as a
 * cookie. Browsers drop a hand-set `Cookie` header, so this only reaches the
 * backend from server code (Server Components, route handlers).
 *
 * Before anyone has logged in it answers the way the backend does for a
 * missing token, without making the call.
 */
export async function authenticatedFetch<T>(
  path: string,
  schema: z.ZodType<T>,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  if (!accessToken) {
    return { statusCode: 401, success: false, message: "Unauthorized request" };
  }
  const headers = new Headers(init.headers);
  headers.set("Cookie", `accessToken=${accessToken}`);
  return send(path, schema, { ...init, headers });
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
