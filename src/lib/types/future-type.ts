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
export type FutureStatus =
  | "UPCOMING"
  | "ACTIVE"
  | "FINISHED"
  | "CANCELLED"
  | "DELETED"
  | "SETTLEMENT_DONE"
  | "WINNING_OPTION_UPDATED";

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
export type FuturePickType = "FUTURE";
