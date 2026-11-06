import type { Sport } from "@/config/sports";
import {
  dataOrThrow,
  getMatch,
  getMatchStats,
  getMotorSportMatch,
  getRaceStats,
  type MatchStats,
} from "@/core";
import { useResource } from "@/hooks/useResource";

import { isRace, type Fixture } from "../adapters";

/**
 * The match page's reads of the public API. Like the hub's, each loads in the
 * browser and is shared by every component that asks for it.
 */

/**
 * One match or race by its readable id; `null` when it isn't found.
 *
 * Races and matches have separate endpoints, and `sport` (from the link) says
 * which one holds it. A link without a sport tries the match first and the
 * race only after a 404.
 */
export function useFixture(matchId: string, sport: Sport | null) {
  return useResource<Fixture | null>({
    key: `match/${matchId}?sport=${sport ?? ""}`,
    load: async () => {
      const race = async () =>
        dataOrThrow<Fixture | null>(await getMotorSportMatch(matchId), null);
      if (sport === "racing") return race();
      const match = dataOrThrow<Fixture | null>(await getMatch(matchId), null);
      return match ?? (sport ? null : race());
    },
  });
}

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
        ? {
            key: `raceStats/${fixture.matchId}`,
            load: () => getRaceStats(fixture.matchId).then((r) => dataOrThrow(r, null)),
          }
        : {
            key: `matchStats/${fixture.matchId}`,
            load: () => getMatchStats(fixture._id).then((r) => dataOrThrow(r, null)),
          },
  );
}
