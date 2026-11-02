import type { Sport } from "@/config/sports";
import {
  eventSchema,
  listOf,
  matchForSchema,
  matchSportsTypesResponseSchema,
  matchStatsSchema,
  motorSportMatchesSchema,
  predictionSchema,
  quizSchema,
  raceStatsSchema,
  sportLeaderboardSchema,
  sportsTypesResponseSchema,
  tournamentSectionSchema,
  type ApiResult,
  type Event,
  trendingResponseSchema,
  type MatchFor,
  type MatchSportsType,
  type MatchStats,
  type MotorSportMatches,
  type Prediction,
  type Quiz,
  type RaceStats,
  type SportLeaderboard,
  type SportsType,
  type TournamentSection,
  type Trending,
} from "@/core/models";

import { unauthenticatedFetch, type RequestOptions } from "./client";
import { ENDPOINTS } from "./endpoints";

/**
 * Every call to the public API, each with the schema its data is checked
 * against. Each resolves to the API's response as it was sent; screens ask
 * for data through `resources.ts`, which unwraps it.
 */

/**
 * One sport's fixtures for a day, grouped by tournament and already in display
 * order. A day with nothing on it is a 404.
 */
export function getMatches<G extends Sport>(
  gameType: G,
  istDate: string,
  options?: RequestOptions,
): Promise<ApiResult<TournamentSection<MatchFor<G>>[]>> {
  return unauthenticatedFetch(
    ENDPOINTS.matches(gameType, istDate),
    listOf(tournamentSectionSchema(matchForSchema(gameType))),
    options,
  );
}

/**
 * The day's races as a flat list, ordered by start time. Use
 * `getMatches("racing", …)` to get them in tournament sections instead.
 */
export function getRaces(
  istDate: string,
  options?: RequestOptions,
): Promise<ApiResult<MotorSportMatches[]>> {
  return unauthenticatedFetch(
    ENDPOINTS.races(istDate),
    listOf(motorSportMatchesSchema),
    options,
  );
}

/** What is trending, one list per kind: picks, fixtures, races, futures, quizzes and events. */
export function getTrendingMatches(
  options?: RequestOptions,
): Promise<ApiResult<Trending>> {
  return unauthenticatedFetch(
    ENDPOINTS.trendingMatches,
    trendingResponseSchema.shape.data,
    options,
  );
}

/** The sports that have fixtures, in the order the home screen shows them. */
export function getMatchSportsTypes(
  options?: RequestOptions,
): Promise<ApiResult<MatchSportsType[]>> {
  return unauthenticatedFetch(
    ENDPOINTS.matchSportsType,
    matchSportsTypesResponseSchema.shape.data,
    options,
  );
}

/**
 * A match's quizzes, without their questions; those need a login. `matchId` is
 * the readable one, such as "EPL-M23".
 */
export function getMatchQuizzes(
  matchId: string,
  options?: RequestOptions,
): Promise<ApiResult<Quiz[]>> {
  return unauthenticatedFetch(
    ENDPOINTS.matchQuizzes(matchId),
    listOf(quizSchema),
    options,
  );
}

/**
 * A match's predictions (pick markets), with the coins and odds on each side.
 * `matchId` is the readable one, such as "EPL-M23".
 */
export function getMatchPredictions(
  matchId: string,
  options?: RequestOptions,
): Promise<ApiResult<Prediction[]>> {
  return unauthenticatedFetch(
    ENDPOINTS.matchPredictions(matchId),
    listOf(predictionSchema),
    options,
  );
}

/**
 * A match's events: yes/no (or yes/no/maybe) questions with the coins and
 * odds on each option. `matchId` is the readable one, such as "EPL-M23".
 */
export function getMatchEvents(
  matchId: string,
  options?: RequestOptions,
): Promise<ApiResult<Event[]>> {
  return unauthenticatedFetch(
    ENDPOINTS.matchEvents(matchId),
    listOf(eventSchema),
    options,
  );
}

/** A sport's leaderboard, best first, by its `gameType` such as "football". */
export function getSportsLeaderboard(
  gameType: string,
  options?: RequestOptions,
): Promise<ApiResult<SportLeaderboard>> {
  return unauthenticatedFetch(
    ENDPOINTS.sportsLeaderboard(gameType),
    sportLeaderboardSchema,
    options,
  );
}

/** Every sport the API covers. */
export function getSportsTypes(
  options?: RequestOptions,
): Promise<ApiResult<SportsType[]>> {
  return unauthenticatedFetch(
    ENDPOINTS.sportsType,
    sportsTypesResponseSchema.shape.data,
    options,
  );
}

/**
 * The stats for a football, cricket or basketball match. While the server has
 * none, which is usual before a match starts, it answers 404.
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
): Promise<ApiResult<MatchStats | null>> {
  return unauthenticatedFetch(
    ENDPOINTS.matchStats(matchObjectId),
    matchStatsSchema.nullable(),
    options,
  );
}

/**
 * The stats for an F1 race. It answers 404 when the server has none yet or
 * does not know the race. `raceId` is the race's `_id` or its readable `matchId`, such
 * as "F1-R18"; the readable one is not case-sensitive.
 *
 * The same advice on size and polling applies as for a match. A race is over
 * once `matchSummary.completed` is true.
 */
export function getRaceStats(
  raceId: string,
  options?: RequestOptions,
): Promise<ApiResult<RaceStats | null>> {
  return unauthenticatedFetch(
    ENDPOINTS.raceStats(raceId),
    raceStatsSchema.nullable(),
    options,
  );
}
