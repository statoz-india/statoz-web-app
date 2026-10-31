import type { Sport } from "@/config/sports";
import {
  dataOrThrow,
  getMatches,
  MATCHES_KEY_PREFIX,
  resources,
  type MatchStats,
  type TournamentSection,
} from "@/core";
import { useResource, useResources } from "@/hooks/useResource";

import { isRace, type Fixture } from "./adapters";

/**
 * The match page's reads of the public API. Like the hub's, each loads in the
 * browser and is shared by every component that asks for it.
 */

/**
 * A match's stats, once its fixture is known. The data is `null` while the
 * match has none yet.
 *
 * The app knows a match by its readable `matchId`. A race's stats are asked
 * for by that id. A team match's endpoint accepts only the database id, so
 * that id is read off the fixture here, for this one call, and goes nowhere
 * else.
 */
export function useMatchStats(fixture: Fixture | undefined) {
  return useResource<MatchStats | null>(
    !fixture
      ? null
      : isRace(fixture)
        ? resources.raceStats(fixture.matchId)
        : resources.matchStats(fixture.matchId, fixture._id),
  );
}

/**
 * The fixture lists to look a match up in. The keys are the hub's own, so a
 * day the visitor has already browsed is not asked for again.
 */
export function useFixtureDays(requests: { sport: Sport; day: string }[]) {
  // Named here: it cannot be inferred through `map`.
  return useResources<TournamentSection[]>(
    requests.map(({ sport, day }) => ({
      key: `${MATCHES_KEY_PREFIX}${sport}/${day}`,
      // A day with nothing on it is a 404, read as an empty list.
      load: () => getMatches(sport, day).then((result) => dataOrThrow(result, [])),
    })),
  );
}
