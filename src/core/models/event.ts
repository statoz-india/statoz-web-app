import { z } from "zod";

import { tournamentSummarySchema } from "./tournament";

/*
 * Values are case-sensitive, and the casing differs between entities: a team
 * match is `upcoming`, a race is `Upcoming`, a quiz is `UPCOMING`. Compare
 * against the exact string for the entity in hand.
 */

/** The state of an event. A new one starts as `ACTIVE`. */
export const eventStatusSchema = z.enum([
  "UPCOMING",
  "ACTIVE",
  "FINISHED",
  "CANCELLED",
  "DELETED",
  "SETTLEMENT_DONE",
  "WINNING_OPTION_UPDATED",
  "ABANDONED",
  "NO_RESULT",
  "NOT_ENOUGH_DATA",
  "POSTPONED",
  "UNRESOLVED",
  "SUSPENDED",
]);
export type EventStatus = z.infer<typeof eventStatusSchema>;

/**
 * Closed for entries, and left alone by the live sync and auto-settlement
 * until an admin reschedules or settles the event.
 */
export const EVENT_ON_HOLD_STATUSES = [
  "NOT_ENOUGH_DATA",
  "POSTPONED",
  "UNRESOLVED",
] as const satisfies readonly EventStatus[];

/**
 * The match produced no result: closed for entries and never settled.
 * `CANCELLED` is not in this group for an event, unlike a prediction.
 */
export const EVENT_VOID_STATUSES = [
  "ABANDONED",
  "NO_RESULT",
] as const satisfies readonly EventStatus[];

/**
 * An event's options: yes, no, and maybe. `M` is only used when the event has
 * `haveThreeOptions: true`. It is the event's `winningOption` and a
 * submission's `chosenOption` and `optionWon`.
 */
export const eventOptionSchema = z.enum(["Y", "N", "M"]);
export type EventOption = z.infer<typeof eventOptionSchema>;

/** Where an event submission's payout stands. It starts as `ONGOING`. */
export type EventPayoutStatus =
  | "ONGOING"
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "PAID"
  | "FAILED"
  | "LOST";

/** An event's `pickType`. Set from the kind of record, and never changes. */
export const eventPickTypeSchema = z.literal("EVENT");
export type EventPickType = z.infer<typeof eventPickTypeSchema>;

export const eventSchema = z.object({
  _id: z.string(),
  eventId: z.string(),
  eventName: z.string(),
  eventDescription: z.string(),
  eventImage: z.string(),
  eventDescriptionImage: z.string().nullable(),
  eventStatus: eventStatusSchema,
  pickType: eventPickTypeSchema,
  isRacingMatchEvent: z.boolean(),
  /** The tournament's id here, not its code as on a fixture. */
  tournament: z.string(),
  tournamentData: tournamentSummarySchema,
  haveThreeOptions: z.boolean(),
  yesPlaceholder: z.string(),
  noPlaceholder: z.string(),
  maybePlaceholder: z.string().nullable(),
  yesPlaceholderColor: z.string(),
  noPlaceholderColor: z.string(),
  maybePlaceholderColor: z.string().nullable(),
  yesTextColor: z.string(),
  noTextColor: z.string(),
  maybeTextColor: z.string().nullable(),
  entryStartTime: z.string(),
  entryCloseTime: z.string(),
  coinsOnYes: z.number(),
  coinsOnNo: z.number(),
  coinsOnMaybe: z.number().nullable(),
  initialCoinsOnYes: z.number(),
  initialCoinsOnNo: z.number(),
  initialCoinsOnMaybe: z.number().nullable(),
  totalCoins: z.number(),
  oddsYes: z.number(),
  oddsNo: z.number(),
  oddsMaybe: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  /** Appears once the result is set. */
  winningOption: eventOptionSchema.optional(),
});
export type Event = z.infer<typeof eventSchema>;
