import { isMatchSport, type MatchSport, type Sport } from "@/config/sports";
import { resources } from "@/core";
import { useResource, useResources } from "@/hooks/useResource";

import { hasTrending, toSports } from "./adapters";

/**
 * The hub's reads of the public API. Each loads in the browser when the screen
 * that needs it opens, and is then shared by every component that asks for it.
 */

export function useTrendingMatches() {
  return useResource(resources.trendingMatches());
}

export function useTrendingGames() {
  return useResource(resources.trendingGames());
}

export function useAllGames() {
  return useResource(resources.games());
}

/** One resource per day, in the order of `days` (YYYY-MM-DD in India time). */
export function useDayFixtures(sport: MatchSport, days: string[]) {
  return useResources(days.map((day) => resources.matches(sport, day)));
}

/**
 * One sport's fixtures for a day each, in the order of `sports`. It shares its
 * keys with {@link useDayFixtures}, so a day loaded here is not loaded again.
 */
export function useFixturesBySport(sports: MatchSport[], day: string | null) {
  return useResources(
    day === null ? [] : sports.map((sport) => resources.matches(sport, day)),
  );
}

/**
 * What a browse strip offers: the sports the API lists, in its order, and
 * whether it lists Trending. Nothing is offered that the API did not send, so
 * until the list arrives the strip holds Trending alone.
 */
export type SportsList<TSport extends Sport = Sport> = {
  trending: boolean;
  sports: TSport[];
};

/** The sports the MATCH tab offers. */
export function useMatchSports(): SportsList<MatchSport> {
  const { data } = useResource(resources.matchSportTabs());
  return data
    ? { trending: hasTrending(data), sports: toSports(data).filter(isMatchSport) }
    : { trending: true, sports: [] };
}

/** The sports the GAMES tab offers. */
export function useGameSports(): SportsList {
  const { data } = useResource(resources.gameSportTabs());
  return data
    ? { trending: hasTrending(data), sports: toSports(data) }
    : { trending: true, sports: [] };
}
