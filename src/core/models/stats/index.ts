import { z } from "zod";

import type { Sport } from "@/config/sports";

import type { BasketballSummary } from "./basketball";
import type { CricketSummary } from "./cricket";
import type { FootballSummary } from "./football";
import type { RaceSummary } from "./race";

export type { BasketballSummary } from "./basketball";
export type { CricketSummary } from "./cricket";
export type { FootballSummary } from "./football";
export type { RaceSummary } from "./race";
export type { DeepNullable, StatsLocation, StatsSide } from "./shared";

/**
 * A summary is checked only for being an object. Its types already let every
 * field be null at every depth, so the screens guard each read anyway, and
 * checking 30 to 50 KB field by field would reject a whole match for one odd
 * value deep inside it.
 */
function summarySchema<TSummary>() {
  return z.custom<TSummary>(
    (value) => typeof value === "object" && value !== null,
    "matchSummary is not an object",
  );
}

/** The stats the server holds for one match or race. */
function statsRecordSchema<G extends Sport, TSummary>(gameType: G) {
  return z.object({
    _id: z.string(),
    /** The readable id of the match or race, such as "IPL-M12". */
    matchUniqueId: z.string(),
    /** The `_id` of the match or race. */
    matchId: z.string(),
    espnId: z.string(),
    gameType: z.literal(gameType),
    /** Times inside it are strings as the stats provider sends them. */
    matchSummary: summarySchema<TSummary>(),
    /** When the stats were last refreshed. */
    fetchedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  });
}

export const raceStatsSchema = statsRecordSchema<"racing", RaceSummary>(
  "racing",
);
export type RaceStats = z.infer<typeof raceStatsSchema>;

/**
 * What the match stats endpoint answers with. Narrow on `gameType` to get the
 * matching `matchSummary`. A race is included because the endpoint also accepts
 * a race's `_id`.
 */
export const matchStatsSchema = z.discriminatedUnion("gameType", [
  statsRecordSchema<"football", FootballSummary>("football"),
  statsRecordSchema<"cricket", CricketSummary>("cricket"),
  statsRecordSchema<"basketball", BasketballSummary>("basketball"),
  raceStatsSchema,
]);
export type MatchStats = z.infer<typeof matchStatsSchema>;
