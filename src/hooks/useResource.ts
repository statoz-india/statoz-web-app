import { useEffect, useEffectEvent, useSyncExternalStore } from "react";

import { RateLimitedError } from "@/core/api";

/**
 * A small in-memory store for data the browser fetches. Each key is loaded
 * once and kept for the life of the page, so leaving a screen and coming back
 * does not ask the server again.
 *
 * It only ever fills in the browser: loading starts in an effect, and effects
 * do not run on the server.
 */

/**
 * How long a loaded value is reused before a screen that opens refetches it.
 * The public API asks callers not to poll faster than every 30 seconds.
 */
const FRESH_MS = 30_000;

type Entry = {
  status: "loading" | "ready" | "error";
  data?: unknown;
  error?: unknown;
  /** When the value arrived. Zero until the first one does. */
  loadedAt: number;
  /** After a failure, the earliest time a screen opening may try again. */
  retryAt: number;
  pending: boolean;
};

const entries = new Map<string, Entry>();
const listeners = new Set<() => void>();
let version = 0;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getVersion = () => version;
const getServerVersion = () => 0;

function write(key: string, entry: Entry) {
  entries.set(key, entry);
  version += 1;
  for (const listener of listeners) listener();
}

/** A rate-limited call names its own wait; anything else waits one window. */
function retryDelay(error: unknown): number {
  return error instanceof RateLimitedError
    ? error.retryAfterSeconds * 1000
    : FRESH_MS;
}

function load(key: string, loader: () => Promise<unknown>, force: boolean) {
  const current = entries.get(key);
  if (current?.pending) return;
  if (!force && current) {
    const now = Date.now();
    if (current.status === "ready" && now - current.loadedAt < FRESH_MS) return;
    if (current.status === "error" && now < current.retryAt) return;
  }

  // A value that is already on screen stays there while it is refreshed.
  const data = current?.data;
  const loadedAt = current?.loadedAt ?? 0;
  write(key, {
    status: data === undefined ? "loading" : "ready",
    data,
    loadedAt,
    retryAt: 0,
    pending: true,
  });

  loader().then(
    (next) => {
      write(key, {
        status: "ready",
        data: next,
        loadedAt: Date.now(),
        retryAt: 0,
        pending: false,
      });
    },
    (error: unknown) => {
      write(key, {
        status: "error",
        data,
        error,
        loadedAt,
        retryAt: Date.now() + retryDelay(error),
        pending: false,
      });
    },
  );
}

export type Resource<T> = {
  status: "loading" | "ready" | "error";
  /** The last value that loaded. It is kept while reloading and after a failure. */
  data: T | undefined;
  error: unknown;
};

export type ResourceRequest<T> = {
  /** Identifies the data. Two requests with one key share one load. */
  key: string;
  load: () => Promise<T>;
};

const LOADING: Resource<never> = {
  status: "loading",
  data: undefined,
  error: undefined,
};

function read<T>(key: string): Resource<T> {
  const entry = entries.get(key);
  if (!entry) return LOADING;
  return {
    status: entry.status,
    data: entry.data as T | undefined,
    error: entry.error,
  };
}

/** The value a key holds right now, without asking for it. */
export function peekResource<T>(key: string): T | undefined {
  return entries.get(key)?.data as T | undefined;
}

/** The keys that hold a value and start with `prefix`. */
export function loadedKeys(prefix: string): string[] {
  return [...entries.keys()].filter(
    (key) => key.startsWith(prefix) && entries.get(key)?.data !== undefined,
  );
}

/**
 * Loads every request when the component mounts or the keys change, and
 * returns one resource per request, in order. `reload` retries the ones that
 * failed; nothing retries on its own.
 */
export function useResources<T>(requests: ResourceRequest<T>[]): {
  resources: Resource<T>[];
  reload: () => void;
} {
  useSyncExternalStore(subscribe, getVersion, getServerVersion);

  const loadAll = useEffectEvent(() => {
    for (const request of requests) load(request.key, request.load, false);
  });
  const keys = requests.map((request) => request.key).join("\n");
  useEffect(() => {
    loadAll();
  }, [keys]);

  return {
    resources: requests.map((request) => read<T>(request.key)),
    reload: () => {
      for (const request of requests) {
        if (entries.get(request.key)?.status === "error") {
          load(request.key, request.load, true);
        }
      }
    },
  };
}

/**
 * One request, usually from `resources` in `@/core/api`. A null request asks
 * for nothing yet, and reads as still loading.
 */
export function useResource<T>(
  request: ResourceRequest<T> | null,
): Resource<T> & { reload: () => void; refresh: () => void } {
  const { resources, reload } = useResources(request === null ? [] : [request]);
  return {
    ...(resources[0] ?? (LOADING as Resource<T>)),
    reload,
    /** Fetches again if the value is older than the freshness window. */
    refresh: () => {
      if (request !== null) load(request.key, request.load, false);
    },
  };
}
