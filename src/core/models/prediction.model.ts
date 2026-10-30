import { z } from "zod";

import { matchEventSchema } from "./match";
import { teamSchema } from "./team";
import { tournamentSummarySchema } from "./tournament";

/*
 * Values are case-sensitive, and the casing differs between entities: a team
 * match is `upcoming`, a race is `Upcoming`, a quiz is `UPCOMING`. Compare
 * against the exact string for the entity in hand.
 */

/** The state of a prediction. A new one starts as `ACTIVE`. */
export const predictionStatusSchema = z.enum([
  "UPCOMING",
  "ACTIVE",
  "LIVE",
  "FINISHED",
  "CANCELLED",
  "SETTLEMENT_DONE",
  "NOT_VISIBLE",
  "ADMIN_VISIBLE",
  "WINNING_TEAM_UPDATED",
  "ABANDONED",
  "NO_RESULT",
  "NOT_ENOUGH_DATA",
  "POSTPONED",
  "UNRESOLVED",
  "SUSPENDED",
]);
export type PredictionStatus = z.infer<typeof predictionStatusSchema>;

/**
 * Closed for entries, and left alone by the live sync and auto-settlement
 * until an admin reschedules or settles the prediction.
 */
export const PREDICTION_ON_HOLD_STATUSES = [
  "NOT_ENOUGH_DATA",
  "POSTPONED",
  "UNRESOLVED",
] as const satisfies readonly PredictionStatus[];

/** Closed for entries and never settled. */
export const PREDICTION_VOID_STATUSES = [
  "CANCELLED",
  "ABANDONED",
  "NO_RESULT",
] as const satisfies readonly PredictionStatus[];

/**
 * A side of a prediction: team A, team B, or `D` for a draw. It is the
 * prediction's `winningTeam` and a submission's `teamChosen`.
 */
export const predictionSideSchema = z.enum(["A", "B", "D"]);
export type PredictionSide = z.infer<typeof predictionSideSchema>;

/** Where a prediction submission's payout stands. It starts as `PENDING`. */
export type PredictionPayoutStatus =
  "PENDING" | "PROCESSING" | "COMPLETED" | "PAID" | "FAILED" | "LOST";

/** A prediction's `pickType`. Set from the kind of record, and never changes. */
export const predictionPickTypeSchema = z.literal("MATCH");
export type PredictionPickType = z.infer<typeof predictionPickTypeSchema>;

export const predictionSchema = z.object({
  _id: z.string(),
  predictionId: z.string(),
  predictionStatus: predictionStatusSchema,
  isVisible: z.boolean(),
  matchId: z.string(),
  matchStartTime: z.string(),
  matchEvent: matchEventSchema.nullable(),
  matchEventEspnId: z.string().nullable(),
  tag: z.string(),
  gameType: z.string(),
  espnLeagueName: z.string(),
  tournament: z.string(),
  tournamentData: tournamentSummarySchema,
  teamA: teamSchema,
  teamB: teamSchema,
  entryStartTime: z.string(),
  coinsOnTeamA: z.number(),
  coinsOnTeamB: z.number(),
  coinsOnDraw: z.number(),
  initialCoinsOnTeamA: z.number(),
  initialCoinsOnTeamB: z.number(),
  initialCoinsOnDraw: z.number(),
  totalCoins: z.number(),
  oddsTeamA: z.number(),
  oddsTeamB: z.number(),
  /** Null unless the match is football. */
  oddsDraw: z.number().nullable(),
  createdAt: z.string(),
  /** Both appear once the result is set. */
  winningTeam: predictionSideSchema.nullable().optional(),
  winningTeamId: z.string().optional(),
});
export type Prediction = z.infer<typeof predictionSchema>;
