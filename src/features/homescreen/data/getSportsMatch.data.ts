import type { Sport } from "@/config/sports";
import {
  dataOrThrow,
  getMatches,
  MATCHES_KEY_PREFIX,
  type MatchFor,
  type TournamentSection,
} from "@/core";
import { useResource, useResources } from "@/hooks/useResource";

/** One day's fixture list. Shared by the hooks below, so a day loads once. */
function dayRequest<G extends Sport>(gameType: G, istDate: string) {
  return {
    key: `${MATCHES_KEY_PREFIX}${gameType}/${istDate}`,
    load: () =>
      getMatches(gameType, istDate).then((result) => dataOrThrow(result, [])),
  };
}

/**
 * One sport's fixtures for a day (YYYY-MM-DD in India time), grouped by
 * tournament. A day with nothing on it is `[]`. The key matches the other
 * fixture lists', so a day already loaded is not asked for again.
 */
export function useSportsMatches<G extends Sport>(
  gameType: G,
  istDate: string,
) {
  return useResource(dayRequest(gameType, istDate));
}

/** One sport's fixtures for each of several days, in the order of `istDates`. */
export function useSportsMatchesByDays<G extends Sport>(
  gameType: G,
  istDates: string[],
) {
  // Named here: it cannot be inferred through `map`.
  return useResources<TournamentSection<MatchFor<G>>[]>(
    istDates.map((istDate) => dayRequest(gameType, istDate)),
  );
}
