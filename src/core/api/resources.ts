import type { Sport } from "@/config/sports";

import {
  getMatches,
  getMatchSportsTypes,
  getMatchStats,
  getRaceStats,
  getSportsTypes,
  getTrendingMatches,
} from "./public-api";

/**
 * What the screens ask for: each read of the public API paired with the key
 * the browser store (`@/hooks/useResource`) keeps it under. Two screens that
 * ask for the same thing get the same key, so it is loaded once and shared.
 *
 * Feature folders take the data from here and shape it in their own adapters.
 */

/** Every fixture list's key starts with this. */
export const MATCHES_KEY_PREFIX = "matches/";

export const resources = {
  trendingMatches: () => ({
    key: "trending/matches",
    load: () => getTrendingMatches(),
  }),
  matchSportsTypes: () => ({
    key: "sports/matchSportsTypes",
    load: () => getMatchSportsTypes(),
  }),
  sportsTypes: () => ({
    key: "sports/sportsTypes",
    load: () => getSportsTypes(),
  }),
  /** One sport's fixture list for a day (YYYY-MM-DD in India time). */
  matches: <G extends Sport>(gameType: G, istDate: string) => ({
    key: `${MATCHES_KEY_PREFIX}${gameType}/${istDate}`,
    load: () => getMatches(gameType, istDate),
  }),
  /**
   * A team match's stats. It is kept under the readable `matchId`, but the
   * endpoint accepts only the database `_id`.
   */
  matchStats: (matchId: string, matchObjectId: string) => ({
    key: `matchStats/${matchId}`,
    load: () => getMatchStats(matchObjectId),
  }),
  /** A race's stats, kept and asked for by its readable `matchId`. */
  raceStats: (matchId: string) => ({
    key: `raceStats/${matchId}`,
    load: () => getRaceStats(matchId),
  }),
};

/** The day a fixture-list key is for, or `null` for any other key. */
export function dayOfMatchesKey(key: string): string | null {
  // The key is `matches/<sport>/<day>`.
  return key.startsWith(MATCHES_KEY_PREFIX)
    ? (key.split("/")[2] ?? null)
    : null;
}
