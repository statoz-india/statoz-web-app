/**
 * Client for the login-free, read-only endpoints under /api/v1/public-api
 * (docs/sportsSectionBackend.md and docs/stats.md). It runs in the browser and
 * on the server.
 * `API_BASE_URL` already ends in /api/v1, so only the last segment is added.
 *
 * Every caller behind one IP shares a budget of 60 requests a minute across
 * all of these endpoints, and each response is cached for 15 seconds. So load
 * an endpoint once when its screen opens, and never poll faster than every 30
 * seconds.
 */

import { z } from "zod";

import { API_BASE_URL } from "@/core/env";

const PUBLIC_API_PATH = "/public-api";

/** The rate limit's window, used when the server's Retry-After is unreadable. */
const RATE_LIMIT_WINDOW_SECONDS = 60;

/** The wrapper every JSON response from the API uses. */
type Envelope = {
  statusCode: number;
  data: unknown;
  message: string;
  success: boolean;
};

export type RequestOptions = {
  signal?: AbortSignal;
};

type PublicGetOptions<T> = RequestOptions & {
  /**
   * Returned when the server answers 404, which the day endpoints do for an
   * empty day and the stats endpoints do while there are no stats yet.
   */
  emptyOn404?: T;
};

/**
 * The shared request budget is spent. Keep showing what is already on screen
 * and try once more after `retryAfterSeconds`; do not retry in a loop.
 */
export class RateLimitedError extends Error {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super("Too many requests, please try again later.");
    this.name = "RateLimitedError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/** Any other failed call: an error envelope, or a body that is not one. */
export class PublicApiError extends Error {
  readonly status: number;
  /** The envelope's `data`, which holds the detail on a 400. */
  readonly data: unknown;

  constructor(message: string, status: number, data: unknown = null) {
    super(message);
    this.name = "PublicApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * The call worked, but its data is not the shape the app expects. The backend
 * has changed, or the model in `@/core/models` is wrong; `issues` says which
 * field.
 */
export class InvalidResponseError extends PublicApiError {
  readonly issues: z.ZodError["issues"];

  constructor(path: string, status: number, error: z.ZodError) {
    super(
      `Public API ${path} answered with data the app cannot read:\n${z.prettifyError(error)}`,
      status,
    );
    this.name = "InvalidResponseError";
    this.issues = error.issues;
  }
}

function isEnvelope(body: unknown): body is Envelope {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof (body as Envelope).success === "boolean"
  );
}

/**
 * Calls one endpoint and checks its data against `schema`, so a response the
 * app cannot read fails here, by name, instead of deep inside a screen.
 */
export async function publicGet<T>(
  path: string,
  schema: z.ZodType<T>,
  options: PublicGetOptions<T> = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }

  // A bare GET. The API ignores a token, and a custom header would add a CORS
  // preflight to every call.
  const res = await fetch(`${API_BASE_URL}${PUBLIC_API_PATH}${path}`, {
    credentials: "omit",
    signal: options.signal,
  });

  // A 429 body is plain text, so it must not reach the JSON parse below.
  // Retry-After is readable on the server but not from another origin.
  if (res.status === 429) {
    throw new RateLimitedError(
      Number(res.headers.get("Retry-After")) || RATE_LIMIT_WINDOW_SECONDS,
    );
  }

  const body: unknown = await res.json().catch(() => null);

  // A 404 without the envelope is a route this environment does not have yet,
  // not an empty day, so it falls through to the error here.
  if (!isEnvelope(body)) {
    throw new PublicApiError(
      `Public API answered ${res.status} without its JSON envelope`,
      res.status,
    );
  }

  if (res.status === 404 && options.emptyOn404 !== undefined) {
    return options.emptyOn404;
  }
  if (!body.success) {
    throw new PublicApiError(body.message, res.status, body.data);
  }

  const parsed = schema.safeParse(body.data);
  if (!parsed.success) {
    throw new InvalidResponseError(path, res.status, parsed.error);
  }
  return parsed.data;
}
