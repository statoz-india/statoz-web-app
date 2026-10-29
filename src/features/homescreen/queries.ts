import type { Sport } from "@/config/sports";
import { resources } from "@/core";
import { useResource, useResources } from "@/hooks/useResource";

import { toSportTabs } from "./adapters";

/**
 * The hub's reads of the public API. Each loads in the browser when the screen
 * that needs it opens, and is then shared by every component that asks for it.
 */

export function useTrendingMatches() {
  return useResource(resources.trendingMatches());
}

/** One resource per day, in the order of `days` (YYYY-MM-DD in India time). */
export function useDayFixtures(sport: Sport, days: string[]) {
  return useResources(days.map((day) => resources.matches(sport, day)));
}

/**
 * One sport's fixtures for a day each, in the order of `sports`. It shares its
 * keys with {@link useDayFixtures}, so a day loaded here is not loaded again.
 */
export function useFixturesBySport(sports: Sport[], day: string | null) {
  return useResources(
    day === null ? [] : sports.map((sport) => resources.matches(sport, day)),
  );
}

/**
 * The hub's tabs, from the match sports-types list. Until the list arrives
 * there are none.
 */
export function useMatchSports() {
  const list = useResource(resources.matchSportsTypes());
  return { ...list, tabs: list.data ? toSportTabs(list.data) : [] };
}
