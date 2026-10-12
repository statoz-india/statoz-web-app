import type { StatsGameType } from "@/core/domain/types/game-types";

import type { BasketballSummary } from "./basketball-stats-model";
import type { CricketSummary } from "./cricket-stats-model";
import type { FootballSummary } from "./football-stats-model";
import type { RaceSummary } from "./race-stats-model";

/** The stats the server holds for one match or race. */
export type StatsRecord<G extends StatsGameType, TSummary> = {
  _id: string;
  /** The readable id of the match or race, such as "IPL-M12". */
  matchUniqueId: string;
  /** The `_id` of the match or race. */
  matchId: string;
  espnId: string;
  gameType: G;
  /** Times inside it are strings as the stats provider sends them. */
  matchSummary: TSummary;
  /** When the stats were last refreshed. */
  fetchedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RaceStats = StatsRecord<"racing", RaceSummary>;

/**
 * What the match stats endpoint answers with. Narrow on `gameType` to get the
 * matching `matchSummary`. A race is included because the endpoint also accepts
 * a race's `_id`.
 */
export type MatchStats =
  | StatsRecord<"football", FootballSummary>
  | StatsRecord<"cricket", CricketSummary>
  | StatsRecord<"basketball", BasketballSummary>
  | RaceStats;
