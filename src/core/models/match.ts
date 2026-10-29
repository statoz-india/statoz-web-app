import { z } from "zod";

import type { Sport } from "@/config/sports";

import { teamSchema } from "./team";

/*
 * Values are case-sensitive, and the casing differs between entities: a team
 * match is `upcoming`, a race is `Upcoming`, a quiz is `UPCOMING`. Compare
 * against the exact string for the entity in hand.
 */

/**
 * The state of a football, cricket or basketball match. Lower case, and
 * `canceled` has one L here; every other entity spells it with two.
 *
 * `upcoming`, `live` and `result` are set automatically from the start time
 * and the live feed. The rest are set by an admin.
 */
export const matchStatusSchema = z.enum([
  "upcoming",
  "live",
  "result",
  "canceled",
  "no_result",
  "postponed",
  "unresolved",
  "abandoned",
  "suspended",
]);
export type MatchStatus = z.infer<typeof matchStatusSchema>;

/** The state of a race. Capitalised, unlike a team match's. */
export const raceStatusSchema = z.enum([
  "Upcoming",
  "Ongoing",
  "Finished",
  "Cancelled",
]);
export type RaceStatus = z.infer<typeof raceStatusSchema>;

/** The live feed's snapshot. Nothing in it is read field by field yet. */
export const matchEventSchema = z.object({
  id: z.unknown(),
  uid: z.unknown(),
  name: z.unknown(),
  shortName: z.unknown(),
  home: z.unknown(),
  away: z.unknown(),
  score: z.unknown(),
  status: z.unknown(),
  startTime: z.unknown(),
  endTime: z.unknown(),
  homeTeamScore: z.unknown(),
  awayTeamScore: z.unknown(),
  summary: z.unknown(),
});
export type MatchEvent = z.infer<typeof matchEventSchema>;

export const matchesSchema = z.object({
  _id: z.string(),
  matchId: z.string(),
  matchStartTime: z.string(),
  matchStatus: matchStatusSchema,
  /** Null until the feed has data. */
  matchEvent: matchEventSchema.nullable(),
  matchBanner: z.string().nullable(),
  tag: z.string(),
  gameType: z.string(),
  tournament: z.string(),
  espnLeagueName: z.string(),
  teamA: teamSchema,
  teamB: teamSchema,
  /** Empty when the match has no quiz. Opening one needs a login. */
  quizIds: z.array(z.string()),
  /** Empty when the match has no pick. Placing one needs a login. */
  predictionIds: z.array(z.string()),
  /** Coins on the match's markets. */
  predictionVolume: z.number(),
  eventVolume: z.number(),
  totalVolume: z.number(),
  createdAt: z.string(),
});
export type Matches = z.infer<typeof matchesSchema>;

/** The backend leaves an unset field out of a race instead of sending null. */
export const motorSportMatchesSchema = z.object({
  _id: z.string(),
  matchId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tournament: z.string(),
  tournamentId: z.string(),
  seasonYear: z.string(),
  tag: z.string().optional(),
  gameType: z.literal("racing"),
  matchStatus: raceStatusSchema,
  raceEventStartDate: z.string(),
  raceEventStopDate: z.string(),
  /** Missing while the race has no session time yet. */
  raceStartTime: z.string().optional(),
  espnLeagueName: z.string().optional(),
  summary: z.unknown().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type MotorSportMatches = z.infer<typeof motorSportMatchesSchema>;

/** What a section's `matches` holds: races for `racing`, fixtures otherwise. */
export type MatchFor<G extends Sport> = G extends "racing"
  ? MotorSportMatches
  : Matches;

/** The schema for {@link MatchFor}. */
export function matchForSchema<G extends Sport>(
  gameType: G,
): z.ZodType<MatchFor<G>> {
  // TypeScript cannot narrow a conditional type on a runtime check, so the
  // pick is asserted once here.
  return (gameType === "racing"
    ? motorSportMatchesSchema
    : matchesSchema) as unknown as z.ZodType<MatchFor<G>>;
}
