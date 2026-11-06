import { z } from "zod";

import { matchEventSchema } from "./match.model";
import { teamSchema } from "./team";
import { pickTournamentSchema, tournamentSummarySchema } from "./tournament";

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

/** One prediction by id, with its pools and odds. The player's bets aren't included. */
export const predictionDetailResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    _id: z.string(),
    predictionId: z.string(),
    coinsOnTeamA: z.number(),
    coinsOnTeamB: z.number(),
    initialCoinsOnTeamA: z.number(),
    initialCoinsOnTeamB: z.number(),
    tournament: z.string(),
    predictionStatus: predictionStatusSchema,
    isVisible: z.boolean(),
    createdAt: z.string(),
    tournamentData: pickTournamentSchema,
    teamA: teamSchema,
    teamB: teamSchema,
    matchId: z.string(),
    gameType: z.string(),
    matchEvent: matchEventSchema.nullable(),
    matchEventEspnId: z.string().nullable(),
    matchStartTime: z.string(),
    coinsOnDraw: z.number(),
    initialCoinsOnDraw: z.number(),
    totalCoins: z.number(),
    oddsTeamA: z.number(),
    oddsTeamB: z.number(),
    oddsDraw: z.number().nullable(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type PredictionDetail = z.infer<
  typeof predictionDetailResponseSchema
>["data"];

export type SubmitPredictionBody = {
  teamChosen: PredictionSide;
  coinsBet: number;
};

/** The prediction with its pools and odds after the bet, not the bet itself. */
export const submitPredictionResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    _id: z.string(),
    predictionId: z.string(),
    matchId: z.string(),
    coinsOnTeamA: z.number(),
    coinsOnTeamB: z.number(),
    initialCoinsOnTeamA: z.number(),
    initialCoinsOnTeamB: z.number(),
    tournament: z.string(),
    predictionStatus: predictionStatusSchema,
    isVisible: z.boolean(),
    coinsOnDraw: z.number(),
    initialCoinsOnDraw: z.number(),
    pickType: predictionPickTypeSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
    __v: z.number(),
    totalCoins: z.number(),
    oddsTeamA: z.number(),
    oddsTeamB: z.number(),
    oddsDraw: z.number().nullable(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type SubmitPredictionResponse = z.infer<
  typeof submitPredictionResponseSchema
>;

/*
 * The player's bets on one prediction, newest first; `[]` with none.
 * `payoutStatus` is `PENDING` until settled, then `PAID` or `LOST`.
 */
export const userPredictionBetSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  predictionId: z.string(),
  /** `A`, `B` or `D` (draw). */
  teamChosen: z.string(),
  coinsBet: z.number(),
  coinsWon: z.number(),
  totalCoinsReceived: z.number(),
  optionOddsAtBetTime: z.record(z.string(), z.number()),
  submissionTime: z.string(),
  payoutStatus: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
  prediction: z.object({
    _id: z.string(),
    predictionId: z.string(),
    matchId: z.string(),
    coinsOnTeamA: z.number(),
    coinsOnTeamB: z.number(),
    tournament: z.string(),
    predictionStatus: z.string(),
    coinsOnDraw: z.number(),
    pickType: z.string(),
    winningTeam: z.string().optional(),
    winningTeamId: z.string().optional(),
  }),
});
export type UserPredictionBet = z.infer<typeof userPredictionBetSchema>;

export const userPredictionBetsResponseSchema = z.object({
  statusCode: z.number(),
  data: z.array(userPredictionBetSchema),
  message: z.string(),
  success: z.boolean(),
});
export type UserPredictionBetsResponse = z.infer<
  typeof userPredictionBetsResponseSchema
>;

/**
 * How a prediction's odds moved: one point per bet, oldest first, each the
 * odds right after it. A bet with no saved snapshot is `{}`.
 */
export const predictionOddsResponseSchema = z.object({
  statusCode: z.number(),
  data: z.array(
    z.object({
      /** `A`, `B` and, in football, `D`. */
      optionOddsAtBetTime: z.record(z.string(), z.number()).optional(),
      createdAt: z.string().optional(),
    }),
  ),
  message: z.string(),
  success: z.boolean(),
});
export type PredictionOddsResponse = z.infer<
  typeof predictionOddsResponseSchema
>;
