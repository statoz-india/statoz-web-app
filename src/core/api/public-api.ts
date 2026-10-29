import type { Sport } from "@/config/sports";
import {
  listOf,
  matchForSchema,
  matchSportsTypesResponseSchema,
  matchStatsSchema,
  motorSportMatchesSchema,
  raceStatsSchema,
  sportsTypesResponseSchema,
  tournamentSectionSchema,
  trendingMatchesSchema,
  type MatchFor,
  type MatchSportsType,
  type MatchStats,
  type MotorSportMatches,
  type RaceStats,
  type SportsType,
  type TournamentSection,
  type TrendingMatches,
} from "@/core/models";

import { publicGet, type RequestOptions } from "./client";
import { ENDPOINTS } from "./endpoints";

/**
 * Every call to the public API, each with the schema its data is checked
 * against. Nothing else in the app calls `publicGet`; screens ask for data
 * through `resources.ts`.
 */

/**
 * One sport's fixtures for a day, grouped by tournament and already in display
 * order. A day with nothing on it resolves to `[]`.
 */
export function getMatches<G extends Sport>(
  gameType: G,
  istDate: string,
  options?: RequestOptions,
): Promise<TournamentSection<MatchFor<G>>[]> {
  return publicGet(
    ENDPOINTS.matches(gameType, istDate),
    listOf(tournamentSectionSchema(matchForSchema(gameType))),
    { ...options, emptyOn404: [] },
  );
}

/**
 * The day's races as a flat list, ordered by start time. Use
 * `getMatches("racing", …)` to get them in tournament sections instead.
 */
export function getRaces(
  istDate: string,
  options?: RequestOptions,
): Promise<MotorSportMatches[]> {
  return publicGet(
    ENDPOINTS.races(istDate),
    listOf(motorSportMatchesSchema),
    { ...options, emptyOn404: [] },
  );
}

/** The curated trending list, plus counts. `items` is `[]` when nothing is trending. */
export function getTrendingMatches(
  options?: RequestOptions,
): Promise<TrendingMatches> {
  return publicGet(ENDPOINTS.trendingMatches, trendingMatchesSchema, options);
}

/** The sports that have fixtures, in the order the home screen shows them. */
export function getMatchSportsTypes(
  options?: RequestOptions,
): Promise<MatchSportsType[]> {
  return publicGet(
    ENDPOINTS.matchSportsType,
    matchSportsTypesResponseSchema.shape.data,
    options,
  );
}

/** Every sport the API covers. */
export function getSportsTypes(
  options?: RequestOptions,
): Promise<SportsType[]> {
  return publicGet(
    ENDPOINTS.sportsType,
    sportsTypesResponseSchema.shape.data,
    options,
  );
}

/**
 * The stats for a football, cricket or basketball match, or `null` while the
 * server has none, which is usual before a match starts.
 *
 * `matchObjectId` is the match's 24-character `_id`. Its readable `matchId`,
 * such as "IPL-M12", is rejected with a 400.
 *
 * A response is 30 to 50 KB, so ask when a match is opened, never for every
 * card in a list. The server does not refresh the stats when asked; while a
 * match is live, poll no faster than every 30 seconds and stop once
 * `matchSummary.matchDetails.completed` is true.
 */
export function getMatchStats(
  matchObjectId: string,
  options?: RequestOptions,
): Promise<MatchStats | null> {
  return publicGet(
    ENDPOINTS.matchStats(matchObjectId),
    matchStatsSchema.nullable(),
    { ...options, emptyOn404: null },
  );
}

/**
 * The stats for an F1 race, or `null` when the server has none yet or does not
 * know the race. `raceId` is the race's `_id` or its readable `matchId`, such
 * as "F1-R18"; the readable one is not case-sensitive.
 *
 * The same advice on size and polling applies as for a match. A race is over
 * once `matchSummary.completed` is true.
 */
export function getRaceStats(
  raceId: string,
  options?: RequestOptions,
): Promise<RaceStats | null> {
  return publicGet(
    ENDPOINTS.raceStats(raceId),
    raceStatsSchema.nullable(),
    { ...options, emptyOn404: null },
  );
}
