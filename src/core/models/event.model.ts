import { z } from "zod";

import { teamSchema } from "./team";
import { pickTournamentSchema, tournamentSummarySchema } from "./tournament";

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
  /** The description and images are missing from a match's event list. */
  eventDescription: z.string().optional(),
  eventImage: z.string().optional(),
  eventDescriptionImage: z.string().nullable().optional(),
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

/** One event by id, with its pools and odds. The player's bets aren't included. */
export const eventDetailResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    _id: z.string(),
    eventId: z.string(),
    /** The tournament's id, not its code. */
    tournament: z.string(),
    /** The match fields are only there when the event belongs to one. */
    matchId: z.string().nullable().optional(),
    eventName: z.string(),
    haveThreeOptions: z.boolean(),
    yesPlaceholder: z.string(),
    noPlaceholder: z.string(),
    coinsOnYes: z.number(),
    coinsOnNo: z.number(),
    initialCoinsOnYes: z.number(),
    initialCoinsOnNo: z.number(),
    eventStatus: eventStatusSchema,
    entryStartTime: z.string(),
    entryCloseTime: z.string(),
    pickType: eventPickTypeSchema,
    yesPlaceholderColor: z.string(),
    noPlaceholderColor: z.string(),
    yesTextColor: z.string(),
    noTextColor: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    tournamentData: pickTournamentSchema,
    matchStartTime: z.string().nullable().optional(),
    teamA: teamSchema.nullable().optional(),
    teamB: teamSchema.nullable().optional(),
    matchEventEspnId: z.string().nullable(),
    maybePlaceholder: z.string().nullable(),
    maybePlaceholderColor: z.string().nullable(),
    maybeTextColor: z.string().nullable(),
    isRacingMatchEvent: z.boolean(),
    /** Internal. */
    coinsOnMaybe: z.number().nullable(),
    initialCoinsOnMaybe: z.number().nullable(),
    totalCoins: z.number(),
    /** Each option's share of `totalCoins`, in %. */
    oddsYes: z.number(),
    oddsNo: z.number(),
    /** Null with two options. */
    oddsMaybe: z.number().nullable(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type EventDetail = z.infer<typeof eventDetailResponseSchema>["data"];

export type SubmitEventBetBody = {
  /** `M` only when the event has three options. */
  chosenOption: EventOption;
  /** At least 1, and no more than the player's coins. */
  coinsBet: number;
};

/**
 * The event with its pools and odds after the bet, plus the bet. The odds are
 * `yesOdds`… here, where `GET /events/:id` calls them `oddsYes`….
 */
export const submitEventBetResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    _id: z.string(),
    eventId: z.string(),
    tournament: z.string(),
    matchId: z.string().nullable().optional(),
    eventName: z.string(),
    haveThreeOptions: z.boolean(),
    yesPlaceholder: z.string(),
    noPlaceholder: z.string(),
    coinsOnYes: z.number(),
    coinsOnNo: z.number(),
    initialCoinsOnYes: z.number(),
    initialCoinsOnNo: z.number(),
    eventStatus: eventStatusSchema,
    createdBy: z.string(),
    entryStartTime: z.string(),
    entryCloseTime: z.string(),
    pickType: eventPickTypeSchema,
    yesPlaceholderColor: z.string(),
    noPlaceholderColor: z.string(),
    maybePlaceholderColor: z.string().nullable(),
    yesTextColor: z.string(),
    noTextColor: z.string(),
    maybeTextColor: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    __v: z.number(),
    totalCoins: z.number(),
    yesOdds: z.number(),
    noOdds: z.number(),
    maybeOdds: z.number().nullable(),
    submission: z.object({
      userId: z.string(),
      eventId: z.string(),
      chosenOption: eventOptionSchema,
      coinsBet: z.number(),
      /** The chosen option's odds when the bet was placed. */
      oddsChoice: z.number(),
      coinsWon: z.number(),
      totalCoinsReceived: z.number(),
      optionOddsAtBetTime: z.record(z.string(), z.number()),
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
export type SubmitEventBetResponse = z.infer<typeof submitEventBetResponseSchema>;

/*
 * The player's bets on one event, newest first; `[]` with none.
 * `payoutStatus` is `ONGOING` until settled, then `PAID` or `LOST`.
 */
export const userEventBetSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  eventId: z.string(),
  /** `Y`, `N` or `M`. */
  chosenOption: z.string(),
  coinsBet: z.number(),
  /** The chosen option's share of the pool (%) when the bet was placed. */
  oddsChoice: z.number(),
  coinsWon: z.number(),
  totalCoinsReceived: z.number(),
  optionOddsAtBetTime: z.record(z.string(), z.number()),
  submissionTime: z.string(),
  payoutStatus: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
  event: z.object({
    _id: z.string(),
    eventId: z.string(),
    tournament: z.string(),
    eventName: z.string(),
    haveThreeOptions: z.boolean(),
    yesPlaceholder: z.string(),
    noPlaceholder: z.string(),
    /** Only when set. */
    maybePlaceholder: z.string().optional(),
    eventImage: z.string().optional(),
    eventStatus: z.string(),
    entryStartTime: z.string(),
    entryCloseTime: z.string(),
  }),
});
export type UserEventBet = z.infer<typeof userEventBetSchema>;

export const userEventBetsResponseSchema = z.object({
  statusCode: z.number(),
  data: z.array(userEventBetSchema),
  message: z.string(),
  success: z.boolean(),
});
export type UserEventBetsResponse = z.infer<typeof userEventBetsResponseSchema>;

/**
 * How an event's odds moved: one point per bet, oldest first, each the odds
 * right after it. A bet with no saved snapshot is `{}`.
 */
export const eventOddsResponseSchema = z.object({
  statusCode: z.number(),
  data: z.array(
    z.object({
      /** `Y`, `N` and, with three options, `M`. */
      optionOddsAtBetTime: z.record(z.string(), z.number()).optional(),
      createdAt: z.string().optional(),
    }),
  ),
  message: z.string(),
  success: z.boolean(),
});
export type EventOddsResponse = z.infer<typeof eventOddsResponseSchema>;
