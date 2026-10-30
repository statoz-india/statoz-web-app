import { useSyncExternalStore } from "react";

import { dayOfMatchesKey, MATCHES_KEY_PREFIX } from "@/core";
import type { TournamentSection } from "@/core/models";
import { loadedKeys, peekResource } from "@/hooks/useResource";

/**
 * Which day's fixture list a match is on.
 *
 * A match's address is its readable id alone, and the API can only list
 * matches a day at a time, so the page has to know the day from somewhere
 * else. It is read from the lists the visitor has already loaded, or from what
 * this browser remembers of matches it has opened before.
 */

const STORAGE_KEY = "statoz:match-days";

/** How many matches a browser remembers the day of. */
const REMEMBERED = 200;

function remembered(): Record<string, string> {
  try {
    const stored: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "{}",
    );
    return typeof stored === "object" && stored !== null
      ? (stored as Record<string, string>)
      : {};
  } catch {
    // Storage can be blocked, or hold something that is not ours.
    return {};
  }
}

/** Keeps a match's day, so its page still opens after a reload. */
export function rememberMatchDay(matchId: string, day: string) {
  try {
    const days = remembered();
    if (days[matchId] === day) return;
    delete days[matchId];
    const kept = Object.entries(days).slice(-(REMEMBERED - 1));
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Object.fromEntries([...kept, [matchId, day]])),
    );
  } catch {
    // Without storage the page still works; it only forgets on reload.
  }
}

/** The day a loaded fixture list has this match on, if any does. */
export function loadedMatchDay(matchId: string): string | null {
  for (const key of loadedKeys(MATCHES_KEY_PREFIX)) {
    const sections = peekResource<TournamentSection[]>(key) ?? [];
    const listed = sections.some((section) =>
      (section.matches ?? []).some((match) => match.matchId === matchId),
    );
    if (listed) return dayOfMatchesKey(key);
  }
  return null;
}

function knownMatchDay(matchId: string): string | null {
  return loadedMatchDay(matchId) ?? remembered()[matchId] ?? null;
}

const subscribe = () => () => {};
const getServerSnapshot = () => null;

/**
 * The day this match is listed on, or `null` when nothing here knows it, and
 * always `null` until the component has hydrated.
 */
export function useKnownMatchDay(matchId: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => knownMatchDay(matchId),
    getServerSnapshot,
  );
}

/** A day some days before or after another, both as YYYY-MM-DD. */
export function shiftDay(day: string, offset: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}
