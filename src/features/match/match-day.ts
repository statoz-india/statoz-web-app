import { useSyncExternalStore } from "react";

import { loadedKeys, peekResource } from "@/hooks/useResource";
import { toISTDate, type TrendingMatches } from "@/core";
import type { TournamentSection } from "@/core/domain/types/game-types";

/**
 * Which day's fixture list a match is on.
 *
 * A match's address is its readable id alone, and the API can only list
 * matches a day at a time, so the page has to know the day from somewhere
 * else. It is read, in order, from the lists the visitor has already loaded,
 * from the trending list, and from what this browser remembers of matches it
 * has opened before.
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

/** The day of a start time in India, or nothing when the time is unusable. */
function dayOf(time: string | undefined): string | undefined {
  const date = time ? new Date(time) : null;
  return date && !Number.isNaN(date.getTime()) ? toISTDate(date) : undefined;
}

/** The day a loaded fixture list has this match on, if any does. */
export function loadedMatchDay(matchId: string): string | null {
  for (const key of loadedKeys("matches/")) {
    const sections = peekResource<TournamentSection[]>(key) ?? [];
    const listed = sections.some((section) =>
      (section.matches ?? []).some((match) => match.matchId === matchId),
    );
    // The key is `matches/<sport>/<day>`.
    if (listed) return key.split("/")[2] ?? null;
  }
  return null;
}

function knownMatchDay(matchId: string): string | null {
  const loaded = loadedMatchDay(matchId);
  if (loaded) return loaded;

  // A trending tile names its match and when it starts, and a match is listed
  // on the day it starts.
  const trending = peekResource<TrendingMatches>("trending/matches");
  for (const item of trending?.items ?? []) {
    if (!("matchId" in item.data) || item.data.matchId !== matchId) continue;
    const day = dayOf(item.data.matchStartTime);
    if (day) return day;
  }

  return remembered()[matchId] ?? null;
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
