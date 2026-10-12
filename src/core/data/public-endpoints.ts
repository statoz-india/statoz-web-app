import { publicGet, type RequestOptions } from "@/core/client";
import type {
  GameSection,
  SportTab,
} from "@/core/domain/models/public/game-model";
import type {
  MatchFor,
  MotorSportMatches,
} from "@/core/domain/models/public/match-model";
import type {
  MatchStats,
  RaceStats,
} from "@/core/domain/models/public/stats-model";
import type { TrendingMatches } from "@/core/domain/models/public/trending-model";
import { MatchGameType, TournamentSection } from "@/core/domain/types/game-types";

const istDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });

/**
 * A match day as the day endpoints expect it: YYYY-MM-DD in India time. That
 * is not the UTC date between midnight and 05:30 IST, nor the device's date.
 */
export function toISTDate(date: Date): string {
  return istDay.format(date);
}

export function todayInIST(): string {
  return toISTDate(new Date());
}

/**
 * One sport's fixtures for a day, grouped by tournament and already in display
 * order. A day with nothing on it resolves to `[]`.
 */
export function getMatches<G extends MatchGameType>(
  gameType: G,
  istDate: string,
  options?: RequestOptions,
): Promise<TournamentSection<MatchFor<G>>[]> {
  return publicGet<TournamentSection<MatchFor<G>>[]>(
    `/matches/${gameType}/${encodeURIComponent(istDate)}`,
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
  return publicGet<MotorSportMatches[]>(
    `/motorsport/matchesForDate/${encodeURIComponent(istDate)}`,
    { ...options, emptyOn404: [] },
  );
}

/** The curated trending list, plus counts. `items` is `[]` when nothing is trending. */
export function getTrendingMatches(
  options?: RequestOptions,
): Promise<TrendingMatches> {
  return publicGet<TrendingMatches>("/trending/matches", options);
}

/** The curated trending mini-games, one section per sport in a fixed order. */
export function getTrendingGames(
  options?: RequestOptions,
): Promise<GameSection[]> {
  return publicGet<GameSection[]>("/trending/games", options);
}

/** The sports list for the matches screen. */
export function getMatchSportTabs(
  options?: RequestOptions,
): Promise<SportTab[]> {
  return publicGet<SportTab[]>("/games", options);
}

/**
 * Every mini-game, one section per sport in a fixed order. Games with
 * `isLive: false` are included.
 */
export function getGames(options?: RequestOptions): Promise<GameSection[]> {
  return publicGet<GameSection[]>("/games/get-games", options);
}

/** The sports list for the games screen: the matches list plus tennis. */
export function getGameSportTabs(
  options?: RequestOptions,
): Promise<SportTab[]> {
  return publicGet<SportTab[]>("/games/gamesTab", options);
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
  return publicGet<MatchStats | null>(
    `/matchStats/${encodeURIComponent(matchObjectId)}`,
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
  return publicGet<RaceStats | null>(
    `/matchStats/f1/race/${encodeURIComponent(raceId)}`,
    { ...options, emptyOn404: null },
  );
}
