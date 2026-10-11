import type { MatchSport } from "@/config/sports";
import { useResource, useResources } from "@/hooks/useResource";
import {
  getMatches,
  getMatchStats,
  getRaceStats,
  type MatchStats,
} from "@/lib";

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
    fixture ? `matchStats/${fixture.matchId}` : null,
    () =>
      fixture && isRace(fixture)
        ? getRaceStats(fixture.matchId)
        : getMatchStats(fixture?._id ?? ""),
  );
}

/**
 * The fixture lists to look a match up in. The keys are the hub's own, so a
 * day the visitor has already browsed is not asked for again.
 */
export function useFixtureDays(requests: { sport: MatchSport; day: string }[]) {
  return useResources(
    requests.map(({ sport, day }) => ({
      key: `matches/${sport}/${day}`,
      load: () => getMatches(sport, day),
    })),
  );
}
