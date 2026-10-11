/*
 * Values are case-sensitive, and the casing differs between entities: a team
 * match is `upcoming`, a race is `Upcoming`, a quiz is `UPCOMING`. Compare
 * against the exact string for the entity in hand.
 */

/** The state of an event. A new one starts as `ACTIVE`. */
export type EventStatus =
  | "UPCOMING"
  | "ACTIVE"
  | "FINISHED"
  | "CANCELLED"
  | "DELETED"
  | "SETTLEMENT_DONE"
  | "WINNING_OPTION_UPDATED"
  | "ABANDONED"
  | "NO_RESULT"
  | "NOT_ENOUGH_DATA"
  | "POSTPONED"
  | "UNRESOLVED"
  | "SUSPENDED";

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
export type EventOption = "Y" | "N" | "M";

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
export type EventPickType = "EVENT";
