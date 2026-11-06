import { z } from "zod";

import { listOf } from "./list-of";
import { teamSchema } from "./team";
import { pickTournamentSchema, tournamentSummarySchema } from "./tournament";

/*
 * Values are case-sensitive, and the casing differs between entities: a team
 * match is `upcoming`, a race is `Upcoming`, a quiz is `UPCOMING`. Compare
 * against the exact string for the entity in hand.
 */

/**
 * The state of a future. A new one starts as `ACTIVE`. Futures have no
 * on-hold or void statuses, and the list endpoints leave out `DELETED` and
 * `CANCELLED` futures by default.
 */
export const futureStatusSchema = z.enum([
  "UPCOMING",
  "ACTIVE",
  "FINISHED",
  "CANCELLED",
  "DELETED",
  "SETTLEMENT_DONE",
  "WINNING_OPTION_UPDATED",
]);
export type FutureStatus = z.infer<typeof futureStatusSchema>;

/** Where a future submission's payout stands. It starts as `ONGOING`. */
export type FuturePayoutStatus =
  | "ONGOING"
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "PAID"
  | "FAILED"
  | "LOST";

/** A future's `pickType`. Set from the kind of record, and never changes. */
export const futurePickTypeSchema = z.literal("FUTURE");
export type FuturePickType = z.infer<typeof futurePickTypeSchema>;

export const futureChoiceSchema = z.object({
  _id: z.string(),
  choiceId: z.string(),
  choiceName: z.string(),
  choiceCoins: z.number(),
  initialCoinsOnChoice: z.number(),
  odds: z.number(),
  /** A choice with `false` must not be displayed. */
  isVisible: z.boolean(),
  placeholderColor: z.string(),
  textColor: z.string(),
  /** Null when the choice is not a team. */
  teamDetails: teamSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type FutureChoice = z.infer<typeof futureChoiceSchema>;

export const futureSchema = z.object({
  _id: z.string(),
  futureId: z.string(),
  eventName: z.string(),
  eventDescription: z.string(),
  eventImage: z.string(),
  futureStatus: futureStatusSchema,
  pickType: futurePickTypeSchema,
  entryStartTime: z.string(),
  entryCloseTime: z.string(),
  totalCoinsPlaced: z.number(),
  /** Null or missing until settled, then the winning choice. */
  correctChoice: futureChoiceSchema.nullable().optional(),
  tournamentData: tournamentSummarySchema,
  /** Sorted by `odds`, highest first. */
  choices: listOf(futureChoiceSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Future = z.infer<typeof futureSchema>;

/** One future by id, with its choices and odds. The player's bets aren't included. */
export const futureDetailResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    _id: z.string(),
    futureId: z.string(),
    eventName: z.string(),
    futureStatus: futureStatusSchema,
    entryStartTime: z.string(),
    entryCloseTime: z.string(),
    choices: listOf(futureChoiceSchema.extend({ __v: z.number() })),
    pickType: futurePickTypeSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
    __v: z.number(),
    /** Coins players have bet, without the seeds. */
    totalCoinsPlaced: z.number(),
    tournamentData: pickTournamentSchema,
  }),
  message: z.string(),
  success: z.boolean(),
});
export type FutureDetail = z.infer<typeof futureDetailResponseSchema>["data"];

export type SubmitFutureBetBody = {
  /** The choice's `_id`, not its `choiceId`. */
  futureChoiceId: string;
  /** At least 1, and no more than the player's coins. */
  coinsBet: number;
};

/** The future with its pools after the bet, and the bet. The choices carry no odds here. */
export const submitFutureBetResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    future: z.object({
      _id: z.string(),
      futureId: z.string(),
      tournament: z.string(),
      eventName: z.string(),
      futureStatus: futureStatusSchema,
      entryStartTime: z.string(),
      entryCloseTime: z.string(),
      choices: z.array(
        z.object({
          _id: z.string(),
          choiceId: z.string(),
          choiceName: z.string(),
          choiceCoins: z.number(),
          initialCoinsOnChoice: z.number(),
          isVisible: z.boolean(),
          placeholderColor: z.string(),
          textColor: z.string(),
          __v: z.number(),
          createdAt: z.string(),
          updatedAt: z.string(),
        }),
      ),
      pickType: futurePickTypeSchema,
      createdAt: z.string(),
      updatedAt: z.string(),
      __v: z.number(),
    }),
    submission: z.object({
      userId: z.string(),
      futureId: z.string(),
      futureChoiceId: z.string(),
      coinsBet: z.number(),
      oddsChoice: z.number(),
      /** Every choice's odds, keyed by `choiceId`. */
      choiceOddsAtBetTime: z.record(z.string(), z.number()),
      coinsWon: z.number(),
      totalCoinsReceived: z.number(),
      submissionTime: z.string(),
      payoutStatus: z.string(),
      _id: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
      __v: z.number(),
    }),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type SubmitFutureBetResponse = z.infer<typeof submitFutureBetResponseSchema>;

/*
 * The player's bets on one future, newest first; `[]` with none.
 * `payoutStatus` is `ONGOING` until settled, then `PAID` or `LOST`.
 */
export const userFutureBetSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  futureId: z.string(),
  /** The chosen choice itself here, not its id. */
  futureChoiceId: z.object({
    _id: z.string(),
    choiceId: z.string(),
    choiceName: z.string(),
    choiceCoins: z.number(),
    /** Only when set. */
    choiceImage: z.string().optional(),
  }),
  coinsBet: z.number(),
  /** The chosen choice's share of the pool (%) when the bet was placed. */
  oddsChoice: z.number(),
  /** Every choice's share (%) when the bet was placed, by `choiceId`. */
  choiceOddsAtBetTime: z.record(z.string(), z.number()),
  coinsWon: z.number(),
  totalCoinsReceived: z.number(),
  submissionTime: z.string(),
  payoutStatus: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
  future: z.object({
    _id: z.string(),
    futureId: z.string(),
    tournament: z.string(),
    eventName: z.string(),
    futureStatus: z.string(),
    entryStartTime: z.string(),
    entryCloseTime: z.string(),
  }),
});
export type UserFutureBet = z.infer<typeof userFutureBetSchema>;

export const userFutureBetsResponseSchema = z.object({
  statusCode: z.number(),
  data: z.array(userFutureBetSchema),
  message: z.string(),
  success: z.boolean(),
});
export type UserFutureBetsResponse = z.infer<typeof userFutureBetsResponseSchema>;

/**
 * How a future's odds moved: one point per bet, oldest first, each the odds
 * right after it, by `choiceId`. A bet with no saved snapshot is `{}`.
 */
export const futureOddsResponseSchema = z.object({
  statusCode: z.number(),
  data: z.array(
    z.object({
      choiceOddsAtBetTime: z.record(z.string(), z.number()).optional(),
      createdAt: z.string().optional(),
    }),
  ),
  message: z.string(),
  success: z.boolean(),
});
export type FutureOddsResponse = z.infer<typeof futureOddsResponseSchema>;
