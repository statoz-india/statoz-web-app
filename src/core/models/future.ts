import { z } from "zod";

import { listOf } from "./list-of";
import { teamSchema } from "./team";
import { tournamentSummarySchema } from "./tournament";

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
